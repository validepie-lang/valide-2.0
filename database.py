"""
SISTEMA VALIDE - Módulo de Banco de Dados e Regras de Negócio
=============================================================
Projeto Acadêmico (ADS) - Controle de Validade de Medicamentos para Farmácias.

Este módulo concentra TUDO relacionado à camada de dados e as regras
de negócio do sistema. Foi projetado com arquitetura de "dual-engine",
ou seja, funciona COM O MESMO CÓDIGO tanto com PostgreSQL (Supabase,
ambiente de produção em nuvem) quanto com SQLite (banco de arquivo
local para desenvolvimento offline, testes rápidos ou fallback).

Principais responsabilidades implementadas aqui:
  1. Conexão automática com PostgreSQL (Supabase) OU SQLite (fallback)
  2. Relatório de validade SEMAFÓRICO: VERMELHO / AMARELO / VERDE / VENCIDO
  3. Estratégia de baixa de estoque FEFO (First Expire, First Out)
  4. Controle RBAC (3 níveis de perfil): Balconista / Farmacêutico / Admin
  5. Auditoria IMUTÁVEL: TUDO é gravado no histórico de movimentação

-----------------------------------------------------------------------------
COMO USAR (Configuração no arquivo .env):
-----------------------------------------------------------------------------
  >> MODO SQLITE (offline / teste rápido / fallback):
        DB_ENGINE=sqlite
        SQLITE_PATH=./data/valide.db

  >> MODO POSTGRESQL / SUPABASE (nuvem / homologação / produção):
        DB_ENGINE=postgres
        SUPABASE_HOST=...
        SUPABASE_PORT=5432
        SUPABASE_DB=postgres
        SUPABASE_USER=...
        SUPABASE_PASSWORD=...
        SUPABASE_SSLMODE=require
-----------------------------------------------------------------------------

Autor: Equipe Valide - Projeto Pitch / ADS
"""

# -------------------------------------------------------------------------
# BIBLIOTECAS PADRÃO UTILIZADAS
# -------------------------------------------------------------------------
import os
import sys
import sqlite3
from dataclasses import dataclass
from datetime import date
from enum import Enum
from pathlib import Path
from typing import List, Optional, Dict, Any

# Carrega as variáveis de ambiente do arquivo .env (credenciais do banco)
from dotenv import load_dotenv
load_dotenv()


# ============================================================
# SEÇÃO 1 - DETECÇÃO DO MOTOR DE BANCO E CONFIGURAÇÃO BASE
# ------------------------------------------------------------
# Aqui lemos a variável DB_ENGINE do .env e ajustamos o
# comportamento do código para a sintaxe do banco selecionado.
# (SQLite usa placeholders :nome e inteiros 0/1 para booleano;
#  PostgreSQL usa %(nome)s e TRUE/FALSE.)
# ============================================================
DB_ENGINE = os.getenv("DB_ENGINE", "sqlite").lower()
SQLITE_PATH = os.getenv("SQLITE_PATH",
                        str(Path(__file__).parent / "data" / "valide.db"))


# -------------------------------------------------------------------------
# Carrega o driver do PostgreSQL (psycopg2) SOMENTE se o usuário pediu
# modo postgres. Se a biblioteca não estiver instalada, fazemos FALLBACK
# AUTOMÁTICO para SQLite, com aviso no terminal, para não quebrar o fluxo.
# -------------------------------------------------------------------------
if DB_ENGINE == "postgres":
    try:
        import psycopg2
        from psycopg2 import OperationalError
        from psycopg2.extras import RealDictCursor
    except ImportError:
        print("[AVISO] PostgreSQL selecionado, mas a biblioteca 'psycopg2'"
              " não foi encontrada.")
        print("         Instale com: pip install psycopg2-binary")
        print("         Utilizando fallback automático para SQLite.\n")
        DB_ENGINE = "sqlite"

# Garante que apenas dois valores válidos existam para o motor
if DB_ENGINE != "postgres":
    DB_ENGINE = "sqlite"

# Constantes para comparação de valores booleanos (dual-engine)
SQL_BOOL_TRUE = "TRUE" if DB_ENGINE == "postgres" else "1"
SQL_BOOL_FALSE = "FALSE" if DB_ENGINE == "postgres" else "0"


# ============================================================
# SEÇÃO 2 - ENUMS (TIPOS SEGUROS / VALORES DE DOMÍNIO)
# ------------------------------------------------------------
# Usamos Enums ao invés de "strings soltas" para evitar erros
# de digitação e deixar o código mais legível. Esses valores
# batem com os CHECK CONSTRAINTS das tabelas no banco.
# ============================================================

class TipoMovimentacao(Enum):
    """
    Tipos válidos de lançamento no histórico de auditoria.
    São os mesmos valores permitidos pela constraint do banco.
    """
    VENDA = "VENDA"         # Saída comercial (cliente)
    DESCARTE = "DESCARTE"   # Saída para incineração / descarte
    AJUSTE = "AJUSTE"       # Ajuste de contagem / avaria
    ENTRADA = "ENTRADA"     # Entrada de mercadoria (compra / devolução)


class ClassificacaoValidade(Enum):
    """
    Classificação semafórica do lote com base nos dias restantes
    para o vencimento. Usada no relatório e em dashboards.
    """
    VENCIDO = "VENCIDO"     # Dias <= 0 (perda total)
    VERMELHO = "VERMELHO"   # Crítico (até 30 dias)
    AMARELO = "AMARELO"     # Atenção (31 a 60 dias)
    VERDE = "VERDE"         # Seguro (acima de 60 dias)


class NivelPerfil(Enum):
    """
    Níveis de acesso do RBAC. Quanto MAIOR o número, MAIS permissões.
      Nível 1 = Balconista  (vender / dar entrada / consultar)
      Nível 2 = Farmacêutico (mesmo do 1 + autorizar descartes / ajustes)
      Nível 3 = Admin (acesso total / gestão de usuários)
    """
    BALCONISTA = 1
    FARMACEUTICO = 2
    ADMIN = 3


# ============================================================
# SEÇÃO 3 - PARÂMETROS DE CLASSIFICAÇÃO E CORES (UI TERMINAL)
# ============================================================

# Limites, em dias, para cada faixa do alerta de validade
LIMITE_VERMELHO = 30   # Acima de 0 e <= LIMITE_VERMELHO = alerta VERMELHO
LIMITE_AMARELO = 60    # Até LIMITE_AMARELO = alerta AMARELO

