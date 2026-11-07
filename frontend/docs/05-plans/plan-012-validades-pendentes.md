# Plan: Issue 012 - Validades pendentes

**Issue:** `docs/04-issues/012-validades-pendentes.md`
**Data:** 09/10/2026
**Status:** aprovado ("pode seguir", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/products/queue-progress.tsx` | `QueueProgress` (linha sob o título) e `UpNext` (lista "A seguir") |
| `src/components/products/queue-done.tsx` | Estado de fila concluída |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/components/products/quick-fill-form.tsx` | Composição nova; sai o chip; nome antes do metadado; usa as peças acima |
| `src/app/(app)/estoque/validades-pendentes/page.tsx` | Descrição curta; passa o valor parado por produto em vez do total |
| `src/app/(app)/estoque/validades-pendentes/loading.tsx` | Esqueleto novo, sem `mx-auto max-w-5xl` (tudo começa na margem do título) |
| `docs/06-validations/validation-012-validades-pendentes.md` | novo |

## Arquivo a remover

`src/components/products/queue-progress-panel.tsx`, substituído por `queue-progress.tsx`.

## Reutilizado

`Progress`, `Field`, `Input`, `Button`, `LinkButton`, `Card`, `StatusChip` (na prévia), `getExpiryStatus`, `formatMoney`, `formatMoneyWhole`, `formatQuantity`, `formatNumber`.

## Como verificar o teclado

Chrome controlado por script: preencher lote e data, Enter, conferir que o progresso foi a "1 de 18", que o valor parado caiu e que o foco está no campo do lote.
