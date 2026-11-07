-- ============================================================
-- SISTEMA VALIDE - DADOS INICIAIS / DADOS DE HOMOLOGAÇÃO
-- DML (Data Manipulation Language) - Script de povoamento
-- ============================================================
-- PROPÓSITO:
--   Inserir dados de exemplo (mock data) para permitir:
--     - Testes do RBAC (Balconista / Farmacêutico / Admin)
--     - Demonstração do sistema de cores (Verde / Amarelo / Vermelho / Vencido)
--     - Teste da estratégia FEFO de baixa
--     - Teste do histórico de movimentações e auditoria
--
-- IMPORTANTE:
--   Execute APÓS o script 001_create_schema.sql!
--   Este script apaga TODOS os dados antes de recriar (TRUNCATE CASCADE).
--   Em PRODUÇÃO NÃO USE ESTE SCRIPT diretamente.
-- ============================================================


-- ----------------------------------------------------------------
-- PASSO 0: LIMPEZA TOTAL (com desativação TEMPORÁRIA de triggers de bloqueio)
-- ----------------------------------------------------------------
-- ATENÇÃO: Os triggers trg_block_historico_update/delete e trg_block_lotes_delete
--          do script 001 BLOQUEIAM DELETE/TRUNCATE em historico/lotes
--          por segurança.  Por isso, FAZEMOS DROP ANTES DO TRUNCATE
--          e depois RECRIAMOS os mesmos triggers idênticos.
-- ----------------------------------------------------------------
-- Ordem de limpeza (respeitando Foreign Keys):
--   1º) histórico  (depende de lotes e usuários)
--   2º) lotes      (depende de produtos e usuários)
--   3º) produtos
--   4º) usuários   (depende de perfil_acesso)
--   5º) perfil_acesso (folha)
-- RESTART IDENTITY: os números de SERIAL voltam a começar do 1
-- CASCADE:         apaga registros de tabelas filhas automaticamente
-- ----------------------------------------------------------------

-- 0a) DROP temporário dos triggers de proteção (para permitir o reset)
DROP TRIGGER IF EXISTS trg_block_historico_update ON public.historico_movimentacao;
DROP TRIGGER IF EXISTS trg_block_historico_delete ON public.historico_movimentacao;
DROP TRIGGER IF EXISTS trg_block_lotes_delete       ON public.lotes_estoque;

-- 0b) LIMPEZA (agora sim, sem disparar os triggers de bloqueio)
TRUNCATE TABLE public.historico_movimentacao RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.lotes_estoque        RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.produtos             RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usuarios             RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.perfil_acesso        RESTART IDENTITY CASCADE;

-- 0c) RECRIAÇÃO IMEDIATA dos triggers de proteção
--     (mantém a segurança do banco - triggers existentes no 001_create_schema.sql)
CREATE TRIGGER trg_block_historico_update
BEFORE UPDATE ON public.historico_movimentacao
FOR EACH ROW EXECUTE FUNCTION public.fn_block_historico_change();

CREATE TRIGGER trg_block_historico_delete
BEFORE DELETE ON public.historico_movimentacao
FOR EACH ROW EXECUTE FUNCTION public.fn_block_historico_change();

CREATE TRIGGER trg_block_lotes_delete
BEFORE DELETE ON public.lotes_estoque
FOR EACH ROW EXECUTE FUNCTION public.fn_block_lotes_delete();


-- ============================================================
-- 1. PERFIS DE ACESSO (RBAC - CATÁLOGO FIXO)
-- ============================================================
-- Observação: O ID do perfil é FORÇADO aqui (1,2,3) para ficar
-- consistente com o código Python (ValideEstoque.checar_permissao_rbac).
-- Níveis são:
--   1 - BALCONISTA   (menor permissão)
--   2 - FARMACÊUTICO
--   3 - ADMIN        (maior permissão - nível 3 sempre pode tudo)
-- ============================================================
INSERT INTO public.perfil_acesso (id_perfil, nome_perfil, nivel, descricao) VALUES
(1, 'Balconista',   1, 'Operações diárias: entrada de lotes, consulta de alertas e registro de vendas no balcão.'),
(2, 'Farmaceutico', 2, 'Mesmas permissões do Balconista + autoriza descartes de vencidos e ajustes no estoque.'),
(3, 'Admin',        3, 'Acesso irrestrito ao sistema. Gerencia usuários, perfis e configurações globais.');