# Dicionário com os códigos ANSI para colorir o terminal
# (códigos de escape que ativam as cores na saída padrão)
CORES = {
    ClassificacaoValidade.VERDE:      "\033[92m",   # Verde claro
    ClassificacaoValidade.AMARELO:    "\033[93m",   # Amarelo
    ClassificacaoValidade.VERMELHO:   "\033[91m",   # Vermelho
    ClassificacaoValidade.VENCIDO:    "\033[41m\033[97m",  # Fundo vermelho + branco
    "RESET":                          "\033[0m",    # Volta para a cor padrão
}


# ============================================================
# SEÇÃO 4 - EXCEÇÕES DE NEGÓCIO (ERROS ESPERADOS)
# ------------------------------------------------------------
# Ao invés de lançar Exception genérica, criamos exceções
# específicas para cada caso. Isso permite que o front-end
# (ou CLI) trate cada erro com uma mensagem adequada.
# ============================================================

class ValideError(Exception):
    """Classe BASE para TODOS os erros de negócio do sistema Valide."""
    pass


class PermissaoInsuficienteError(ValideError):
    """Levantada quando o usuário tenta executar algo SEM o perfil necessário."""
    pass


class EstoqueInsuficienteError(ValideError):
    """Levantada quando a quantidade pedida é MAIOR que o saldo disponível."""
    pass


class LoteNaoEncontradoError(ValideError):
    """Levantada quando não existe nenhum lote ativo para o produto informado."""
    pass


class UsuarioNaoEncontradoError(ValideError):
    """Levantada quando o id de usuário informado não existe no banco."""
    pass


# ============================================================
# SEÇÃO 5 - DDL E DADOS INICIAIS (APENAS PARA SQLITE LOCAL)
# ------------------------------------------------------------
# Estes scripts são executados AUTOMATICAMENTE quando o SQLite
# é usado e o arquivo ainda não existia (primeira execução).
# No Supabase, usamos os arquivos SQL da pasta supabase/migrations
# para criar e popular as tabelas via SQL Editor.
# ============================================================

# Script DDL - Data Definition Language (cria as 5 tabelas + índices)
SQL_DDL_SQLITE = """
-- TABELA 1: PERFIL_ACESSO -> Dicionário de perfis (RBAC)
CREATE TABLE IF NOT EXISTS perfil_acesso (
    id_perfil   INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_perfil TEXT    NOT NULL UNIQUE,
    nivel       INTEGER NOT NULL UNIQUE CHECK (nivel IN (1,2,3)),
    descricao   TEXT,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABELA 2: USUARIOS -> Cadastro dos operadores do sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    login      TEXT    NOT NULL UNIQUE,
    senha_hash TEXT    NOT NULL,
    ativo      INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
    id_perfil  INTEGER NOT NULL,
    created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_perfil) REFERENCES perfil_acesso(id_perfil)
);

-- TABELA 3: PRODUTOS -> Cadastro mestre de medicamentos
CREATE TABLE IF NOT EXISTS produtos (
    id_produto      INTEGER PRIMARY KEY AUTOINCREMENT,
    ean             TEXT UNIQUE,
    nome_comercial  TEXT    NOT NULL,
    principio_ativo TEXT    NOT NULL,
    categoria       TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABELA 4: LOTES_ESTOQUE -> Cardex de lotes (saldos e validades)
CREATE TABLE IF NOT EXISTS lotes_estoque (
    id_lote            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produto         INTEGER NOT NULL,
    numero_lote        TEXT    NOT NULL,
    data_validade      TEXT    NOT NULL,
    quantidade_atual   INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_atual >= 0),
    quantidade_inicial INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_inicial >= 0),
    data_entrada       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario_entrada INTEGER NOT NULL,
    ativo              INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
    created_at         TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_produto, numero_lote),
    FOREIGN KEY (id_produto)         REFERENCES produtos(id_produto),
    FOREIGN KEY (id_usuario_entrada) REFERENCES usuarios(id_usuario)
);

-- TABELA 5: HISTORICO_MOVIMENTACAO -> LIVRO RAZÃO (auditoria IMUTÁVEL)
-- NUNCA pode haver UPDATE nem DELETE nesta tabela (enforçado via triggers
-- no PostgreSQL e via código Python nesta camada).
CREATE TABLE IF NOT EXISTS historico_movimentacao (
    id_movimentacao   INTEGER PRIMARY KEY AUTOINCREMENT,
    id_lote           INTEGER NOT NULL,
    id_usuario        INTEGER NOT NULL,
    tipo_movimentacao TEXT    NOT NULL CHECK (tipo_movimentacao IN
                                ('VENDA','DESCARTE','AJUSTE','ENTRADA')),
    quantidade        INTEGER NOT NULL CHECK (
                            (tipo_movimentacao = 'AJUSTE' AND quantidade <> 0)
                            OR (tipo_movimentacao <> 'AJUSTE' AND quantidade > 0)),
    data_registro     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    justificativa     TEXT,
    FOREIGN KEY (id_lote)    REFERENCES lotes_estoque(id_lote),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- ÍNDICES - Garantem performance nas consultas mais usadas
CREATE INDEX IF NOT EXISTS idx_lotes_prod_valid ON lotes_estoque(id_produto, data_validade);
CREATE INDEX IF NOT EXISTS idx_lotes_validade    ON lotes_estoque(data_validade);
CREATE INDEX IF NOT EXISTS idx_historico_lote    ON historico_movimentacao(id_lote);
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_movimentacao(id_usuario);
"""


