# Plano 070: Detalhe do produto

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/lib/types/index.ts` | `Product.photoUrl`, `ProductNote`, `ProductChange` |
| `src/lib/utils/product-extras.ts` e `.test.ts` (novos) | `noteError`, `photoFileError`, `usableStockWarning`, `describeChange` |
| `src/lib/utils/permissions.ts` e `.test.ts` (novo) | `canEditProduct`: Administrador e Farmacêutico |
| `src/lib/mocks/product-history.ts` (novo), `catalog.ts` | Notas e alterações de exemplo; `photoUrl: null`; segundo lote do esparadrapo, para o aviso do item 14 ter exemplo |
| `src/lib/services/product-extras.ts`, `src/lib/actions/product-extras.ts` (novos) | Notas, alterações e foto (contrato v26) |
| `src/components/products/product-notes.tsx`, `product-photo.tsx`, `product-changes.tsx` (novos) | As três partes novas |
| `src/components/products/product-overview.tsx`, `product-history-tab.tsx` (novos) | As abas saem de `estoque/[id]/page.tsx` (214 linhas) |
| `src/components/products/product-stock-card.tsx` | Aviso do estoque útil |
| `src/app/(app)/estoque/[id]/page.tsx` | Aba Notas, cargo nas abas, "Editar produto" só para quem edita |
| `src/app/(app)/estoque/[id]/editar/page.tsx`, `src/components/ui/no-permission.tsx` | Sem permissão para o Balconista; a frase aceita quem pode (`who`) |
| `src/app/(app)/estoque/page.tsx`, `src/components/products/stock-header.tsx` (novo) | Caixas de marcar só para quem edita; o cabeçalho sai da página (passava de 200 linhas) |
| Documentos | contrato v26, `para-o-pedro.md`, issue, validação, `ficou-de-fora.md` |

## Entrou na execução

- `stock-header.tsx`: tirar as caixas do Balconista levou `estoque/page.tsx` a 205 linhas
- `no-permission.tsx`: a frase dizia "tarefa de administrador", e o Farmacêutico também edita
- Segundo lote do esparadrapo no catálogo: nenhum produto de exemplo caía no caso do item 14