-- Ajusta o contador do SERIAL para continuar do 3 (último inserido)
SELECT setval('perfil_acesso_id_perfil_seq', 3, TRUE);


-- ============================================================
-- 2. USUÁRIOS DE TESTE  (4 operadores fictícios)
-- ============================================================
-- IMPORTANTE SOBRE SEGURANÇA:
--   - campo "senha_hash" contém APENAS um hash bcrypt FICTÍCIO de exemplo.
--   - Estas NÃO são senhas válidas (apenas placeholder para homologação).
--   - Em produção: integrar com tela de login + bcrypt REAL.
--
--   SENHAS CORRESPONDENTES DE TESTE (plaintext - só homologação):
--     login: admin        -> senha: admin123      (perfil 3 - Admin)
--     login: farmaceutico -> senha: farmacia123   (perfil 2 - Farmacêutico)
--     login: balconista   -> senha: balcao123     (perfil 1 - Balconista)
--     login: mariana      -> senha: mariana123    (perfil 1 - Balconista estagiária)
-- ============================================================
INSERT INTO public.usuarios (nome, login, senha_hash, ativo, id_perfil) VALUES
('Antonio Bezerra (Gerente)',         'admin',        '$2b$12$exemplehashadminXXXXXXXXXXXXXXXXXXXXXXXXXXXX',        TRUE, 3),
('Dra. Juliana Silva (Farmacêutica)', 'farmaceutico', '$2b$12$exemplehashfarmaceuticoXXXXXXXXXXXXXXXXXXXXXXXXXXX', TRUE, 2),
('Carlos Mendes (Balconista)',        'balconista',   '$2b$12$exemplehashbalconistaXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', TRUE, 1),
('Mariana Costa (Estagiária)',        'mariana',      '$2b$12$exemplehashmarianaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', TRUE, 1);


-- ============================================================
-- 3. PRODUTOS (12 medicamentos comuns em farmácias brasileiras)
-- ============================================================
-- Distribuídos em 6 categorias para testes de filtro por categoria
-- no dashboard: Analgésico, Anti-inflamatório, Antibiótico,
-- Protetor Gástrico, Anti-hipertensivo, Anti-diabético, etc.
-- ============================================================
INSERT INTO public.produtos (ean, nome_comercial, principio_ativo, categoria) VALUES
('7891234567890', 'Dipirona Sódica 500mg',       'Dipirona Sódica',              'Analgésico / Antitérmico'),
('7891234567891', 'Paracetamol 750mg',           'Paracetamol',                  'Analgésico / Antitérmico'),
('7891234567892', 'Ibuprofeno 600mg',            'Ibuprofeno',                   'Anti-inflamatório'),
('7891234567893', 'Amoxicilina 500mg',           'Amoxicilina',                  'Antibiótico'),
('7891234567894', 'Azitromicina 500mg',          'Azitromicina Di-hidratada',    'Antibiótico'),
('7891234567895', 'Omeprazol 20mg',              'Omeprazol',                    'Protetor Gástrico'),
('7891234567896', 'Losartana Potássica 50mg',    'Losartana Potássica',          'Anti-hipertensivo'),
('7891234567897', 'Metformina 850mg',            'Cloridrato de Metformina',     'Antidiabético'),
('7891234567898', 'Simvastatina 20mg',           'Simvastatina',                 'Redutor de Colesterol'),
('7891234567899', 'AAS 100mg',                   'Ácido Acetilsalicílico',       'Antiagregante Plaquetário'),
('7891234567800', 'Diclofenaco Potássico 50mg',  'Diclofenaco Potássico',        'Anti-inflamatório'),
('7891234567801', 'Cetirizina 10mg',             'Cetirizina',                   'Antialérgico');