# -------------------------------------------------------------------------
# SCRIPTS DE DADOS FICTÍCIOS (SEED / MOCK)
# Populam o banco com perfis, usuários, medicamentos, lotes e histórico
# para permitir demonstrações em sala e testes de regras de negócio.
# -------------------------------------------------------------------------
SQL_SEED = [

    # Limpa os dados (ordem inversa das FK para não violar integridade)
    """DELETE FROM historico_movimentacao; DELETE FROM lotes_estoque;
       DELETE FROM produtos; DELETE FROM usuarios; DELETE FROM perfil_acesso;""",

    # ---- 3 PERFIS DE ACESSO (RBAC) ----
    """INSERT INTO perfil_acesso (id_perfil, nome_perfil, nivel, descricao) VALUES
        (1,'Balconista',    1,'Cadastra entradas, visualiza alertas e registra vendas.'),
        (2,'Farmacêutico',  2,'Mesmo do Balconista + autoriza descartes e ajustes.'),
        (3,'Administrador', 3,'Acesso total. Gerencia usuários e configurações.')""",

    # ---- 4 USUÁRIOS DE TESTE ----
    # (Senhas são hashes fictícios; em produção usar bcrypt real.)
    """INSERT INTO usuarios (nome, login, senha_hash, ativo, id_perfil) VALUES
        ('Antônio Bezerra (Gerente)',        'admin',        '$2b$12$adminXXXX',        1, 3),
        ('Dra. Juliana Silva (Farmacêutica)','farmaceutico', '$2b$12$farmaceuticoXXXX', 1, 2),
        ('Carlos Mendes (Balconista)',       'balconista',   '$2b$12$balconistaXXXX',   1, 1),
        ('Mariana Costa (Estagiária)',       'mariana',      '$2b$12$marianaXXXX',      1, 1)""",

    # ---- 12 PRODUTOS (Medicamentos comuns em farmácias) ----
    """INSERT INTO produtos (ean, nome_comercial, principio_ativo, categoria) VALUES
        ('7891234567890','Dipirona Sódica 500mg',       'Dipirona Sódica',           'Analgésico / Antitérmico'),
        ('7891234567891','Paracetamol 750mg',           'Paracetamol',                'Analgésico / Antitérmico'),
        ('7891234567892','Ibuprofeno 600mg',            'Ibuprofeno',                 'Anti-inflamatório'),
        ('7891234567893','Amoxicilina 500mg',           'Amoxicilina',                'Antibiótico'),
        ('7891234567894','Azitromicina 500mg',          'Azitromicina Di-hidratada',  'Antibiótico'),
        ('7891234567895','Omeprazol 20mg',              'Omeprazol',                  'Protetor Gástrico'),
        ('7891234567896','Losartana Potássica 50mg',    'Losartana Potássica',        'Anti-hipertensivo'),
        ('7891234567897','Metformina 850mg',            'Cloridrato de Metformina',   'Antidiabético'),
        ('7891234567898','Simvastatina 20mg',           'Simvastatina',               'Redutor de Colesterol'),
        ('7891234567899','AAS 100mg',                   'Ácido Acetilsalicílico',     'Antiagregante Plaquetário'),
        ('7891234567800','Diclofenaco Potássico 50mg',  'Diclofenaco Potássico',      'Anti-inflamatório'),
        ('7891234567801','Cetirizina 10mg',             'Cetirizina',                 'Antialérgico')""",

    # ---- LOTES DE ESTOQUE com várias datas para testar a classificação ----
    # (SQLite usa funções date()/datetime() com deslocamento em dias.)
    f"""INSERT INTO lotes_estoque
          (id_produto, numero_lote, data_validade, quantidade_atual,
           quantidade_inicial, data_entrada, id_usuario_entrada, ativo) VALUES

        -- LOTES VENCIDOS (dias negativos - para descarte)
        (1,'LOT-DIP-2312V',date('now','-15 days'), 5,100,datetime('now','-90 days'), 3, 1),
        (2,'LOT-PAR-2311V',date('now','-30 days'), 8, 80,datetime('now','-120 days'),3, 1),

        -- LOTES VERMELHOS (vencem em até 30 dias a partir de hoje)
        (1,'LOT-DIP-2405A',date('now','+5 days'),  20,100,datetime('now','-30 days'), 3, 1),
        (2,'LOT-PAR-2406B',date('now','+12 days'), 15, 80,datetime('now','-25 days'), 3, 1),
        (3,'LOT-IBU-2404C',date('now','+25 days'), 40,200,datetime('now','-20 days'), 3, 1),

        -- LOTES AMARELOS (vencem entre 31 e 60 dias)
        (4,'LOT-AMO-2408D',date('now','+40 days'), 30,120,datetime('now','-45 days'), 3, 1),
        (5,'LOT-AZI-2409E',date('now','+50 days'), 18, 60,datetime('now','-40 days'), 3, 1),
        (6,'LOT-OME-2410F',date('now','+55 days'), 25,100,datetime('now','-35 days'), 3, 1),

        -- LOTES VERDES (vencem em mais de 60 dias)
        ( 7,'LOT-LOS-2501G',date('now','+90 days'),  60,200,datetime('now','-15 days'),3, 1),
        ( 8,'LOT-MET-2502H',date('now','+120 days'), 80,300,datetime('now','-10 days'),3, 1),
        ( 9,'LOT-SIM-2503I',date('now','+180 days'), 45,150,datetime('now','-5 days'), 3, 1),
        (10,'LOT-AAS-2504J',date('now','+240 days'), 70,250,datetime('now','-2 days'), 3, 1),
        (11,'LOT-DIC-2505K',date('now','+150 days'), 35,120,datetime('now','-8 days'), 3, 1),
        (12,'LOT-CET-2506L',date('now','+200 days'), 50,180,datetime('now','-3 days'), 3, 1)""",

    # ---- HISTÓRICO DE MOVIMENTAÇÃO (movimentações de demonstração) ----
    """INSERT INTO historico_movimentacao
          (id_lote, id_usuario, tipo_movimentacao, quantidade, data_registro, justificativa) VALUES

        -- Entradas (notas fiscais fictícias)
        (1,  3,'ENTRADA',100,datetime('now','-30 days'),'Nota Fiscal de Compra #1001'),
        (2,  3,'ENTRADA', 80,datetime('now','-25 days'),'Nota Fiscal de Compra #1002'),
        (3,  3,'ENTRADA',200,datetime('now','-20 days'),'Nota Fiscal de Compra #1003'),
        (7,  3,'ENTRADA',200,datetime('now','-15 days'),'Nota Fiscal de Compra #1004'),
        (8,  3,'ENTRADA',300,datetime('now','-10 days'),'Nota Fiscal de Compra #1005'),

        -- Vendas realizadas pelo Balconista Carlos (id=3)
        (1, 3,'VENDA',  80,datetime('now','-20 days'),'Atendimento balcão - Cliente: João P.'),
        (2, 3,'VENDA',  65,datetime('now','-15 days'),'Atendimento balcão - Cliente: Maria S.'),
        (3, 3,'VENDA', 160,datetime('now','-12 days'),'Atendimento balcão - Cliente: Pedro A.'),

        -- Ajustes de estoque realizados pela Farmacêutica Juliana (id=2)
        (7, 2,'AJUSTE',  5,datetime('now','-5 days'), 'Contagem física - divergência (-5 unidades)'),
        (8, 2,'AJUSTE',  2,datetime('now','-2 days'), 'Produto avariado no recebimento (-2 un.)')""",
]


