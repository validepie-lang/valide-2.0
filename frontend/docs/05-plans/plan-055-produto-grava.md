# Plan: Issue 055 - Cadastrar e editar produto gravam

**Issue:** `docs/04-issues/055-produto-grava.md`
**Data:** 10/10/2026
**Status:** aprovado (ordem da fase de lógica combinada com o Marcus em 10/10)
**Etapa da esteira:** 6 de 12

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| peças de envio | `form-status.tsx`, `ActionResult`, `SavedBanner` (053, 054) | sim |
| validação de lote | `validateLot` (054) | sim, nos lotes do cadastro |
| formato de dinheiro | `formatMoney` só formata; nada lê o digitado | não, `parseMoneyInput` novo |
| unicidade no banco | `produtos.ean` unique; não há SKU no banco | só o código de barras vira `409` |

## 2. Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/lib/utils/product-draft.ts` e `.test.ts` | `validateProduct`, `parseMoneyInput`, `sellsBelowCost` |
| `src/lib/actions/products.ts` | `addProduct`, `editProduct` |
| `src/components/products/product-fields.tsx` | os três cartões de dados, tirados do formulário |
| `src/components/products/product-form-state.ts` | ler os campos, valor inicial, conferir lotes, primeiro erro |

## 3. Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/lib/services/products.ts` | `createProduct`, `updateProduct` |
| `src/components/products/product-form.tsx` | validar, enviar, "Salvando…", falha, voltar com a confirmação |
| `src/components/products/product-lots-section.tsx` | o estado dos lotes sobe para o formulário |
| `src/app/(app)/estoque/page.tsx`, `src/app/(app)/estoque/[id]/page.tsx` | as faixas de confirmação |
| docs: contrato (v18), ficou-de-fora (103 a 105) | |