-- ============================================================
-- 4. LOTES DE ESTOQUE  (13 lotes - para cobrir TODAS as faixas)
-- ============================================================
-- FAIXAS DE CLASSIFICAÇÃO DE VALIDADE:
--   🔴 VERMELHO :  0 a 30 dias  (ação IMEDIATA - atenção máxima)
--   🟡 AMARELO  : 31 a 60 dias  (atenção moderada)
--   🟢 VERDE    : > 60 dias     (seguro)
--   ⛔ VENCIDO  : dias < 0      (proibido vender - só descarte)
--
-- DATA BASE DO SCRIPT: CURRENT_DATE (2026-10-07 no dia da aplicação)
-- Todas as datas são calculadas dinamicamente (hoje +/- dias)
-- para o seed continuar válido mesmo se rodar daqui há alguns meses.
--
-- OBS 1: quantidade_inicial = quanto veio na Nota Fiscal de entrada
-- OBS 2: quantidade_atual  = saldo REAL no momento do seed (menor)
-- OBS 3: diferença entre inicial e atual é justificada no histórico (vendas)
-- ============================================================
INSERT INTO public.lotes_estoque
    (id_produto, numero_lote, data_validade, quantidade_atual, quantidade_inicial, data_entrada, id_usuario_entrada, ativo)
VALUES

-- 🔴 ==========================================================
-- 🔴 LOTES VERMELHOS (vencem nos PRÓXIMOS 30 dias)
-- 🔴 ==========================================================
(1,  'LOT-DIP-2405A', CURRENT_DATE + 5,   20, 100, CURRENT_TIMESTAMP - INTERVAL '30 days', 3, TRUE),  -- Dipirona 500mg   (5 dias para vencer)
(2,  'LOT-PAR-2406B', CURRENT_DATE + 12,  15,  80, CURRENT_TIMESTAMP - INTERVAL '25 days', 3, TRUE),  -- Paracetamol 750mg (12 dias para vencer)
(3,  'LOT-IBU-2404C', CURRENT_DATE + 25,  40, 200, CURRENT_TIMESTAMP - INTERVAL '20 days', 3, TRUE),  -- Ibuprofeno 600mg  (25 dias para vencer)

-- 🟡 ==========================================================
-- 🟡 LOTES AMARELOS (31 a 60 dias)
-- 🟡 ==========================================================
(4,  'LOT-AMO-2408D', CURRENT_DATE + 40,  30, 120, CURRENT_TIMESTAMP - INTERVAL '45 days', 3, TRUE),  -- Amoxicilina 500mg  (40 dias)
(5,  'LOT-AZI-2409E', CURRENT_DATE + 50,  18,  60, CURRENT_TIMESTAMP - INTERVAL '40 days', 3, TRUE),  -- Azitromicina 500mg (50 dias)
(6,  'LOT-OME-2410F', CURRENT_DATE + 55,  25, 100, CURRENT_TIMESTAMP - INTERVAL '35 days', 3, TRUE),  -- Omeprazol 20mg     (55 dias)

-- 🟢 ==========================================================
-- 🟢 LOTES VERDES (mais de 60 dias - seguros, sem preocupação imediata)
-- 🟢 ==========================================================
(7,  'LOT-LOS-2501G', CURRENT_DATE + 90,  60, 200, CURRENT_TIMESTAMP - INTERVAL '15 days', 3, TRUE),  -- Losartana 50mg     (90 dias)
(8,  'LOT-MET-2502H', CURRENT_DATE + 120, 80, 300, CURRENT_TIMESTAMP - INTERVAL '10 days', 3, TRUE),  -- Metformina 850mg   (120 dias)
(9,  'LOT-SIM-2503I', CURRENT_DATE + 180, 45, 150, CURRENT_TIMESTAMP - INTERVAL '5 days',  3, TRUE),  -- Simvastatina 20mg  (180 dias)
(10, 'LOT-AAS-2504J', CURRENT_DATE + 240, 70, 250, CURRENT_TIMESTAMP - INTERVAL '2 days',  3, TRUE),  -- AAS 100mg          (240 dias)
(11, 'LOT-DIC-2505K', CURRENT_DATE + 150, 35, 120, CURRENT_TIMESTAMP - INTERVAL '8 days',  3, TRUE),  -- Diclofenaco 50mg   (150 dias)
(12, 'LOT-CET-2506L', CURRENT_DATE + 200, 50, 180, CURRENT_TIMESTAMP - INTERVAL '3 days',  3, TRUE),  -- Cetirizina 10mg    (200 dias)

