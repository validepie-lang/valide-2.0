# Plano 068: Tabela do Estoque

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/lib/utils/per-page.ts` e `.test.ts` (novos) | Opções 25, 50 e 100, cookie `valide_linhas`, `parsePerPage` |
| `src/components/products/per-page-select.tsx` (novo) | "Linhas por página", grava o cookie e volta à página 1 |
| `src/components/products/stock-pagination.tsx` | `sizeControl` antes das páginas |
| `src/components/products/product-table.tsx`, `product-table-cells.tsx` (novo), `sortable-th.tsx` | Uma tabela só, que rola no celular com a coluna do produto parada; células em arquivo próprio |
| `src/app/(app)/estoque/page.tsx` | Lê o cookie de linhas, `pasta=sem`, seletor de colunas também no celular |
| `src/lib/utils/no-folder.ts` (novo) | `sem` na URL, `none` na API |
| `src/lib/services/products.ts` | `folderId=none` e sem validade no fim em `expiry_desc` (simulado) |
| `src/lib/mocks/catalog.ts` | Quatro produtos sem pasta |
| `src/components/products/more-filters.tsx` | Opção "Sem pasta" |
| `src/app/(app)/estoque/pastas/page.tsx`, `folder-manager.tsx`, `folder-table.tsx`, `folder-unfiled-row.tsx` (novo) | Linha "Sem pasta" |
| Documentos | `CLAUDE.md` seção 10, contrato v24, `para-o-pedro.md`, issue, validação, `ficou-de-fora.md` |

## Entrou na execução

- `folder-unfiled-row.tsx`: com a linha nova, `folder-table.tsx` passava de 200 linhas
