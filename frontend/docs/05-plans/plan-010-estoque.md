# Plan: Issue 010 - Estoque

**Issue:** `docs/04-issues/010-estoque.md`
**Data:** 08/10/2026
**Status:** aprovado ("pode seguir", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/products/more-filters.tsx` | Botão e painel "Mais filtros" (cliente) |
| `src/components/products/column-picker.tsx` | Seletor de colunas (cliente), grava cookie e atualiza a página |
| `src/lib/utils/stock-columns.ts` | Colunas opcionais, nome do cookie e leitura do valor, num lugar só para servidor e cliente |
| `src/lib/utils/stock-columns.test.ts` | Teste da leitura do cookie (valor inválido, repetido, vazio) |
| `src/lib/hooks/use-dismiss.ts` | **Entrou na execução:** fechar com Esc e clique fora e devolver o foco. O menu da conta e o de avisos já repetiam isso; os dois painéis desta issue seriam a terceira e a quarta cópia. Os dois menus passam a usar o hook |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/(app)/estoque/page.tsx` | Cabeçalho, faixa de filtro, linha de contagem, lê `status` múltiplo, `fornecedor`, `marca` e o cookie de colunas |
| `src/app/(app)/estoque/loading.tsx` | Esqueleto com a forma nova |
| `src/components/skeletons/pieces.tsx` | **Entrou na execução:** `TableRowsSkeleton` desenhava os cards antigos e passava da borda em 360. Só o estoque usa |
| `.claude/skills/design-valide/scripts/capturar-celular.mjs` e `SKILL.md` | **Entrou na execução:** a captura em 360 por iframe travou o estoque no carregamento (o site em si carrega, conferido por emulação). Captura por emulação do Chrome, que também lista erro de console |
| `src/components/products/filter-bar.tsx` | Busca, "Mais filtros", limpar; chips de estado; sai a linha de pasta |
| `src/components/products/product-table.tsx` | Colunas padrão e opcionais; sai "no mínimo"; quantidade com unidade; card do celular |
| `src/lib/types/index.ts` | `ProductFilters.status` aceita lista; `supplier`, `brand`; `ProductFacets` |
| `src/lib/services/products.ts` | Filtros novos no mock e na API; `getProductFacets` |
| `src/components/layout/header-actions.tsx`, `notifications-menu.tsx` | Usam `useDismiss` no lugar da cópia local (entrou com o hook) |
| `docs/01-references/api-contract.md` | v10 |
| `src/app/(app)/page.tsx` | **Entrou na execução:** o comentário do botão da Home dizia que o filtro com dois estados só chegaria na 010 |
| `docs/01-references/screen-map.md` | Estoque: colunas, mais filtros, ação primária (já descrito; confere) |
| `docs/06-validations/validation-010-estoque.md` | novo |

## Reutilizado

`StatusChip`, `StatusDot`, `LinkButton`, `Card`, `EmptyState`, `PageHeader`, `formatDate`, `formatExpiryDistance`, `formatQuantity`, `formatMoney`, `daysUntil`, o padrão de painel do `NotificationsMenu` (Esc, clique fora, foco de volta).

## Decisões de implementação

- **"Mais filtros" é um formulário GET para `/estoque`**, com os filtros que já estão na URL em campos ocultos. Funciona sem JavaScript para aplicar, e o botão "Aplicar filtros" diz o que acontece.
- **Leitura do cookie validada**: só nomes de coluna conhecidos, sem repetir. Cookie adulterado vira as colunas padrão, nunca quebra a tabela.
- **Contagem dos chips continua vindo de `GET /dashboard`** (`counts`), como hoje. Não muda com os outros filtros: é a situação do estoque inteiro.
