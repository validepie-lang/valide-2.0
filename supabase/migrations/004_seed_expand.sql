-- ============================================================
-- SISTEMA VALIDE - MIGRATION 004 - SEED COMPLEMENTAR
-- ============================================================
-- PROPÓSITO:
--   A migration 003 criou as colunas e tabelas novas com valores padrão.
--   Este script ENRIQUECE os dados de homologação para que o frontend,
--   ligado na API real, mostre números coerentes:
--     - empresa (conta) com dados completos
--     - pastas de produto
--     - custo, preço, unidade, estoque mínimo, marca, fornecedor e SKU
--       de cada um dos 12 produtos do seed 002
--     - motivo da movimentação no histórico (sale / internal)
--     - data de fabricação de alguns lotes
--
-- IMPORTANTE:
--   Execute APÓS 001, 002 e 003. É IDEMPOTENTE (UPDATE por chave natural;
--   INSERT com ON CONFLICT DO NOTHING).
-- ============================================================


-- ============================================================
-- 1. EMPRESA (conta padrão)
-- ============================================================
UPDATE public.empresas
   SET cnpj               = '12345678000190',
       razao_social       = 'Farmácia Valide LTDA',
       nome_fantasia      = 'Farmácia Valide',
       inscricao_estadual = '123456789',
       regime_tributario  = 'Simples Nacional',
       cep                = '74000000',
       logradouro         = 'Av. Anhanguera',
       numero             = '1000',
       complemento        = 'Loja 3',
       bairro             = 'Centro',
       cidade             = 'Goiânia',
       uf                 = 'GO',
       telefone           = '(62) 3333-1000',
       email              = 'contato@farmaciavalide.com.br',
       site               = 'https://farmaciavalide.com.br',
       fuso_horario       = 'America/Sao_Paulo',
       moeda              = 'BRL',
       idioma             = 'pt-BR',
       janela_a_vencer_dias = 30
 WHERE id_empresa = 1;


-- ============================================================
-- 2. PASTAS DE PRODUTO
-- ============================================================
INSERT INTO public.pastas (id_empresa, nome) VALUES
(1, 'Medicamentos'),
(1, 'Antibióticos'),
(1, 'Uso Contínuo'),
(1, 'Higiene e Beleza')
ON CONFLICT (id_empresa, nome) DO NOTHING;


