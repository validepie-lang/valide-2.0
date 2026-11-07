# Plan: Issue 054 - Entrada e saída gravam

**Issue:** `docs/04-issues/054-entrada-e-saida-gravam.md`
**Data:** 10/10/2026
**Status:** aprovado (ordem da fase de lógica combinada com o Marcus em 10/10)
**Etapa da esteira:** 6 de 12

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| action e serviço de lote | `addLot`, `createLot` (053) | sim, a entrada usa os mesmos |
| formato de resposta | `ActionResult`, `actionFailure`, `UNREACHABLE` (053) | sim |
| validação de lote | `validateQueueLot` (053) | em parte: a entrada tem fabricação e quantidade obrigatória, então `validateLot` ao lado, com as mesmas frases |
| avisos de lote enquanto se digita | `LotFields` (código repetido, fabricação depois da validade) | sim; ganha `errors` e `readOnly` |
| banner | nada parecido; o `EmptyState` não serve | não, `SavedBanner` novo |
| "Salvando…" e faixa de erro | escritos dentro da fila (053) | sim, saem para `form-status.tsx` e a fila passa a usar |

## 2. Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/lib/utils/exit-draft.ts` e `.test.ts` | `validateExit` |
| `src/components/ui/form-status.tsx` | `SubmitLabel`, `FormFailure`, `focusFirstError` |
| `src/components/ui/saved-banner.tsx` | a faixa de confirmação |
| `src/components/products/registered-banner.tsx` | `parseRegistered` e a frase da entrada e da saída |
| `src/components/products/exit-summary.tsx` | "Como o estoque fica", tirado da saída (passaria de 200 linhas) |

## 3. Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/lib/utils/lot-draft.ts` e `.test.ts` | `validateLot` |
| `src/lib/services/movements.ts`, `src/lib/actions/movements.ts` | `registerExit`, `exitLot` |
| `src/components/products/entry-form.tsx`, `exit-form.tsx` | enviar, validar, "Salvando…", falha, voltar com a confirmação |
| `src/components/products/lot-fields.tsx` | `errors`, `readOnly`, `aria-describedby`; lote marcado como obrigatório |
| `src/components/products/quick-fill-form.tsx` | usa `form-status` |
| `src/components/ui/quantity-stepper.tsx` | `describedBy`, `readOnly` |
| `src/components/ui/unsaved-guard.tsx` | só salvar zera o aviso |
| `src/app/(app)/estoque/[id]/page.tsx`, `src/app/(app)/estoque/entrada/page.tsx` | a faixa de confirmação |
| docs: contrato, ficou-de-fora | o front chama os dois `POST`; itens 101 e 102 |
