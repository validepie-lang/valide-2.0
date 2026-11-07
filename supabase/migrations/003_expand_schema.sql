-- ============================================================
-- SISTEMA VALIDE - Controle de Validade de Medicamentos
-- MIGRATION 003 - EXPANSÃO DO SCHEMA (PostgreSQL / Supabase)
-- ============================================================
-- PROPÓSITO:
--   O schema original (001) cobria o núcleo do controle de validade
--   (perfis, usuários, produtos, lotes e histórico). O contrato da API
--   (docs/01-references/api-contract.md) pede mais: empresa (multi-conta),
--   pastas de produto, custo/preço (para calcular valor em risco e perdas),
--   estoque mínimo, notificações, notas, alterações do cadastro e
--   importações.
--
--   Esta migration ADICIONA o que falta SEM QUEBRAR o que já existe:
--     -> 6 tabelas novas (empresas, pastas, notificacoes, produto_notas,
--        produto_alteracoes, importacoes)
--     -> colunas novas em produtos, usuarios, lotes_estoque e
--        historico_movimentacao
--     -> 1 view nova (vw_produto_resumo) para a listagem de estoque
--     -> ajuste da constraint de quantidade do histórico (aceitar AJUSTE
--        com sinal negativo, como o contrato v28 define)
--
--   É IDEMPOTENTE: pode ser executada mais de uma vez sem erro
--   (usa IF NOT EXISTS / DROP IF EXISTS / DO $$ ... $$).
-- ============================================================


-- ============================================================
-- 0. EMPRESA (CONTA / TENANT)
-- ============================================================
-- OBJETIVO: Uma farmácia (conta) por linha. Todo dado de estoque
--           pertence a uma empresa, o que garante o isolamento entre
--           contas exigido pelo contrato (B20, B54).
--   - id_empresa = 1 é a conta padrão do piloto (seed em 004)
--   - janela_a_vencer_dias alimenta o status "a vencer" (padrão 30)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.empresas (
    id_empresa              SERIAL       PRIMARY KEY,
    cnpj                    VARCHAR(14)  NOT NULL,
    razao_social            VARCHAR(150) NOT NULL,
    nome_fantasia           VARCHAR(150) NOT NULL,
    inscricao_estadual      VARCHAR(30),
    inscricao_municipal     VARCHAR(30),
    regime_tributario       VARCHAR(40),
    -- Endereço (colunas planas: o contrato usa um objeto Address)
    cep                     VARCHAR(8),
    logradouro              VARCHAR(150),
    numero                  VARCHAR(20),
    complemento             VARCHAR(80),
    bairro                  VARCHAR(80),
    cidade                  VARCHAR(80),
    uf                      CHAR(2),
    -- Contato e apresentação
    telefone                VARCHAR(20),
    email                   VARCHAR(120),
    site                    VARCHAR(150),
    logo_url                TEXT,
    -- Preferências regionais / regra de negócio
    fuso_horario            VARCHAR(60)  NOT NULL DEFAULT 'America/Sao_Paulo',
    moeda                   CHAR(3)      NOT NULL DEFAULT 'BRL',
    idioma                  VARCHAR(10)  NOT NULL DEFAULT 'pt-BR',
    janela_a_vencer_dias    INTEGER      NOT NULL DEFAULT 30,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_empresas_cnpj UNIQUE (cnpj)
);

COMMENT ON TABLE  public.empresas IS 'Contas (farmácias) do Valide. Todo dado de estoque pertence a uma empresa (isolamento entre contas).';
COMMENT ON COLUMN public.empresas.janela_a_vencer_dias IS 'Quantos dias antes do vencimento um lote vira "a vencer". Padrão 30, configurável por conta.';

-- Conta padrão (id_empresa = 1): precisa existir ANTES das chaves estrangeiras
-- que apontam para empresas (as linhas antigas de produtos/usuarios usam o
-- padrão 1). A 004 enriquece estes dados.
INSERT INTO public.empresas (id_empresa, cnpj, razao_social, nome_fantasia, regime_tributario)
VALUES (1, '00000000000000', 'Empresa Padrão (a preencher)', 'Empresa Padrão', 'Simples Nacional')
ON CONFLICT (id_empresa) DO NOTHING;

SELECT setval('empresas_id_empresa_seq',
              GREATEST((SELECT MAX(id_empresa) FROM public.empresas), 1), TRUE);