-- ⛔ ==========================================================
-- ⛔ LOTES VENCIDOS (já ultrapassaram a validade - para teste do DESCARTE)
-- ⛔ ==========================================================
(1,  'LOT-DIP-2312V', CURRENT_DATE - 15,   5, 100, CURRENT_TIMESTAMP - INTERVAL '90 days',  3, TRUE),  -- Dipirona vencida   (-15 dias)
(2,  'LOT-PAR-2311V', CURRENT_DATE - 30,   8,  80, CURRENT_TIMESTAMP - INTERVAL '120 days', 3, TRUE);  -- Paracetamol vencido (-30 dias)


-- ============================================================
-- 5. HISTÓRICO DE MOVIMENTAÇÕES (auditoria das movimentações passadas)
-- ============================================================
-- IMPORTANTE:
--   * A tabela historico_movimentacao é IMUTÁVEL - apenas INSERTs.
--   * Todos os valores já cadastrados aqui representam o "passado"
--     para explicar por que a quantidade_atual é MENOR que a inicial.
--   * Todas as quantidades > 0 (garantido por CHECK constraint).
-- ============================================================
INSERT INTO public.historico_movimentacao
    (id_lote, id_usuario, tipo_movimentacao, quantidade, data_registro, justificativa)
VALUES

-- ------------- ENTRADAS INICIAIS (Nota Fiscal) -----------------
-- 100% da quantidade_inicial de alguns lotes é justificada aqui.
-- Operação feita pelo Balconista Carlos Mendes (id_usuario = 3).
(1,  3, 'ENTRADA', 100, CURRENT_TIMESTAMP - INTERVAL '30 days',  'Entrada inicial - Nota Fiscal #1001 - Fornecedor PharmaDistribuidora'),
(2,  3, 'ENTRADA',  80, CURRENT_TIMESTAMP - INTERVAL '25 days',  'Entrada inicial - Nota Fiscal #1002 - Fornecedor PharmaDistribuidora'),
(3,  3, 'ENTRADA', 200, CURRENT_TIMESTAMP - INTERVAL '20 days',  'Entrada inicial - Nota Fiscal #1003 - Fornecedor MedSupri Brasil'),
(7,  3, 'ENTRADA', 200, CURRENT_TIMESTAMP - INTERVAL '15 days',  'Entrada inicial - Nota Fiscal #1004 - Fornecedor HiperMed'),
(8,  3, 'ENTRADA', 300, CURRENT_TIMESTAMP - INTERVAL '10 days',  'Entrada inicial - Nota Fiscal #1005 - Fornecedor HiperMed'),

-- ---------------- VENDAS NO BALCÃO (feitas pelo Balconista Carlos - id=3) -------------------
-- A soma destas vendas + quantidade_atual = quantidade_inicial
(1,  3, 'VENDA', 80, CURRENT_TIMESTAMP - INTERVAL '20 days',  'Venda no balcão - Cliente: João Pereira - CPF 123.456.789-00'),
(2,  3, 'VENDA', 65, CURRENT_TIMESTAMP - INTERVAL '15 days',  'Venda no balcão - Cliente: Maria Souza - CPF 222.333.444-55'),
(3,  3, 'VENDA', 160,CURRENT_TIMESTAMP - INTERVAL '12 days',  'Venda no balcão - Cliente: Pedro Almeida - CPF 333.222.111-00'),

-- ---------------- AJUSTES DE ESTOQUE (feitos pela Farmacêutica Juliana - id=2) -------------------
-- Operações que NÃO são venda - requerem perfil mínimo Farmacêutico (nível >= 2).
(7,  2, 'AJUSTE',  5, CURRENT_TIMESTAMP - INTERVAL '5 days',  'Ajuste de estoque após contagem física noturna (5 unidades não encontradas)'),
(8,  2, 'AJUSTE',  2, CURRENT_TIMESTAMP - INTERVAL '2 days',  'Ajuste de estoque - 2 unidades avariadas na entrega da NF 1005 (devolução fornecedor)');


-- ============================================================
-- FIM DO SCRIPT DE SEED - SISTEMA PRONTO PARA USO!
-- ============================================================
-- Resumo do que foi criado:
--   - 3 Perfis RBAC
--   - 4 Usuários de teste
--   - 12 Produtos / Medicamentos
--   - 13 Lotes ativos (3 vermelhos / 3 amarelos / 6 verdes / 2 vencidos)
--   - 10 Movimentações históricas (5 ENTRADA + 3 VENDA + 2 AJUSTE)
-- ============================================================
