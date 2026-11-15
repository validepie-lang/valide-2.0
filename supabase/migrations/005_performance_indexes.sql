-- 005_performance_indexes.sql
-- Índices de performance para acelerar consultas frequentes.
-- Aplicado em 2026-11-15.

-- A query de movimentações usa uma subconsulta correlacionada que filtra
-- historico_movimentacao por id_movimentacao_origem. Sem índice, cada linha
-- faz um full scan na tabela.
CREATE INDEX IF NOT EXISTS idx_historico_origem
    ON public.historico_movimentacao (id_movimentacao_origem);

-- A listagem de movimentações filtra por data_registro DESC e por empresa
-- (via JOIN com produtos). Garante que o ORDER BY use índice.
CREATE INDEX IF NOT EXISTS idx_historico_data
    ON public.historico_movimentacao (data_registro DESC);
