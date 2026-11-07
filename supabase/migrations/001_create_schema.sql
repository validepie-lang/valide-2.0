-- ============================================================
-- SISTEMA VALIDE - Controle de Validade de Medicamentos
-- DDL COMPLETO (Data Definition Language) - PostgreSQL / Supabase
-- ============================================================
-- PROPÓSITO:
--   Este script CRIA toda a estrutura física do banco de dados:
--   - 5 tabelas principais (perfil_acesso, usuarios, produtos,
--     lotes_estoque e historico_movimentacao)
--   - 3 VIEWS auxiliares (alertas, FEFO e usuários com perfil)
--   - ÍNDICES de performance
--   - TRIGGERS de auditoria e proteção contra hard-delete
--   - CONSTRAINTS de CHECK para integridade de domínio
--
-- REGRAS GERAIS GARANTIDAS PELO BANCO:
--   -> historico_movimentacao é IMUTÁVEL (não permite UPDATE/DELETE)
--   -> lotes_estoque NÃO ACEITA hard-delete (apenas soft-delete via ativo=FALSE)
--   -> RBAC com 3 níveis de perfil
--   -> Quantidades SEMPRE positivas ou zero
-- ============================================================


-- ----------------------------------------------------------------
-- 0. EXTENSÃO OPCIONAL (pgcrypto - usada para UUIDs / hashing)
-- ----------------------------------------------------------------
-- Nativa no Supabase. Garante funções criptográficas caso sejam
-- necessárias futuramente (ex: geração de senhas, UUIDs).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. TABELA: perfil_acesso  (Catálogo de Perfis do RBAC)
-- ============================================================
-- OBJETIVO: Dicionário que define os 3 níveis de acesso do sistema.
--           NÃO é feito alteração em produção - é domínio fixo.
--
--   Nível 1 - BALCONISTA:    Vender, dar entrada, consultar (operação diária)
--   Nível 2 - FARMACÊUTICO:  Mesmo do 1 + autorizar descartes e ajustes críticos
--   Nível 3 - ADMIN:         Acesso total + gestão de usuários/configurações
-- ============================================================
CREATE TABLE IF NOT EXISTS public.perfil_acesso (
    id_perfil   SERIAL       PRIMARY KEY,
    nome_perfil VARCHAR(30)  NOT NULL,
    nivel       INTEGER      NOT NULL,
    descricao   VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Restrições de integridade:
    CONSTRAINT uk_perfil_nome  UNIQUE (nome_perfil),    -- não pode haver dois perfis com mesmo nome
    CONSTRAINT uk_perfil_nivel UNIQUE (nivel),         -- não pode haver dois perfis com mesmo nível
    CONSTRAINT chk_nivel_valido CHECK (nivel IN (1, 2, 3))  -- só aceita 1/2/3
);

-- Comentários dentro do próprio dicionário de dados do PostgreSQL
COMMENT ON TABLE  public.perfil_acesso       IS 'RBAC - Catálogo fixo de perfis: 1=Balconista, 2=Farmacêutico, 3=Administrador';
COMMENT ON COLUMN public.perfil_acesso.nivel IS 'Peso do perfil (quanto MAIOR, MAIS permissões): 1=Balcão / 2=Farmácia / 3=Gerência';


-- ============================================================
-- 2. TABELA: usuarios  (Cadastro de operadores do sistema)
-- ============================================================
-- OBJETIVO: Armazena os operadores da farmácia que terão login.
--   - vínculo obrigatório com perfil (FK para perfil_acesso)
--   - senha armazenada como HASH (nunca plaintext!)
--   - coluna "ativo" para soft-delete de usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id_usuario   SERIAL       PRIMARY KEY,
    nome         VARCHAR(120) NOT NULL,
    login        VARCHAR(60)  NOT NULL,
    senha_hash   VARCHAR(255) NOT NULL,
    ativo        BOOLEAN      NOT NULL DEFAULT TRUE,
    id_perfil    INTEGER      NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_usuarios_login UNIQUE (login),
    CONSTRAINT fk_usuarios_perfil
        FOREIGN KEY (id_perfil)
        REFERENCES public.perfil_acesso (id_perfil)
        ON DELETE RESTRICT   -- não permite excluir perfil com usuário vinculado
        ON UPDATE CASCADE    -- se id_perfil mudar, reflete em usuários
);