# ============================================================
# SEÇÃO 6 - CLASSE DE CONEXÃO UNIFICADA (DUAL-ENGINE)
# ------------------------------------------------------------
# Encapsula TODOS os detalhes de diferenças entre PostgreSQL
# e SQLite: placeholders, data, retornos de consulta, etc.
# O resto do código usa sempre estes métodos e NÃO PRECISA
# saber qual banco está rodando por baixo.
# ============================================================
class DatabaseConnection:
    """
    Fachada de conexão e execução SQL.
    Todos os métodos são estáticos (não guardam estado).
    """

    @staticmethod
    def get_connection():
        """
        Ponto de entrada: retorna uma conexão ABERTA com o banco
        configurado no .env (postgres ou sqlite).
        """
        if DB_ENGINE == "postgres":
            return DatabaseConnection._get_postgres_conn()
        return DatabaseConnection._get_sqlite_conn()

    # --------------------------------------------------------------
    @staticmethod
    def _get_postgres_conn():
        """
        Abre conexão com PostgreSQL/Supabase usando as variáveis SUPABASE_*
        do .env. Falta de alguma variável OU erro de rede levanta exceção.
        """
        required = ["SUPABASE_HOST", "SUPABASE_PORT", "SUPABASE_DB",
                    "SUPABASE_USER", "SUPABASE_PASSWORD"]
        faltando = [var for var in required if not os.getenv(var)]
        if faltando:
            raise ValideError(
                "Variáveis do Supabase ausentes no arquivo .env: "
                + ", ".join(faltando)
            )
        try:
            conn = psycopg2.connect(
                host=os.getenv("SUPABASE_HOST"),
                port=os.getenv("SUPABASE_PORT", "5432"),
                dbname=os.getenv("SUPABASE_DB", "postgres"),
                user=os.getenv("SUPABASE_USER"),
                password=os.getenv("SUPABASE_PASSWORD"),
                sslmode=os.getenv("SUPABASE_SSLMODE", "require"),
            )
            # Controlamos transação manualmente (commit/rollback explícitos)
            conn.autocommit = False
            return conn
        except OperationalError as erro:
            raise ValideError(
                f"Falha na conexão com PostgreSQL/Supabase: {erro}"
            ) from erro

    # --------------------------------------------------------------
    @staticmethod
    def _get_sqlite_conn():
        """
        Abre conexão com arquivo SQLite local.
        Se o arquivo não existir, cria e popula DDL+SEED automaticamente.
        """
        db_path = Path(SQLITE_PATH)
        primeira_vez = not db_path.exists()
        db_path.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row                # Resultados viram dicionários
        conn.execute("PRAGMA foreign_keys = ON;")    # Ativa integridade referencial
        conn.isolation_level = None                  # Autocommit OFF (manual)

        if primeira_vez:
            print(f"\n[SQLite] Banco novo criado em: {db_path.resolve()}")
            print(f"[SQLite] Executando criação das tabelas e dados de exemplo...")
            DatabaseConnection._init_sqlite(conn)
            print(f"[SQLite] Banco inicializado com sucesso!\n")
        return conn

    # --------------------------------------------------------------
    @staticmethod
    def _init_sqlite(conn: sqlite3.Connection) -> None:
        """Roda DDL + seed no SQLite quando o arquivo é novo."""
        try:
            with conn:
                conn.executescript(SQL_DDL_SQLITE)
                for comando in SQL_SEED:
                    conn.executescript(comando)
        except sqlite3.Error as erro:
            raise ValideError(
                f"Falha ao inicializar banco SQLite: {erro}"
            ) from erro

    # --------------------------------------------------------------
    @staticmethod
    def _converter_placeholders_para_sqlite(query: str) -> str:
        """
        Interno: troca sintaxe %(nome)s (PostgreSQL/psycopg2)
        por :nome (SQLite), usando expressão regular.
        """
        import re
        return re.sub(r"%\(([A-Za-z_][A-Za-z0-9_]*)\)s", r":\1", query)

    # --------------------------------------------------------------
    @staticmethod
    def executar_sql(conn, query: str, params: dict = None) -> list:
        """
        Executa QUALQUER consulta SELECT/INSERT/UPDATE/DELETE e
        retorna SEMPRE uma lista de dicionários (cada linha = 1 dict).

        Diferenças entre bancos são tratadas internamente.
        """
        params = params or {}
        if DB_ENGINE == "postgres":
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params)
            try:
                resultado = [dict(linha) for linha in cursor.fetchall()]
            except psycopg2.ProgrammingError:
                resultado = []
            cursor.close()
            return resultado
        else:
            query_sqlite = DatabaseConnection._converter_placeholders_para_sqlite(query)
            cursor = conn.execute(query_sqlite, params)
            try:
                resultado = [dict(linha) for linha in cursor.fetchall()]
            except sqlite3.ProgrammingError:
                resultado = []
            cursor.close()
            return resultado

    # --------------------------------------------------------------
    @staticmethod
    def executar_sql_retorna_um(conn, query: str, params: dict = None):
        """
        Atalho para consultas que retornam NO MÁXIMO 1 linha
        (ex.: buscar um usuário por ID).
        """
        linhas = DatabaseConnection.executar_sql(conn, query, params)
        return linhas[0] if linhas else None


