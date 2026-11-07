-- ============================================================
-- SISTEMA VALIDE - Controle de Validade de Medicamentos
-- MIGRATION 003 - EXPANSÃO DO SCHEMA (SQLite local)
-- ============================================================
-- PROPÓSITO:
--   Versão SQLite da migration 003 do PostgreSQL/Supabase. Reproduz o
--   MESMO efeito sobre o banco local data/valide.db, que hoje só tem as
--   5 tabelas do núcleo (perfil_acesso, usuarios, produtos, lotes_estoque,
--   historico_movimentacao).
--
--   Esta migration ADICIONA:
--     -> 6 tabelas novas (empresas, pastas, notificacoes, produto_notas,
--        produto_alteracoes, importacoes)
--     -> colunas novas em usuarios, produtos, lotes_estoque e
--        historico_movimentacao
--     -> 1 view nova (vw_produto_resumo)
--
-- CONVERSÕES DE DIALETO (Postgres -> SQLite):
--   · Sem "public." nos nomes e sem "SET search_path".
--   · SERIAL/IDENTITY  -> INTEGER PRIMARY KEY AUTOINCREMENT.
--   · BOOLEAN          -> INTEGER com CHECK (col IN (0,1)) e DEFAULT 0/1.
--   · TIMESTAMPTZ      -> TEXT DEFAULT CURRENT_TIMESTAMP.
--   · NUMERIC (dinheiro em centavos) -> INTEGER.
--   · DATE             -> TEXT no formato 'YYYY-MM-DD'.
--   · JSONB            -> TEXT.
--   · Removidos os blocos DO $$ ... $$ / EXCEPTION / COMMENT ON / setval.
--   · CREATE OR REPLACE VIEW -> DROP VIEW IF EXISTS + CREATE VIEW.
--   · INSERT ... ON CONFLICT DO NOTHING -> INSERT OR IGNORE.
--
-- IDEMPOTÊNCIA:
--   O SQLite NÃO aceita "ALTER TABLE ... ADD COLUMN IF NOT EXISTS". Por
--   isso cada ADD COLUMN é escrito em sua PRÓPRIA linha (uma coluna por
--   linha, terminando com ";"). O runner aplicar_migrations_sqlite.py lê
--   "PRAGMA table_info(<t>)" antes de cada ADD COLUMN e pula a coluna que
--   já existe. CREATE TABLE/CREATE INDEX usam IF NOT EXISTS e os INSERT
--   usam OR IGNORE.
--
-- DESVIOS EM RELAÇÃO AO POSTGRES (documentados, exigidos pelo SQLite):
--   · O SQLite não permite adicionar FOREIGN KEY nem CHECK de TABELA a
--     uma tabela já existente via ALTER TABLE. Logo, as constraints
--     fk_usuarios_empresa, fk_produtos_empresa, fk_produtos_pasta,
--     chk_produtos_unidade, chk_produtos_fonte,
--     chk_produtos_valores_nao_negativos, fk_historico_origem e
--     chk_historico_motivo NÃO são criadas aqui: essa validação fica a
--     cargo da camada de código (database.py / servidor).
--   · A constraint chk_qtd_movimentacao que a 003 troca (aceitando AJUSTE
--     com sinal) NÃO existe no SQLite: historico_movimentacao foi criada
--     com "CHECK (quantidade > 0)" inline e o SQLite não permite remover
--     um CHECK inline sem recriar a tabela (o que apagaria dados). Assim,
--     no SQLite local essa validação (AJUSTE pode ser negativo) fica a
--     cargo da camada de código.
--   · FKs de tabelas NOVAS são declaradas normalmente dentro do CREATE
--     TABLE, como no Postgres.
-- ============================================================


-- ============================================================
-- 0. EMPRESA (CONTA / TENANT)
-- ============================================================
-- id_empresa = 1 é a conta padrão do piloto (enriquecida na 004).
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa              INTEGER PRIMARY KEY AUTOINCREMENT,
    cnpj                    TEXT    NOT NULL,
    razao_social            TEXT    NOT NULL,
    nome_fantasia           TEXT    NOT NULL,
    inscricao_estadual      TEXT,
    inscricao_municipal     TEXT,
    regime_tributario       TEXT,
    -- Endereço (colunas planas: o contrato usa um objeto Address)
    cep                     TEXT,
    logradouro              TEXT,
    numero                  TEXT,
    complemento             TEXT,
    bairro                  TEXT,
    cidade                  TEXT,
    uf                      TEXT,
    -- Contato e apresentação
    telefone                TEXT,
    email                   TEXT,
    site                    TEXT,
    logo_url                TEXT,
    -- Preferências regionais / regra de negócio
    fuso_horario            TEXT    NOT NULL DEFAULT 'America/Sao_Paulo',
    moeda                   TEXT    NOT NULL DEFAULT 'BRL',
    idioma                  TEXT    NOT NULL DEFAULT 'pt-BR',
    janela_a_vencer_dias    INTEGER NOT NULL DEFAULT 30,
    created_at              TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_empresas_cnpj UNIQUE (cnpj)
);