-- Índices de performance para consultas frequentes de login/perfil
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON public.usuarios (id_perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo  ON public.usuarios (ativo);

COMMENT ON TABLE public.usuarios IS 'Operadores da farmácia credenciados para usar o sistema Valide';


-- ------------------------------------------------------------
-- TRIGGER: Atualiza automaticamente updated_at em alterações
-- (Usada em MAIS de uma tabela - por isso função global)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Sempre que houver UPDATE, o campo updated_at recebe NOW()
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ============================================================
-- 3. TABELA: produtos  (Cadastro MESTRE de medicamentos)
-- ============================================================
-- OBJETIVO: Guardar a ficha técnica de cada medicamento diferente
--           comercializado pela farmácia. 1 produto -> N lotes.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produtos (
    id_produto      SERIAL       PRIMARY KEY,
    ean             VARCHAR(14),                        -- Código de barras (GTIN/EAN)
    nome_comercial  VARCHAR(150) NOT NULL,              -- Ex: "Dipirona 500mg"
    principio_ativo VARCHAR(200) NOT NULL,              -- Ex: "Dipirona Sódica"
    categoria       VARCHAR(80)  NOT NULL,              -- Ex: "Antibiótico", "Analgésico"
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_produtos_ean UNIQUE (ean)             -- EAN não se repete
);

-- Índices para busca rápida em dashboard / telas de busca
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos (categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_nome      ON public.produtos (nome_comercial);

COMMENT ON TABLE public.produtos IS 'Cadastro mestre de medicamentos/produtos da farmácia (1 produto tem N lotes)';

DROP TRIGGER IF EXISTS trg_produtos_updated_at ON public.produtos;
CREATE TRIGGER trg_produtos_updated_at
BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ============================================================
-- 4. TABELA: lotes_estoque  (ESTOQUE FÍSICO POR LOTE)
-- ============================================================
-- REGRAS CRÍTICAS (HARD CONSTRAINTS):
--   ☒ NÃO há exclusão física (HARD DELETE BLOQUEADO via trigger)
--     -> Em vez disso, usa-se "ativo = FALSE" (soft delete)
--   ☒ Quantidades NUNCA podem ser negativas
--   ☒ Cada lote pertence a 1 produto + tem data de validade
--   ☒ A combinação (produto + número_lote) é única (não repete lote)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lotes_estoque (
    id_lote            SERIAL      PRIMARY KEY,
    id_produto         INTEGER     NOT NULL,
    numero_lote        VARCHAR(50) NOT NULL,
    data_validade      DATE        NOT NULL,
    quantidade_atual   INTEGER     NOT NULL DEFAULT 0,    -- saldo em tempo real
    quantidade_inicial INTEGER     NOT NULL DEFAULT 0,    -- qtd que entrou na NF (para auditoria)
    data_entrada       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_usuario_entrada INTEGER     NOT NULL,              -- quem cadastrou o lote
    ativo              BOOLEAN     NOT NULL DEFAULT TRUE, -- soft-delete: FALSE = inativo
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_lotes_produto_numero UNIQUE (id_produto, numero_lote),
    CONSTRAINT chk_quantidade_atual_nao_negativa CHECK (quantidade_atual   >= 0),
    CONSTRAINT chk_quantidade_inicial_positiva  CHECK (quantidade_inicial >= 0),

    CONSTRAINT fk_lotes_produto
        FOREIGN KEY (id_produto)
        REFERENCES public.produtos (id_produto)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_lotes_usuario_entrada
        FOREIGN KEY (id_usuario_entrada)
        REFERENCES public.usuarios (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Índices para otimizar FEFO e relatórios (JOIN produto x validade)
CREATE INDEX IF NOT EXISTS idx_lotes_produto      ON public.lotes_estoque (id_produto);
CREATE INDEX IF NOT EXISTS idx_lotes_validade     ON public.lotes_estoque (data_validade);
CREATE INDEX IF NOT EXISTS idx_lotes_usuario      ON public.lotes_estoque (id_usuario_entrada);
CREATE INDEX IF NOT EXISTS idx_lotes_ativo        ON public.lotes_estoque (ativo);
CREATE INDEX IF NOT EXISTS idx_lotes_prod_valid   ON public.lotes_estoque (id_produto, data_validade);

COMMENT ON TABLE public.lotes_estoque IS 'Cardex de lotes físicos. NÃO PERMITE exclusão física (hard-delete bloqueado por trigger). Use ativo=FALSE.';
COMMENT ON COLUMN public.lotes_estoque.quantidade_inicial IS 'Quantidade que entrou na Nota Fiscal (para auditoria de perda entre entrada e saldo atual)';

DROP TRIGGER IF EXISTS trg_lotes_updated_at ON public.lotes_estoque;
CREATE TRIGGER trg_lotes_updated_at
BEFORE UPDATE ON public.lotes_estoque
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ------------------------------------------------------------
-- TRIGGER DE SEGURANÇA: BLOQUEIA hard-delete em lotes_estoque
--   Qualquer DELETE levanta EXCEÇÃO no banco.
--   Isso garante a política de NUNCA apagar lote (só desativar).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_block_lotes_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'Hard-delete BLOQUEADO em lotes_estoque. '
        'Use UPDATE SET ativo=FALSE e grave o motivo no historico_movimentacao (AJUSTE / DESCARTE).';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_lotes_delete ON public.lotes_estoque;
CREATE TRIGGER trg_block_lotes_delete
BEFORE DELETE ON public.lotes_estoque
FOR EACH ROW EXECUTE FUNCTION public.fn_block_lotes_delete();


-- ============================================================
-- 5. TABELA: historico_movimentacao  (LIVRO RAZÃO / AUDITORIA)
-- ============================================================
-- REGRA DE OURO: Esta tabela É IMUTÁVEL!
--   ✓ Aceita apenas INSERT
--   ✗ NUNCA faz UPDATE (trigger bloqueia)
--   ✗ NUNCA faz DELETE (trigger bloqueia)
--
--   Tipos permitidos: VENDA / DESCARTE / AJUSTE / ENTRADA
--   Quantidade sempre > 0 (constraint)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.historico_movimentacao (
    id_movimentacao   SERIAL       PRIMARY KEY,
    id_lote           INTEGER      NOT NULL,
    id_usuario        INTEGER      NOT NULL,
    tipo_movimentacao VARCHAR(20)  NOT NULL,
    quantidade        INTEGER      NOT NULL,
    data_registro     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    justificativa     TEXT,

    CONSTRAINT chk_tipo_movimentacao
        CHECK (tipo_movimentacao IN ('VENDA', 'DESCARTE', 'AJUSTE', 'ENTRADA')),
    CONSTRAINT chk_qtd_movimentacao_positiva CHECK (quantidade > 0),

    CONSTRAINT fk_historico_lote
        FOREIGN KEY (id_lote)
        REFERENCES public.lotes_estoque (id_lote)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_historico_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES public.usuarios (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_historico_lote   ON public.historico_movimentacao (id_lote);
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON public.historico_movimentacao (id_usuario);
CREATE INDEX IF NOT EXISTS idx_historico_tipo    ON public.historico_movimentacao (tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_historico_data    ON public.historico_movimentacao (data_registro);

COMMENT ON TABLE public.historico_movimentacao IS 'TABELA IMUTÁVEL de auditoria - TUDO que entra e sai do estoque fica gravado aqui para sempre.';


-- ------------------------------------------------------------
-- TRIGGER DE PROTEÇÃO: Bloqueia UPDATE e DELETE no histórico
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_block_historico_change()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'historico_movimentacao É IMUTÁVEL: apenas INSERTs são permitidos. '
        'Nenhum UPDATE ou DELETE pode ser feito nesta tabela.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_historico_update ON public.historico_movimentacao;
CREATE TRIGGER trg_block_historico_update
BEFORE UPDATE ON public.historico_movimentacao
FOR EACH ROW EXECUTE FUNCTION public.fn_block_historico_change();

DROP TRIGGER IF EXISTS trg_block_historico_delete ON public.historico_movimentacao;
CREATE TRIGGER trg_block_historico_delete
BEFORE DELETE ON public.historico_movimentacao
FOR EACH ROW EXECUTE FUNCTION public.fn_block_historico_change();


-- ============================================================
-- 6. VIEWS AUXILIARES (Atalhos / Consultas padronizadas)
-- ------------------------------------------------------------
-- Views são tabelas "virtuais". Não armazenam dados, mas evitam
-- que o programador reescreva JOINs e regras repetidamente.
-- ============================================================


-- ------------------------------------------------------------
-- VIEW 1: vw_alerta_validade
--   Pronta para dashboard front-end. Já calcula:
--     - dias_para_vencer
--     - classificação (VERMELHO / AMARELO / VERDE / VENCIDO)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_alerta_validade AS
SELECT
    le.id_lote,
    p.id_produto,
    p.nome_comercial,
    p.principio_ativo,
    p.categoria,
    le.numero_lote,
    le.data_validade,
    le.quantidade_atual,
    CURRENT_DATE                                                        AS data_base,
    (le.data_validade - CURRENT_DATE)                                   AS dias_para_vencer,
    CASE
        WHEN (le.data_validade - CURRENT_DATE) <= 0  THEN 'VENCIDO'
        WHEN (le.data_validade - CURRENT_DATE) <= 30 THEN 'VERMELHO'
        WHEN (le.data_validade - CURRENT_DATE) <= 60 THEN 'AMARELO'
        ELSE 'VERDE'
    END                                                                 AS classificacao,
    le.ativo
FROM public.lotes_estoque le
JOIN public.produtos     p  ON p.id_produto = le.id_produto
WHERE le.ativo = TRUE
  AND le.quantidade_atual > 0;

COMMENT ON VIEW public.vw_alerta_validade IS 'Dashboard pronta: já classifica os lotes por cor alerta (VENCIDO/VERMELHO/AMARELO/VERDE).';


-- ------------------------------------------------------------
-- VIEW 2: vw_fefo_despacho
--   Entrega os lotes JÁ ORDENADOS no FEFO
--   (First Expire, First Out = Vence primeiro, sai primeiro)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_fefo_despacho AS
SELECT
    le.id_lote,
    p.id_produto,
    p.nome_comercial,
    le.numero_lote,
    le.data_validade,
    le.quantidade_atual,
    (le.data_validade - CURRENT_DATE) AS dias_para_vencer
FROM public.lotes_estoque le
JOIN public.produtos     p  ON p.id_produto = le.id_produto
WHERE le.ativo = TRUE
  AND le.quantidade_atual > 0
ORDER BY le.data_validade ASC, le.data_entrada ASC;

COMMENT ON VIEW public.vw_fefo_despacho IS 'Lotes já ordenados na regra FEFO (First Expire, First Out). Ideal para tela de baixa no balcão.';


-- ------------------------------------------------------------
-- VIEW 3: vw_usuarios_perfil
--   Usuários já com perfil anexado (evita JOIN repetido no backend)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_usuarios_perfil AS
SELECT
    u.id_usuario,
    u.nome,
    u.login,
    u.ativo                 AS usuario_ativo,
    pa.id_perfil,
    pa.nome_perfil,
    pa.nivel,
    pa.descricao
FROM public.usuarios      u
JOIN public.perfil_acesso pa ON pa.id_perfil = u.id_perfil;

COMMENT ON VIEW public.vw_usuarios_perfil IS 'Usuários já com informações RBAC anexadas (nível e nome do perfil).';
