# Plano 069: Marcar produtos e agir em vários

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/lib/utils/stock-selection.ts` e `.test.ts` (novos) | Estado da caixa do cabeçalho, "N marcados", confirmação de mover |
| `src/lib/utils/stock-params.ts` e `.test.ts` (novos) | Leitura da URL do Estoque (estados, página, ordem, recorte, link de retirar), usada pelo Estoque e por Retirar vencidos |
| `src/lib/services/product-folders.ts` (novo) | `moveProductsToFolder` (PATCH /products/folder, v25) e `productIdsMatching` |
| `src/lib/actions/products.ts` | `moveToFolder`, com o filtro limpo no servidor |
| `src/components/products/stock-selection.tsx` (novo) | Seleção (contexto), barra de ações, "todos os N", caixas da linha e do cabeçalho |
| `src/components/products/move-folder-dialog.tsx` (novo) | Janela de mover |
| `src/components/products/product-table.tsx`, `sortable-th.tsx` | Caixas na coluna do produto; `leading` no cabeçalho |
| `src/app/(app)/estoque/page.tsx`, `src/components/products/empty-stock-state.tsx` (novo) | Envolve a tabela na seleção; estado vazio sai do arquivo (a página passava de 200 linhas) |
| `src/app/(app)/estoque/retirar-vencidos/page.tsx` | `?produtos=` e o recorte do Estoque, com "Ver todos os vencidos" |
| Documentos | contrato v25, `para-o-pedro.md`, issue, validação, `ficou-de-fora.md` |

## Entrou na execução

- `stock-params.ts` e `empty-stock-state.tsx`: com a seleção, `estoque/page.tsx` chegava a 247 linhas