-- Conta padrão (id_empresa = 1). No SQLite o conflito é resolvido pela
-- PRIMARY KEY via INSERT OR IGNORE.
INSERT OR IGNORE INTO empresas (id_empresa, cnpj, razao_social, nome_fantasia, regime_tributario)
VALUES (1, '00000000000000', 'Empresa Padrão (a preencher)', 'Empresa Padrão', 'Simples Nacional');


-- ============================================================
-- 1. PASTAS (AGRUPAMENTO DE PRODUTOS)
-- ============================================================
CREATE TABLE IF NOT EXISTS pastas (
    id_pasta    INTEGER PRIMARY KEY AUTOINCREMENT,
    id_empresa  INTEGER NOT NULL,
    nome        TEXT    NOT NULL,
    ativo       INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_pastas_empresa_nome UNIQUE (id_empresa, nome),
    FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pastas_empresa ON pastas (id_empresa);


-- ============================================================
-- 2. COLUNAS NOVAS EM usuarios
-- ============================================================
-- (ADD COLUMN sem IF NOT EXISTS: idempotência garantida pelo runner.)
ALTER TABLE usuarios ADD COLUMN id_empresa          INTEGER NOT NULL DEFAULT 1;
ALTER TABLE usuarios ADD COLUMN avatar_url          TEXT;
ALTER TABLE usuarios ADD COLUMN pref_expira_semana  INTEGER NOT NULL DEFAULT 1 CHECK (pref_expira_semana IN (0,1));
ALTER TABLE usuarios ADD COLUMN pref_estoque_minimo INTEGER NOT NULL DEFAULT 1 CHECK (pref_estoque_minimo IN (0,1));
ALTER TABLE usuarios ADD COLUMN pref_atividade      INTEGER NOT NULL DEFAULT 1 CHECK (pref_atividade IN (0,1));
ALTER TABLE usuarios ADD COLUMN pref_importacao     INTEGER NOT NULL DEFAULT 1 CHECK (pref_importacao IN (0,1));

CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios (id_empresa);


-- ============================================================
-- 3. COLUNAS NOVAS EM produtos
-- ============================================================
-- (ADD COLUMN sem IF NOT EXISTS: idempotência garantida pelo runner.)
ALTER TABLE produtos ADD COLUMN id_empresa        INTEGER NOT NULL DEFAULT 1;
ALTER TABLE produtos ADD COLUMN sku               TEXT;
ALTER TABLE produtos ADD COLUMN marca             TEXT;
ALTER TABLE produtos ADD COLUMN fornecedor        TEXT;
ALTER TABLE produtos ADD COLUMN unidade           TEXT    NOT NULL DEFAULT 'un';
ALTER TABLE produtos ADD COLUMN estoque_minimo    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE produtos ADD COLUMN estoque_maximo    INTEGER;
ALTER TABLE produtos ADD COLUMN custo_aquisicao   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE produtos ADD COLUMN custo_operacional INTEGER NOT NULL DEFAULT 0;
ALTER TABLE produtos ADD COLUMN preco_venda       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE produtos ADD COLUMN id_pasta          INTEGER;
ALTER TABLE produtos ADD COLUMN fonte             TEXT    NOT NULL DEFAULT 'manual';
ALTER TABLE produtos ADD COLUMN id_externo        TEXT;
ALTER TABLE produtos ADD COLUMN ativo             INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1));
ALTER TABLE produtos ADD COLUMN foto_url          TEXT;

-- SKU único dentro da empresa (quando informado). Índice parcial: ignora NULL.
CREATE UNIQUE INDEX IF NOT EXISTS uk_produtos_empresa_sku
    ON produtos (id_empresa, lower(sku))
    WHERE sku IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_produtos_pasta   ON produtos (id_pasta);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo    ON produtos (ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa  ON produtos (id_empresa);


-- ============================================================
-- 4. COLUNA NOVA EM lotes_estoque
-- ============================================================
ALTER TABLE lotes_estoque ADD COLUMN data_fabricacao TEXT;


-- ============================================================
-- 5. COLUNAS NOVAS EM historico_movimentacao
-- ============================================================
ALTER TABLE historico_movimentacao ADD COLUMN motivo                 TEXT;
ALTER TABLE historico_movimentacao ADD COLUMN fornecedor             TEXT;
ALTER TABLE historico_movimentacao ADD COLUMN nota_fiscal            TEXT;
ALTER TABLE historico_movimentacao ADD COLUMN id_movimentacao_origem INTEGER;


-- ============================================================
-- 6. TABELA: notificacoes  (Avisos do sino)
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes (
    id_notificacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_empresa     INTEGER NOT NULL,
    id_usuario     INTEGER,                       -- NULL = todos da conta
    tipo           TEXT    NOT NULL,
    titulo         TEXT    NOT NULL,
    corpo          TEXT,
    lida           INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0,1)),
    link           TEXT,
    created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_notificacoes_tipo
        CHECK (tipo IN ('min_stock','user_change','system','import_done')),
    FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_empresa ON notificacoes (id_empresa, lida);


