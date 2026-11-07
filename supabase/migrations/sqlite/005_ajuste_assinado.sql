-- ============================================================
-- SISTEMA VALIDE - Controle de Validade de Medicamentos
-- MIGRATION 005 - AJUSTE COM SINAL (SQLite local)
-- ============================================================
-- PROPÓSITO:
--   Alinhar o banco local data/valide.db ao PostgreSQL depois da 003.
--
--   A 003 do Postgres TROCOU a constraint chk_qtd_movimentacao_positiva
--   (quantidade > 0) por chk_qtd_movimentacao, que aceita AJUSTE com
--   quantidade NEGATIVA (o ajuste devolve ou retira do lote) e continua
--   exigindo quantidade positiva para VENDA / DESCARTE / ENTRADA.
--
--   No SQLite isso não foi possível na 003: a tabela nasceu em database.py
--   com "CHECK (quantidade > 0)" INLINE e o SQLite não remove um CHECK
--   inline sem recriar a tabela. Resultado: a correção de uma movimentação
--   (POST /movements/:id/correct) falhava no banco local com
--   "CHECK constraint failed: historico_movimentacao".
--
--   Esta migration recria historico_movimentacao com a mesma regra do
--   Postgres. Os dados são copiados antes do DROP, então nada se perde.
--
-- IDEMPOTÊNCIA:
--   Pode rodar quantas vezes quiser: a tabela temporária é derrubada no
--   começo e o rebuild termina sempre no mesmo estado.
--
-- DESVIO EM RELAÇÃO AO POSTGRES:
--   O Postgres ganha a constraint sem recriar a tabela (ALTER TABLE ...
--   DROP/ADD CONSTRAINT). O SQLite não tem esse caminho, então aqui a
--   tabela é reconstruída (CREATE + INSERT ... SELECT + DROP + RENAME).
-- ============================================================


-- ============================================================
-- 1. REBUILD DE historico_movimentacao COM AJUSTE ASSINADO
-- ============================================================
DROP TABLE IF EXISTS historico_movimentacao_novo;

CREATE TABLE historico_movimentacao_novo (
    id_movimentacao        INTEGER PRIMARY KEY AUTOINCREMENT,
    id_lote                INTEGER NOT NULL,
    id_usuario             INTEGER NOT NULL,
    tipo_movimentacao      TEXT    NOT NULL CHECK (tipo_movimentacao IN
                                ('VENDA','DESCARTE','AJUSTE','ENTRADA')),
    quantidade             INTEGER NOT NULL CHECK (
                                (tipo_movimentacao = 'AJUSTE' AND quantidade <> 0)
                                OR (tipo_movimentacao <> 'AJUSTE' AND quantidade > 0)),
    data_registro          TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    justificativa          TEXT,
    motivo                 TEXT,
    fornecedor             TEXT,
    nota_fiscal            TEXT,
    id_movimentacao_origem INTEGER,
    FOREIGN KEY (id_lote)    REFERENCES lotes_estoque(id_lote),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

INSERT INTO historico_movimentacao_novo (
    id_movimentacao, id_lote, id_usuario, tipo_movimentacao, quantidade,
    data_registro, justificativa, motivo, fornecedor, nota_fiscal,
    id_movimentacao_origem
)
SELECT
    id_movimentacao, id_lote, id_usuario, tipo_movimentacao, quantidade,
    data_registro, justificativa, motivo, fornecedor, nota_fiscal,
    id_movimentacao_origem
FROM historico_movimentacao;

DROP TABLE historico_movimentacao;

ALTER TABLE historico_movimentacao_novo RENAME TO historico_movimentacao;


-- ============================================================
-- 2. ÍNDICES (recriados: o DROP levou os antigos)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_historico_lote    ON historico_movimentacao(id_lote);
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_movimentacao(id_usuario);