-- ============================================================
-- 1. PASTAS (AGRUPAMENTO DE PRODUTOS)
-- ============================================================
-- OBJETIVO: Organizar produtos em grupos ("Medicamentos", "Higiene"...).
--   - ativo = FALSE tira a pasta das escolhas, sem tirar os produtos dela
--   - Nome único dentro da empresa
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pastas (
    id_pasta    SERIAL       PRIMARY KEY,
    id_empresa  INTEGER      NOT NULL,
    nome        VARCHAR(60)  NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_pastas_empresa_nome UNIQUE (id_empresa, nome),
    CONSTRAINT fk_pastas_empresa
        FOREIGN KEY (id_empresa) REFERENCES public.empresas (id_empresa)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pastas_empresa ON public.pastas (id_empresa);

COMMENT ON TABLE public.pastas IS 'Agrupamento de produtos por conta. ativo=FALSE apenas esconde a pasta das escolhas.';


-- ============================================================
-- 2. COLUNAS NOVAS EM usuarios
-- ============================================================
--   id_empresa   -> a que conta o operador pertence
--   avatar_url   -> foto de perfil (contrato User.avatarUrl)
--   quatro preferências de notificação por pessoa (contrato v16)
-- ============================================================
ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS id_empresa          INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS avatar_url          TEXT,
    ADD COLUMN IF NOT EXISTS pref_expira_semana  BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS pref_estoque_minimo BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS pref_atividade      BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS pref_importacao     BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
    ALTER TABLE public.usuarios
        ADD CONSTRAINT fk_usuarios_empresa
        FOREIGN KEY (id_empresa) REFERENCES public.empresas (id_empresa)
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;  -- constraint já existe
END;
$$;

CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON public.usuarios (id_empresa);


-- ============================================================
-- 3. COLUNAS NOVAS EM produtos
-- ============================================================
-- OBJETIVO: Completar a ficha do produto conforme o contrato:
--   sku, marca, fornecedor, unidade, estoque mínimo/máximo,
--   custo de aquisição, custo operacional, preço de venda (centavos),
--   pasta, origem (fonte), id externo, ativo (soft delete) e foto.
-- ============================================================
ALTER TABLE public.produtos
    ADD COLUMN IF NOT EXISTS id_empresa       INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS sku              VARCHAR(60),
    ADD COLUMN IF NOT EXISTS marca            VARCHAR(80),
    ADD COLUMN IF NOT EXISTS fornecedor       VARCHAR(80),
    ADD COLUMN IF NOT EXISTS unidade          VARCHAR(10)  NOT NULL DEFAULT 'un',
    ADD COLUMN IF NOT EXISTS estoque_minimo   INTEGER      NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estoque_maximo   INTEGER,
    ADD COLUMN IF NOT EXISTS custo_aquisicao  INTEGER      NOT NULL DEFAULT 0,  -- centavos
    ADD COLUMN IF NOT EXISTS custo_operacional INTEGER     NOT NULL DEFAULT 0,  -- centavos
    ADD COLUMN IF NOT EXISTS preco_venda      INTEGER      NOT NULL DEFAULT 0,  -- centavos
    ADD COLUMN IF NOT EXISTS id_pasta         INTEGER,
    ADD COLUMN IF NOT EXISTS fonte            VARCHAR(20)  NOT NULL DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS id_externo       VARCHAR(80),
    ADD COLUMN IF NOT EXISTS ativo            BOOLEAN      NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS foto_url         TEXT;

DO $$
BEGIN
    ALTER TABLE public.produtos
        ADD CONSTRAINT fk_produtos_empresa
        FOREIGN KEY (id_empresa) REFERENCES public.empresas (id_empresa)
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    ALTER TABLE public.produtos
        ADD CONSTRAINT fk_produtos_pasta
        FOREIGN KEY (id_pasta) REFERENCES public.pastas (id_pasta)
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    ALTER TABLE public.produtos
        ADD CONSTRAINT chk_produtos_unidade
        CHECK (unidade IN ('un', 'kg', 'cx'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    ALTER TABLE public.produtos
        ADD CONSTRAINT chk_produtos_fonte
        CHECK (fonte IN ('file', 'integration', 'manual'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    ALTER TABLE public.produtos
        ADD CONSTRAINT chk_produtos_valores_nao_negativos
        CHECK (custo_aquisicao >= 0 AND custo_operacional >= 0 AND preco_venda >= 0
               AND estoque_minimo >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

-- SKU único dentro da empresa (quando informado). Índice parcial: ignora NULL.
CREATE UNIQUE INDEX IF NOT EXISTS uk_produtos_empresa_sku
    ON public.produtos (id_empresa, lower(sku))
    WHERE sku IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_produtos_pasta   ON public.produtos (id_pasta);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo    ON public.produtos (ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa  ON public.produtos (id_empresa);


-- ============================================================
-- 4. COLUNA NOVA EM lotes_estoque
-- ============================================================
--   data_fabricacao -> contrato Lot.manufacturedAt (opcional)
-- ============================================================
ALTER TABLE public.lotes_estoque
    ADD COLUMN IF NOT EXISTS data_fabricacao DATE;


-- ============================================================
-- 5. COLUNAS NOVAS EM historico_movimentacao
-- ============================================================
-- OBJETIVO: Completar a auditoria com o que o contrato pede:
--   motivo              -> sale/damage/theft/expiry/internal (nulo em ENTRADA)
--   fornecedor          -> origem da ENTRADA (opcional)
--   nota_fiscal         -> número da nota da ENTRADA (opcional)
--   id_movimentacao_origem -> liga um AJUSTE ou ESTORNO à movimentação
--                             que ele corrige (contrato v27/v28)
-- ============================================================
ALTER TABLE public.historico_movimentacao
    ADD COLUMN IF NOT EXISTS motivo                 VARCHAR(20),
    ADD COLUMN IF NOT EXISTS fornecedor             VARCHAR(80),
    ADD COLUMN IF NOT EXISTS nota_fiscal            VARCHAR(20),
    ADD COLUMN IF NOT EXISTS id_movimentacao_origem INTEGER;

DO $$
BEGIN
    ALTER TABLE public.historico_movimentacao
        ADD CONSTRAINT fk_historico_origem
        FOREIGN KEY (id_movimentacao_origem)
        REFERENCES public.historico_movimentacao (id_movimentacao)
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    ALTER TABLE public.historico_movimentacao
        ADD CONSTRAINT chk_historico_motivo
        CHECK (motivo IS NULL OR motivo IN ('sale','damage','theft','expiry','internal'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

-- AJUSTE pode ter quantidade negativa (devolve ou retira do lote).
-- Os demais tipos continuam exigindo quantidade positiva.
ALTER TABLE public.historico_movimentacao
    DROP CONSTRAINT IF EXISTS chk_qtd_movimentacao_positiva;

DO $$
BEGIN
    ALTER TABLE public.historico_movimentacao
        ADD CONSTRAINT chk_qtd_movimentacao
        CHECK (
            (tipo_movimentacao = 'AJUSTE' AND quantidade <> 0)
            OR (tipo_movimentacao <> 'AJUSTE' AND quantidade > 0)
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;


-- ============================================================
-- 6. TABELA: notificacoes  (Avisos do sino)
-- ============================================================
-- OBJETIVO: Guardar os avisos exibidos no sino do cabeçalho.
--   - id_usuario nulo significa aviso para toda a conta
--   - tipo: min_stock | user_change | system | import_done
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id_notificacao SERIAL       PRIMARY KEY,
    id_empresa     INTEGER      NOT NULL,
    id_usuario     INTEGER,                       -- NULL = todos da conta
    tipo           VARCHAR(30)  NOT NULL,
    titulo         VARCHAR(150) NOT NULL,
    corpo          TEXT,
    lida           BOOLEAN      NOT NULL DEFAULT FALSE,
    link           VARCHAR(200),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_notificacoes_tipo
        CHECK (tipo IN ('min_stock','user_change','system','import_done')),
    CONSTRAINT fk_notificacoes_empresa
        FOREIGN KEY (id_empresa) REFERENCES public.empresas (id_empresa)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notificacoes_usuario
        FOREIGN KEY (id_usuario) REFERENCES public.usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_empresa ON public.notificacoes (id_empresa, lida);

COMMENT ON TABLE public.notificacoes IS 'Avisos do sino. id_usuario nulo = aviso de toda a conta.';


-- ============================================================
-- 7. TABELA: produto_notas  (Anotações do produto)
-- ============================================================
-- OBJETIVO: Registro cronológico de anotações sobre um produto.
--   Não se edita nem se apaga: só insere (como o histórico).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produto_notas (
    id_nota     SERIAL       PRIMARY KEY,
    id_produto  INTEGER      NOT NULL,
    id_usuario  INTEGER      NOT NULL,
    texto       VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notas_produto
        FOREIGN KEY (id_produto) REFERENCES public.produtos (id_produto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notas_usuario
        FOREIGN KEY (id_usuario) REFERENCES public.usuarios (id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notas_produto ON public.produto_notas (id_produto);


-- ============================================================
-- 8. TABELA: produto_alteracoes  (Trilha do cadastro do produto)
-- ============================================================
-- OBJETIVO: Uma linha por mudança no cadastro do produto.
--   tipo 'created' (cadastro) ou 'updated' (campo alterado).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produto_alteracoes (
    id_alteracao SERIAL      PRIMARY KEY,
    id_produto   INTEGER     NOT NULL,
    id_usuario   INTEGER,                        -- NULL quando veio de importação
    tipo         VARCHAR(20) NOT NULL,           -- created | updated
    campo        VARCHAR(40),                    -- name, salePrice, ...
    valor_de     TEXT,
    valor_para   TEXT,
    origem       VARCHAR(20),                    -- manual | file | integration
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_alteracoes_tipo CHECK (tipo IN ('created','updated')),
    CONSTRAINT fk_alteracoes_produto
        FOREIGN KEY (id_produto) REFERENCES public.produtos (id_produto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alteracoes_usuario
        FOREIGN KEY (id_usuario) REFERENCES public.usuarios (id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alteracoes_produto ON public.produto_alteracoes (id_produto, created_at DESC);


-- ============================================================
-- 9. TABELA: importacoes  (Histórico de importações de catálogo)
-- ============================================================
-- OBJETIVO: Guardar cada trabalho de importação, do envio ao resultado.
--   Cobre o essencial do contrato (v29): status, arquivos, mapeamento,
--   contagens e datas. O envio em partes é tratado pelo servidor.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.importacoes (
    id_importacao     SERIAL       PRIMARY KEY,
    id_empresa        INTEGER      NOT NULL,
    id_usuario        INTEGER,
    origem            VARCHAR(20)  NOT NULL DEFAULT 'file',
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending',
    arquivos          JSONB,                       -- [{ name, size }]
    colunas_detectadas JSONB,                      -- ["Nome", "EAN", ...]
    mapeamento        JSONB,                       -- { coluna: campo }
    total_linhas      INTEGER      NOT NULL DEFAULT 0,
    linhas_validas    INTEGER      NOT NULL DEFAULT 0,
    linhas_erro       INTEGER      NOT NULL DEFAULT 0,
    linhas_aviso      INTEGER      NOT NULL DEFAULT 0,
    linhas_excluidas  INTEGER      NOT NULL DEFAULT 0,
    linhas_criadas    INTEGER      NOT NULL DEFAULT 0,
    linhas_atualizadas INTEGER     NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    finished_at       TIMESTAMPTZ,

    CONSTRAINT chk_importacoes_status
        CHECK (status IN ('pending','uploading','mapping','previewing','running','done','failed','canceled')),
    CONSTRAINT chk_importacoes_origem
        CHECK (origem IN ('file','integration','manual')),
    CONSTRAINT fk_importacoes_empresa
        FOREIGN KEY (id_empresa) REFERENCES public.empresas (id_empresa)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_importacoes_usuario
        FOREIGN KEY (id_usuario) REFERENCES public.usuarios (id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_importacoes_empresa ON public.importacoes (id_empresa, created_at DESC);


-- ============================================================
-- 10. TRIGGERS updated_at PARA AS TABELAS NOVAS
-- ============================================================
-- Reaproveita a função public.fn_set_updated_at() criada na 001.
-- ============================================================
DROP TRIGGER IF EXISTS trg_empresas_updated_at ON public.empresas;
CREATE TRIGGER trg_empresas_updated_at
BEFORE UPDATE ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_pastas_updated_at ON public.pastas;
CREATE TRIGGER trg_pastas_updated_at
BEFORE UPDATE ON public.pastas
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ============================================================
-- 11. VIEW: vw_produto_resumo
-- ============================================================
-- OBJETIVO: Devolver cada produto já com o total em estoque, a validade
--   mais próxima e a classificação dessa validade. É o que a listagem de
--   estoque e o dashboard precisam, sem o servidor repetir o JOIN.
--   Produto sem lote aparece com quantidade 0 e classificação SEM_VALIDADE.
-- ============================================================
CREATE OR REPLACE VIEW public.vw_produto_resumo AS
SELECT
    p.id_produto,
    p.nome_comercial,
    p.ean,
    p.categoria,
    p.id_empresa,
    p.id_pasta,
    p.ativo,
    COALESCE(SUM(le.quantidade_atual), 0)                       AS quantidade_total,
    MIN(le.data_validade)                                        AS validade_mais_proxima,
    CASE
        WHEN MIN(le.data_validade) IS NULL                       THEN 'SEM_VALIDADE'
        WHEN (MIN(le.data_validade) - CURRENT_DATE) <= 0          THEN 'VENCIDO'
        WHEN (MIN(le.data_validade) - CURRENT_DATE) <= 30         THEN 'VERMELHO'
        WHEN (MIN(le.data_validade) - CURRENT_DATE) <= 60         THEN 'AMARELO'
        ELSE 'VERDE'
    END                                                          AS classificacao
FROM public.produtos p
LEFT JOIN public.lotes_estoque le
       ON le.id_produto = p.id_produto
      AND le.ativo = TRUE
      AND le.quantidade_atual > 0
GROUP BY p.id_produto, p.nome_comercial, p.ean, p.categoria,
         p.id_empresa, p.id_pasta, p.ativo;

COMMENT ON VIEW public.vw_produto_resumo IS 'Produto com total em estoque, validade mais próxima e classificação (SEM_VALIDADE inclui produto sem lote).';


-- ============================================================
-- FIM DA MIGRATION 003
-- ============================================================