# ============================================================
# SEÇÃO 7 - CLASSE PRINCIPAL DO SISTEMA (Regras de Negócio)
# ------------------------------------------------------------
# ValidadeEstoque = "Service Layer" (camada de serviço).
# Implementa com WITH (gerenciador de contexto) para garantir
# commit / rollback e fechamento da conexão automaticamente.
# ============================================================
@dataclass
class ValidadeEstoque:
    """
    Classe de serviços do Valide.
    Uso recomendado:

        with ValidadeEstoque() as s:
            s.relatorio_validade()
            s.baixar_lote_fefo(...)
    """

    conn: Any = None   # Conexão ativa (preenchida pelo __enter__)

    # ------------------------------------------------------------------
    def __enter__(self):
        """Abre a conexão ao entrar no bloco 'with'."""
        self.conn = DatabaseConnection.get_connection()
        return self

    # ------------------------------------------------------------------
    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Fecha a conexão ao SAIR do bloco 'with'.
        Se houve exceção -> ROLLBACK (desfaz tudo).
        Senão -> COMMIT (grava tudo permanentemente).
        """
        if self.conn is not None:
            try:
                if exc_type:
                    self.conn.rollback()
                else:
                    self.conn.commit()
            finally:
                self.conn.close()

    # ================================================================
    # SUB-SEÇÃO 7.1 - CLASSIFICAÇÃO DE VALIDADE
    # ================================================================
    @staticmethod
    def classificar_validade(dias: int) -> ClassificacaoValidade:
        """
        Recebe dias restantes para o vencimento e devolve o
        nível do alerta correspondente (VENCIDO / VERMELHO / AMARELO / VERDE).
        """
        if dias <= 0:
            return ClassificacaoValidade.VENCIDO
        if dias <= LIMITE_VERMELHO:
            return ClassificacaoValidade.VERMELHO
        if dias <= LIMITE_AMARELO:
            return ClassificacaoValidade.AMARELO
        return ClassificacaoValidade.VERDE

    # ================================================================
    # SUB-SEÇÃO 7.2 - RELATÓRIO DE VALIDADE (ENTREGÁVEL 3)
    # ================================================================
    def relatorio_validade(self, data_base: Optional[date] = None,
                           exibir_no_terminal: bool = True):
        """
        Consulta todos os lotes ativos com saldo > 0 e classifica
        cada um em 4 grupos (VENCIDO/VERMELHO/AMARELO/VERDE).

        Parâmetros:
          - data_base: data de referência (padrão = hoje).
          - exibir_no_terminal: se True, imprime tabela colorida no stdout.

        Retorna: dicionário { ClassificacaoValidade : [lista_lotes_dict] }
        """
        data_base = data_base or date.today()
        data_str = data_base.isoformat()

        # Sintaxe de diferença de dias varia entre os dois bancos
        diff_sql = (
            "(julianday(le.data_validade) - julianday(%(data_base)s))"
            if DB_ENGINE == "sqlite" else
            "(le.data_validade - CAST(%(data_base)s AS DATE))"
        )

        query = f"""
            SELECT le.id_lote,
                   p.id_produto,
                   p.nome_comercial,
                   p.principio_ativo,
                   p.categoria,
                   le.numero_lote,
                   le.data_validade,
                   le.quantidade_atual,
                   CAST({diff_sql} AS INTEGER) AS dias_para_vencer
              FROM lotes_estoque le
              JOIN produtos p ON p.id_produto = le.id_produto
             WHERE le.ativo = {SQL_BOOL_TRUE}
               AND le.quantidade_atual > 0
             ORDER BY le.data_validade ASC, le.data_entrada ASC
        """
        registros = DatabaseConnection.executar_sql(
            self.conn, query, {"data_base": data_str}
        )

        # Agrupa os lotes em 4 listas, uma para cada cor do alerta
        resultado: Dict[ClassificacaoValidade, List[Dict]] = {
            ClassificacaoValidade.VENCIDO:  [],
            ClassificacaoValidade.VERMELHO: [],
            ClassificacaoValidade.AMARELO:  [],
            ClassificacaoValidade.VERDE:    [],
        }
        for registro in registros:
            dias = int(registro["dias_para_vencer"])
            classificacao = self.classificar_validade(dias)
            registro["dias_para_vencer"] = dias
            registro["classificacao"] = classificacao.value
            resultado[classificacao].append(registro)

        if exibir_no_terminal:
            self._imprimir_relatorio(resultado, data_base)
        return resultado

    # -----------------------------------------------------------
    def _imprimir_relatorio(self, resultado, data_base):
        """
        Formata e imprime o relatório no terminal com cores.
        (Método auxiliar interno - não usar diretamente.)
        """
        separador = "=" * 110
        print()
        print(separador)
        print(f"  RELATÓRIO DE VALIDADE - SISTEMA VALIDE  |  "
              f"Motor: {DB_ENGINE.upper()}  |  Data base: {data_base}")
        print(separador)
        print(f"  LEGENDA DOS ALERTAS:")
        print(f"    {CORES[ClassificacaoValidade.VENCIDO]} VENCIDO  {CORES['RESET']}  "
              f"= Medicamento já venceu (dias <= 0)")
        print(f"    {CORES[ClassificacaoValidade.VERMELHO]} VERMELHO {CORES['RESET']}  "
              f"= Vence em até {LIMITE_VERMELHO} dias (crítico)")
        print(f"    {CORES[ClassificacaoValidade.AMARELO]}  AMARELO {CORES['RESET']}  "
              f"= Vence entre {LIMITE_VERMELHO + 1} e {LIMITE_AMARELO} dias (atenção)")
        print(f"    {CORES[ClassificacaoValidade.VERDE]}    VERDE {CORES['RESET']}  "
              f"= Vence em mais de {LIMITE_AMARELO} dias (seguro)")
        print(separador)

        total_geral = 0
        for classificacao in [ClassificacaoValidade.VENCIDO,
                               ClassificacaoValidade.VERMELHO,
                               ClassificacaoValidade.AMARELO,
                               ClassificacaoValidade.VERDE]:
            lotes = resultado[classificacao]
            cor = CORES[classificacao]
            reset = CORES["RESET"]
            print()
            print(f"{cor}  [ {classificacao.value} ] - "
                  f"{len(lotes)} lote(s){reset}")
            if not lotes:
                print(f"      (nenhum lote nesta classificação)")
                continue
            print(f"    {'ID':<5} {'Produto':<35} {'Lote':<15} "
                  f"{'Validade':<14} {'Dias':<7} {'Qtd':<7} {'Categoria':<25}")
            print(f"    {'-'*5} {'-'*35} {'-'*15} {'-'*14} {'-'*7} {'-'*7} {'-'*25}")
            subtotal = 0
            for l in lotes:
                dias = l["dias_para_vencer"]
                data_val = str(l["data_validade"])[:10]
                print(f"    {l['id_lote']:<5} "
                      f"{str(l['nome_comercial'])[:34]:<35} "
                      f"{str(l['numero_lote'])[:14]:<15} "
                      f"{data_val:<14} "
                      f"{str(dias)+'d':<7} "
                      f"{l['quantidade_atual']:<7} "
                      f"{str(l.get('categoria') or '')[:24]:<25}")
                subtotal += l["quantidade_atual"]
            total_geral += subtotal
            print(f"    Subtotal {classificacao.value}: {subtotal} unidades.")
        print()
        print(separador)
        print(f"  TOTAL DE LOTES ATIVOS:  "
              f"{sum(len(v) for v in resultado.values())}")
        print(f"  TOTAL DE UNIDADES:      {total_geral}")
        print(separador)
        print()

    # ================================================================
    # SUB-SEÇÃO 7.3 - CONSULTAS AUXILIARES
    # ================================================================
    def obter_usuario_com_perfil(self, id_usuario: int):
        """
        Busca um usuário pelo ID, já com os dados do perfil (nome e nível)
        usados pelo RBAC. Retorna None se não existir.
        """
        query = """
            SELECT u.id_usuario, u.nome, u.login, u.ativo,
                   pa.id_perfil, pa.nome_perfil, pa.nivel
              FROM usuarios u
              JOIN perfil_acesso pa ON pa.id_perfil = u.id_perfil
             WHERE u.id_usuario = %(id_usuario)s
        """
        return DatabaseConnection.executar_sql_retorna_um(
            self.conn, query, {"id_usuario": id_usuario}
        )

    # ================================================================
    # SUB-SEÇÃO 7.4 - ALGORITMO FEFO (First Expire, First Out)
    # ================================================================
    def proximo_lote_fefo(self, id_produto: int, quantidade: int):
        """
        Monta o "plano de baixa" para um produto usando a estratégia
        FEFO: sempre baixa PRIMEIRO o lote que VENCE MAIS CEDO.

        Se a quantidade pedida > saldo total, levanta exceção.
        Retorna uma LISTA de lotes consumidos, com a quantidade
        que deve ser baixada de cada um. Ex.:
          [
            {"id_lote": 1, "numero_lote": "...", "data_validade": "...", "baixar": 20},
            {"id_lote": 2, "numero_lote": "...", "data_validade": "...", "baixar":  5},
          ]
        """
        query = f"""
            SELECT id_lote, numero_lote, data_validade, quantidade_atual
              FROM lotes_estoque
             WHERE id_produto = %(id_produto)s
               AND ativo = {SQL_BOOL_TRUE}
               AND quantidade_atual > 0
             ORDER BY data_validade ASC, data_entrada ASC
        """
        lotes = DatabaseConnection.executar_sql(
            self.conn, query, {"id_produto": id_produto}
        )
        saldo_disponivel = sum(l["quantidade_atual"] for l in lotes)
        if saldo_disponivel < quantidade:
            raise EstoqueInsuficienteError(
                f"Estoque insuficiente para o produto #{id_produto}. "
                f"Disponível: {saldo_disponivel} un. | "
                f"Solicitado: {quantidade} un."
            )

        plano_de_baixa = []
        restante = quantidade
        for l in lotes:
            if restante <= 0:
                break
            baixar = min(l["quantidade_atual"], restante)
            plano_de_baixa.append({
                "id_lote": l["id_lote"],
                "numero_lote": l["numero_lote"],
                "data_validade": l["data_validade"],
                "baixar": baixar,
            })
            restante -= baixar
        return plano_de_baixa

    # ================================================================
    # SUB-SEÇÃO 7.5 - BAIXA DE ESTOQUE (ENTREGÁVEL 4)
    # ---------------------------------------------------------------
    # Orquestra: RBAC -> FEFO -> Update saldo -> Auditoria
    # ================================================================
    def baixar_lote_fefo(self, *, id_produto: int, quantidade: int,
                         id_usuario: int,
                         tipo_movimentacao: TipoMovimentacao,
                         justificativa: Optional[str] = None,
                         forcar_descarte_vencido: bool = False):
        """
        Executa uma baixa de estoque com TODAS as regras de negócio:
          1. Valida que quantidade é positiva.
          2. Busca o usuário e valida se está ATIVO.
          3. RBAC: valida que o perfil permite a operação.
          4. Para DESCARTE/AJUSTE, obriga justificativa >= 5 caracteres.
          5. Monta plano FEFO (ou plano de descarte priorizando vencidos).
          6. Para CADA lote consumido: atualiza saldo + grava histórico.

        Tudo roda na MESMA transação: se algo falhar, ROLLBACK TOTAL.

        Parâmetros com '*' = obrigatórios por keyword (boa prática).
        """
        # ----- REGRA 1: Quantidade positiva -----
        if quantidade <= 0:
            raise ValideError("Quantidade deve ser maior que zero.")

        # ----- REGRA 2: Usuário existe e está ativo -----
        usuario = self.obter_usuario_com_perfil(id_usuario)
        if not usuario:
            raise UsuarioNaoEncontradoError(
                f"Usuário com id={id_usuario} não encontrado."
            )
        if not usuario["ativo"]:
            raise PermissaoInsuficienteError(
                f"O usuário '{usuario['login']}' está INATIVO."
            )

        # ----- REGRA 3: RBAC (permissão por perfil) -----
        nivel = NivelPerfil(usuario["nivel"])
        self._validar_permissao(nivel, tipo_movimentacao)

        # ----- REGRA 4: Justificativa obrigatória para descartes/ajustes -----
        if tipo_movimentacao in (TipoMovimentacao.DESCARTE, TipoMovimentacao.AJUSTE):
            if (not justificativa) or (len(justificativa.strip()) < 5):
                raise ValideError(
                    "É obrigatório informar uma justificativa com, no mínimo, "
                    f"5 caracteres para {tipo_movimentacao.value}."
                )

        # ----- REGRA 5: Seleciona plano de lotes a consumir -----
        if (tipo_movimentacao == TipoMovimentacao.DESCARTE
                and forcar_descarte_vencido):
            # Descarte: prioriza 100% lotes já vencidos primeiro
            plano = self._selecionar_lotes_descarte(id_produto, quantidade)
        else:
            # Venda / Ajuste / Entrada: FEFO tradicional
            plano = self.proximo_lote_fefo(id_produto, quantidade)

        if not plano:
            raise LoteNaoEncontradoError(
                f"Nenhum lote ativo com saldo encontrado para o "
                f"produto id={id_produto}."
            )

        # ----- REGRA 6: Executa a baixa em cada lote e grava auditoria -----
        resultados = []
        for item in plano:
            qtd = item["baixar"]

            # Atualiza saldo do lote (garante atomicidade)
            update_sql = """
                UPDATE lotes_estoque
                   SET quantidade_atual = quantidade_atual - %(qtd)s
                 WHERE id_lote = %(id_lote)s
                   AND quantidade_atual >= %(qtd)s
                 RETURNING id_lote, quantidade_atual
            """
            if DB_ENGINE == "sqlite":
                # SQLite não suporta RETURNING; faz SELECT + UPDATE manual
                check = DatabaseConnection.executar_sql_retorna_um(
                    self.conn,
                    "SELECT id_lote, quantidade_atual FROM lotes_estoque "
                    "WHERE id_lote = %(id_lote)s AND quantidade_atual >= %(qtd)s",
                    {"id_lote": item["id_lote"], "qtd": qtd},
                )
                if not check:
                    self.conn.rollback()
                    raise EstoqueInsuficienteError(
                        f"Falha ao baixar lote #{item['id_lote']} "
                        f"(saldo disponível insuficiente no momento)."
                    )
                self.conn.execute(
                    DatabaseConnection._converter_placeholders_para_sqlite(
                        "UPDATE lotes_estoque SET quantidade_atual = "
                        "quantidade_atual - %(qtd)s WHERE id_lote = %(id_lote)s"
                    ),
                    {"qtd": qtd, "id_lote": item["id_lote"]},
                )
                update_retorno = {"id_lote": item["id_lote"]}
            else:
                cursor = self.conn.cursor()
                cursor.execute(update_sql, {"qtd": qtd, "id_lote": item["id_lote"]})
                update_retorno = cursor.fetchone()
                cursor.close()
                if not update_retorno:
                    self.conn.rollback()
                    raise EstoqueInsuficienteError(
                        f"Falha ao baixar lote #{item['id_lote']} "
                        f"(conflito de atualização)."
                    )

            # Grava movimentação na tabela de auditoria (histórico imutável)
            data_sql = ("datetime('now')" if DB_ENGINE == "sqlite" else "NOW()")
            insert_sql = (
                """
                INSERT INTO historico_movimentacao
                    (id_lote, id_usuario, tipo_movimentacao,
                     quantidade, data_registro, justificativa)
                VALUES (%s, %s, %s, %s, """ + data_sql + """, %s)
                RETURNING id_movimentacao
                """
            )
            parametros = (
                item["id_lote"],
                id_usuario,
                tipo_movimentacao.value,
                qtd,
                (justificativa
                 or f"{tipo_movimentacao.value} FEFO produto #{id_produto}"),
            )
            if DB_ENGINE == "sqlite":
                cursor = self.conn.execute(insert_sql.replace("%s", "?"),
                                           parametros)
                id_mov = cursor.lastrowid
            else:
                cursor = self.conn.cursor()
                cursor.execute(insert_sql, parametros)
                id_mov = cursor.fetchone()[0]
                cursor.close()

            resultados.append({
                "id_lote": item["id_lote"],
                "numero_lote": item["numero_lote"],
                "data_validade": item["data_validade"],
                "quantidade_baixada": qtd,
                "id_movimentacao": id_mov,
            })
        return resultados

    # ================================================================
    # SUB-SEÇÃO 7.6 - VALIDADOR RBAC
    # ================================================================
    @staticmethod
    def _validar_permissao(nivel: NivelPerfil, tipo: TipoMovimentacao) -> None:
        """
        Checa a matriz de autorização:
          - VENDA e ENTRADA: perfil BALCONISTA (nível 1) ou superior
          - DESCARTE e AJUSTE: precisa FARMACEUTICO (nível 2) ou ADMIN (nível 3)

        Se o usuário não tiver perfil, levanta PermissaoInsuficienteError.
        """
        if tipo in (TipoMovimentacao.VENDA, TipoMovimentacao.ENTRADA):
            if nivel not in (NivelPerfil.BALCONISTA,
                             NivelPerfil.FARMACEUTICO,
                             NivelPerfil.ADMIN):
                raise PermissaoInsuficienteError(
                    f"Operação {tipo.value} exige, no mínimo, "
                    "Nível 1 (Balconista)."
                )
        elif tipo in (TipoMovimentacao.DESCARTE, TipoMovimentacao.AJUSTE):
            if nivel not in (NivelPerfil.FARMACEUTICO, NivelPerfil.ADMIN):
                raise PermissaoInsuficienteError(
                    f"Operação {tipo.value} requer Nível 2 (Farmacêutico) "
                    "ou Nível 3 (Administrador). "
                    "Perfil Balconista (Nível 1) NÃO está autorizado."
                )

    # ================================================================
    # SUB-SEÇÃO 7.7 - PLANO DE DESCARTE (prioriza lotes já vencidos)
    # ================================================================
    def _selecionar_lotes_descarte(self, id_produto: int, quantidade: int):
        """
        Variante do FEFO usada em DESCARTE:
          ORDEM: 1) lotes JÁ VENCIDOS primeiro,
                 2) depois os mais próximos de vencer.
        Assim, a farmácia nunca joga fora produto bom antes de vencido.
        """
        diff_sql = ("(julianday(data_validade) - julianday(date('now')))"
                    if DB_ENGINE == "sqlite" else
                    "(data_validade - CURRENT_DATE)")
        query = f"""
            SELECT id_lote, numero_lote, data_validade, quantidade_atual
              FROM lotes_estoque
             WHERE id_produto = %(id_produto)s
               AND ativo = {SQL_BOOL_TRUE}
               AND quantidade_atual > 0
             ORDER BY (CASE WHEN {diff_sql} <= 0 THEN 0 ELSE 1 END),
                      data_validade ASC, data_entrada ASC
        """
        lotes = DatabaseConnection.executar_sql(
            self.conn, query, {"id_produto": id_produto}
        )
        saldo = sum(l["quantidade_atual"] for l in lotes)
        if saldo < quantidade:
            raise EstoqueInsuficienteError(
                "Estoque insuficiente para descarte. "
                f"Disponível: {saldo} un. | Pedido: {quantidade} un."
            )

        plano = []
        restante = quantidade
        for l in lotes:
            if restante <= 0:
                break
            baixar = min(l["quantidade_atual"], restante)
            plano.append({
                "id_lote": l["id_lote"],
                "numero_lote": l["numero_lote"],
                "data_validade": l["data_validade"],
                "baixar": baixar,
            })
            restante -= baixar
        return plano


# ============================================================
# SEÇÃO 8 - FUNÇÕES DE LINHA DE COMANDO (CLI)
# ------------------------------------------------------------
# Permitem rodar o sistema direto pelo terminal:
#   python database.py         -> exibe o relatório de validade
#   python database.py --demo  -> executa cenário demo completo
# ============================================================

def executar_relatorio() -> None:
    """Executa e imprime o relatório colorido no terminal."""
    with ValidadeEstoque() as s:
        s.relatorio_validade()


def executar_baixa_exemplo() -> None:
    """
    Cenário DIDÁTICO de demonstração.
    Mostra, em sequência, 5 casos de uso reais.
    """
    print("\n====== DEMO: SISTEMA VALIDE "
          "(RBAC + FEFO + AUDITORIA) ======\n")
    with ValidadeEstoque() as s:

        # ----------------------------------------------------------------
        # CASO 1 - Venda normal realizada pelo Balconista (nível 1)
        # ----------------------------------------------------------------
        print("[1] VENDA - Balconista Carlos (id=3) - "
              "2 un. Dipirona Sódica (produto #1)")
        try:
            baixados = s.baixar_lote_fefo(
                id_produto=1, quantidade=2, id_usuario=3,
                tipo_movimentacao=TipoMovimentacao.VENDA,
            )
            for b in baixados:
                print(f"    OK: lote #{b['id_lote']} ({b['numero_lote']}) "
                      f"- baixou {b['quantidade_baixada']} un. "
                      f"| Movimento #{b['id_movimentacao']}")
        except ValideError as e:
            print(f"    ERRO: {e}")

        # ----------------------------------------------------------------
        # CASO 2 - Balconista tenta autorizar DESCARTE (BLOQUEADO pelo RBAC)
        #           Este caso deve SER BLOQUEADO - demonstra o RBAC.
        # ----------------------------------------------------------------
        print("\n[2] DESCARTE - Balconista (id=3) - "
              "Deve FALHAR por falta de permissão (RBAC)")
        try:
            s.baixar_lote_fefo(
                id_produto=1, quantidade=1, id_usuario=3,
                tipo_movimentacao=TipoMovimentacao.DESCARTE,
                justificativa="Lote vencido", forcar_descarte_vencido=True,
            )
            print("    (não deveria chegar aqui - RBAC falhou!)")
        except PermissaoInsuficienteError as e:
            print(f"    BLOQUEADO (esperado): {e}")

        # ----------------------------------------------------------------
        # CASO 3 - Farmacêutico (nível 2) autoriza descarte de vencidos
        # ----------------------------------------------------------------
        print("\n[3] DESCARTE - Farmacêutica Juliana (id=2) - "
              "5 un. Dipirona vencida (prioriza vencido FEFO)")
        try:
            baixados = s.baixar_lote_fefo(
                id_produto=1, quantidade=5, id_usuario=2,
                tipo_movimentacao=TipoMovimentacao.DESCARTE,
                justificativa="Medicamento vencido - "
                              "encaminhado para descarte sanitário obrigatório",
                forcar_descarte_vencido=True,
            )
            for b in baixados:
                data_val = str(b["data_validade"])[:10]
                print(f"    OK: lote #{b['id_lote']} (validade {data_val}) "
                      f"- descartou {b['quantidade_baixada']} un. "
                      f"| Movimento #{b['id_movimentacao']}")
        except ValideError as e:
            print(f"    ERRO: {e}")

        # ----------------------------------------------------------------
        # CASO 4 - Farmacêutico faz ajuste de estoque por avaria
        # ----------------------------------------------------------------
        print("\n[4] AJUSTE - Farmacêutica Juliana (id=2) - "
              "2 un. Ibuprofeno (#3) - avarias na prateleira")
        try:
            baixados = s.baixar_lote_fefo(
                id_produto=3, quantidade=2, id_usuario=2,
                tipo_movimentacao=TipoMovimentacao.AJUSTE,
                justificativa="Ajuste de inventário - "
                              "caixas avariadas na reposição da prateleira",
            )
            for b in baixados:
                print(f"    OK: lote #{b['id_lote']} ({b['numero_lote']}) "
                      f"- ajustou {b['quantidade_baixada']} un. "
                      f"| Movimento #{b['id_movimentacao']}")
        except ValideError as e:
            print(f"    ERRO: {e}")

        # ----------------------------------------------------------------
        # CASO 5 - Venda grande que consome vários lotes (FEFO multi-lotes)
        # ----------------------------------------------------------------
        print("\n[5] VENDA - 50 un. Losartana Potássica (#7) - "
              "Algoritmo FEFO com múltiplos lotes")
        try:
            baixados = s.baixar_lote_fefo(
                id_produto=7, quantidade=50, id_usuario=3,
                tipo_movimentacao=TipoMovimentacao.VENDA,
                justificativa="Atendimento a cliente PF - caixa #2",
            )
            print(f"    OK: {len(baixados)} lote(s) consumido(s) "
                  f"na ordem FEFO:")
            for b in baixados:
                data_val = str(b["data_validade"])[:10]
                print(f"       * Lote #{b['id_lote']} (validade {data_val}) - "
                      f"baixou {b['quantidade_baixada']} un. "
                      f"| Movimento #{b['id_movimentacao']}")
        except ValideError as e:
            print(f"    ERRO: {e}")

    print("\n====== FIM DA DEMO - Transações gravadas "
          "com SUCESSO! ======\n")
    print("DICA: Execute 'python database.py' novamente para visualizar "
          "o relatório de validade ATUALIZADO com os saldos novos.\n")


# ============================================================
# SEÇÃO 9 - PONTO DE ENTRADA (CLI)
# ------------------------------------------------------------
# Quando rodamos: python database.py [--demo]
# Este bloco é executado.
# ============================================================
if __name__ == "__main__":
    argumentos = sys.argv[1:]
    print(f"\n[INFO] Motor de banco selecionado: {DB_ENGINE.upper()}")
    if DB_ENGINE == "sqlite":
        print(f"[INFO] Caminho do banco SQLite: "
              f"{Path(SQLITE_PATH).resolve()}")

    if "--demo" in argumentos:
        executar_baixa_exemplo()
    else:
        executar_relatorio()
