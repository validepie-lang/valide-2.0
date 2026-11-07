# Plano 067: Início com variação semanal, rosca por pasta e foto

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/lib/utils/week-change.ts` e `.test.ts` (novos) | `weekChange`: "+12% desde a semana passada", igual, a partir de zero, sem dado |
| `src/lib/utils/folder-share.ts` e `.test.ts` (novos) | `folderShares` (até cinco fatias, porcentagem que fecha 100), `folderSharesHeadline`, `sliceColor` |
| `src/lib/types/index.ts` | `DashboardData.valueAtRiskLastWeek` |
| `src/lib/mocks/dashboard.ts` | Valor em risco de sete dias atrás, derivado do catálogo |
| `src/components/dashboard/value-at-risk-card.tsx` (novo) | Cartão "Valor em risco" sai de `page.tsx`, com a pílula da variação |
| `src/components/dashboard/folder-risk-card.tsx` e `folder-risk-donut.tsx` (novos) | Cartão com título, rosca e legenda que filtra o Estoque |
| `src/components/dashboard/shelf-tip-card.tsx` (novo), `public/inicio/farmaceutica-prateleira.jpg` (novo) | Cartão com foto e dica da Ajuda |
| `src/app/(app)/page.tsx` | Usa os três; nova fileira no fim |
| `src/app/globals.css` | `--chart-share-1` a `4`, claro e escuro |
| Documentos | contrato v23, `para-o-pedro.md`, `design-system.md` (14.5 e 14.9), issue, validação, `ficou-de-fora.md` |

## Entrou na execução

- `sliceColor` foi para `folder-share.ts`: exportada do componente de cliente, o servidor não podia chamá-la