-- ============================================================
-- 7. TABELA: produto_notas  (Anotações do produto)
-- ============================================================
CREATE TABLE IF NOT EXISTS produto_notas (
    id_nota     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produto  INTEGER NOT NULL,
    id_usuario  INTEGER NOT NULL,
    texto       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_produto) REFERENCES produtos (id_produto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notas_produto ON produto_notas (id_produto);


-- ============================================================
-- 8. TABELA: produto_alteracoes  (Trilha do cadastro do produto)
-- ============================================================
CREATE TABLE IF NOT EXISTS produto_alteracoes (
    id_alteracao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produto   INTEGER NOT NULL,
    id_usuario   INTEGER,                        -- NULL quando veio de importação
    tipo         TEXT    NOT NULL,               -- created | updated
    campo        TEXT,                           -- name, salePrice, ...
    valor_de     TEXT,
    valor_para   TEXT,
    origem       TEXT,                           -- manual | file | integration
    created_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_alteracoes_tipo CHECK (tipo IN ('created','updated')),
    FOREIGN KEY (id_produto) REFERENCES produtos (id_produto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alteracoes_produto ON produto_alteracoes (id_produto, created_at DESC);


-- ============================================================
-- 9. TABELA: importacoes  (Histórico de importações de catálogo)
-- ============================================================
CREATE TABLE IF NOT EXISTS importacoes (
    id_importacao      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_empresa         INTEGER NOT NULL,
    id_usuario         INTEGER,
    origem             TEXT    NOT NULL DEFAULT 'file',
    status             TEXT    NOT NULL DEFAULT 'pending',
    arquivos           TEXT,                       -- JSON: [{ name, size }]
    colunas_detectadas TEXT,                       -- JSON: ["Nome", "EAN", ...]
    mapeamento         TEXT,                       -- JSON: { coluna: campo }
    total_linhas       INTEGER NOT NULL DEFAULT 0,
    linhas_validas     INTEGER NOT NULL DEFAULT 0,
    linhas_erro        INTEGER NOT NULL DEFAULT 0,
    linhas_aviso       INTEGER NOT NULL DEFAULT 0,
    linhas_excluidas   INTEGER NOT NULL DEFAULT 0,
    linhas_criadas     INTEGER NOT NULL DEFAULT 0,
    linhas_atualizadas INTEGER NOT NULL DEFAULT 0,
    created_at         TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at        TEXT,

    CONSTRAINT chk_importacoes_status
        CHECK (status IN ('pending','uploading','mapping','previewing','running','done','failed','canceled')),
    CONSTRAINT chk_importacoes_origem
        CHECK (origem IN ('file','integration','manual')),
    FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_importacoes_empresa ON importacoes (id_empresa, created_at DESC);


-- ============================================================
-- 10. (TRIGGERS updated_at)
-- ============================================================
-- As triggers trg_empresas_updated_at / trg_pastas_updated_at do Postgres
-- (que chamam fn_set_updated_at()) NÃO são reproduzidas aqui: o SQLite
-- local não mantém essa função. O updated_at é atualizado pela camada de
-- código quando necessário.


-- ============================================================
-- 11. VIEW: vw_produto_resumo
-- ============================================================
-- Produto com total em estoque, validade mais próxima e classificação.
-- No Postgres usa-se (data - CURRENT_DATE); no SQLite as datas são TEXT
-- 'YYYY-MM-DD', então usamos julianday(...) para a diferença em dias.
DROP VIEW IF EXISTS vw_produto_resumo;
CREATE VIEW vw_produto_resumo AS
SELECT
    p.id_produto,
    p.nome_comercial,
    p.ean,
    p.categoria,
    p.id_empresa,
    p.id_pasta,
    p.ativo,
    COALESCE(SUM(le.quantidade_atual), 0)                          AS quantidade_total,
    MIN(le.data_validade)                                          AS validade_mais_proxima,
    CASE
        WHEN MIN(le.data_validade) IS NULL                               THEN 'SEM_VALIDADE'
        WHEN (julianday(MIN(le.data_validade)) - julianday('now')) <= 0   THEN 'VENCIDO'
        WHEN (julianday(MIN(le.data_validade)) - julianday('now')) <= 30  THEN 'VERMELHO'
        WHEN (julianday(MIN(le.data_validade)) - julianday('now')) <= 60  THEN 'AMARELO'
        ELSE 'VERDE'
    END                                                            AS classificacao
FROM produtos p
LEFT JOIN lotes_estoque le
       ON le.id_produto = p.id_produto
      AND le.ativo = 1
      AND le.quantidade_atual > 0
GROUP BY p.id_produto, p.nome_comercial, p.ean, p.categoria,
         p.id_empresa, p.id_pasta, p.ativo;


-- ============================================================
-- FIM DA MIGRATION 003 (SQLite)
-- ============================================================