-- ============================================================
-- 3. COMPLETAR O CADASTRO DOS PRODUTOS
-- ============================================================
-- Casa pelo código de barras (ean), que é natural e único, em vez de
-- depender do id serial. Dinheiro em CENTAVOS (inteiro).
-- ============================================================
UPDATE public.produtos SET
    id_empresa        = 1,
    sku               = 'DIP-500',
    marca             = 'Neo Química',
    fornecedor        = 'PharmaDistribuidora',
    unidade           = 'un',
    estoque_minimo    = 30,
    estoque_maximo    = 300,
    custo_aquisicao   = 250,
    custo_operacional = 0,
    preco_venda       = 690,
    id_pasta          = (SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Medicamentos'),
    fonte             = 'manual', ativo = TRUE
WHERE ean = '7891234567890';   -- Dipirona Sódica 500mg

UPDATE public.produtos SET
    id_empresa=1, sku='PAR-750', marca='Medley', fornecedor='PharmaDistribuidora',
    unidade='un', estoque_minimo=40, estoque_maximo=300,
    custo_aquisicao=320, custo_operacional=0, preco_venda=890,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Medicamentos'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567891';   -- Paracetamol 750mg

UPDATE public.produtos SET
    id_empresa=1, sku='IBU-600', marca='EMS', fornecedor='MedSupri Brasil',
    unidade='un', estoque_minimo=50, estoque_maximo=400,
    custo_aquisicao=480, custo_operacional=0, preco_venda=1290,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Medicamentos'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567892';   -- Ibuprofeno 600mg

UPDATE public.produtos SET
    id_empresa=1, sku='AMO-500', marca='Eurofarma', fornecedor='MedSupri Brasil',
    unidade='un', estoque_minimo=40, estoque_maximo=200,
    custo_aquisicao=1200, custo_operacional=0, preco_venda=3450,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Antibióticos'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567893';   -- Amoxicilina 500mg (vai ficar abaixo do mínimo)

UPDATE public.produtos SET
    id_empresa=1, sku='AZI-500', marca='Pfizer', fornecedor='MedSupri Brasil',
    unidade='un', estoque_minimo=30, estoque_maximo=150,
    custo_aquisicao=1850, custo_operacional=0, preco_venda=4890,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Antibióticos'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567894';   -- Azitromicina 500mg (vai ficar abaixo do mínimo)

UPDATE public.produtos SET
    id_empresa=1, sku='OME-020', marca='Medley', fornecedor='HiperMed',
    unidade='un', estoque_minimo=25, estoque_maximo=200,
    custo_aquisicao=390, custo_operacional=0, preco_venda=990,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Medicamentos'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567895';   -- Omeprazol 20mg

UPDATE public.produtos SET
    id_empresa=1, sku='LOS-050', marca='Medley', fornecedor='HiperMed',
    unidade='un', estoque_minimo=40, estoque_maximo=400,
    custo_aquisicao=280, custo_operacional=0, preco_venda=780,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Uso Contínuo'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567896';   -- Losartana Potássica 50mg

UPDATE public.produtos SET
    id_empresa=1, sku='MET-850', marca='Merck', fornecedor='HiperMed',
    unidade='un', estoque_minimo=40, estoque_maximo=500,
    custo_aquisicao=310, custo_operacional=0, preco_venda=850,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Uso Contínuo'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567897';   -- Metformina 850mg

UPDATE public.produtos SET
    id_empresa=1, sku='SIM-020', marca='Medley', fornecedor='HiperMed',
    unidade='un', estoque_minimo=25, estoque_maximo=300,
    custo_aquisicao=350, custo_operacional=0, preco_venda=940,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Uso Contínuo'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567898';   -- Simvastatina 20mg

UPDATE public.produtos SET
    id_empresa=1, sku='AAS-100', marca='Bayer', fornecedor='HiperMed',
    unidade='un', estoque_minimo=30, estoque_maximo=300,
    custo_aquisicao=190, custo_operacional=0, preco_venda=520,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Uso Contínuo'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567899';   -- AAS 100mg

UPDATE public.produtos SET
    id_empresa=1, sku='DIC-050', marca='EMS', fornecedor='MedSupri Brasil',
    unidade='un', estoque_minimo=20, estoque_maximo=200,
    custo_aquisicao=270, custo_operacional=0, preco_venda=760,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Medicamentos'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567800';   -- Diclofenaco Potássico 50mg

UPDATE public.produtos SET
    id_empresa=1, sku='CET-010', marca='Medley', fornecedor='PharmaDistribuidora',
    unidade='un', estoque_minimo=30, estoque_maximo=200,
    custo_aquisicao=300, custo_operacional=0, preco_venda=820,
    id_pasta=(SELECT id_pasta FROM public.pastas WHERE id_empresa=1 AND nome='Medicamentos'),
    fonte='manual', ativo=TRUE
WHERE ean = '7891234567801';   -- Cetirizina 10mg


-- ============================================================
-- 4. DATA DE FABRICAÇÃO DOS LOTES (contrato Lot.manufacturedAt)
-- ============================================================
-- Aproxima a fabricação de ~18 meses antes da validade, quando nulo.
-- ============================================================
UPDATE public.lotes_estoque
   SET data_fabricacao = data_validade - INTERVAL '18 months'
 WHERE data_fabricacao IS NULL;


-- ============================================================
-- 5. MOTIVO DAS MOVIMENTAÇÕES DO HISTÓRICO
-- ============================================================
--   VENDA   -> sale     (perda não; é venda)
--   AJUSTE  -> internal (consumo/ajuste interno)
--   ENTRADA -> NULL     (entrada não tem motivo de saída)
--   DESCARTE-> expiry   (quando existir)
-- ============================================================
UPDATE public.historico_movimentacao SET motivo = 'sale'     WHERE tipo_movimentacao = 'VENDA'  AND motivo IS NULL;
UPDATE public.historico_movimentacao SET motivo = 'internal' WHERE tipo_movimentacao = 'AJUSTE' AND motivo IS NULL;
UPDATE public.historico_movimentacao SET motivo = 'expiry'   WHERE tipo_movimentacao = 'DESCARTE' AND motivo IS NULL;


-- ============================================================
-- 6. NOTIFICAÇÕES DE EXEMPLO (sino do cabeçalho)
-- ============================================================
INSERT INTO public.notificacoes (id_empresa, id_usuario, tipo, titulo, corpo, lida, link)
SELECT 1, NULL, 'system', 'Bem-vindo ao Valide',
       'Sua conta foi preparada com dados de homologação. Explore o estoque e as validades.',
       FALSE, '/'
WHERE NOT EXISTS (SELECT 1 FROM public.notificacoes WHERE id_empresa = 1);


-- ============================================================
-- FIM DA MIGRATION 004
-- ============================================================
