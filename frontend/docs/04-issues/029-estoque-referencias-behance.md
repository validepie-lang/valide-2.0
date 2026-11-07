# Issue 029: Estoque a partir de referências do Behance

**Pedido do Marcus (09/10):** construir o sistema a partir de referências bem avaliadas do Behance.
**Status:** executada e validada

## Referências

Behance, buscas "data table ui" e "product list dashboard", por apreciações, todos os tempos:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [SaaS Data Table](https://www.behance.net/gallery/147041225/SaaS-Data-Table) | 897 curtidas, 40.229 visualizações | Busca, filtros e tabela no mesmo painel; filtros numa linha com "Clear filters"; ação à direita da barra; cabeçalho que ordena, com a seta; rodapé "1–10 of 138 items" com páginas numeradas |
| [Data table design for product & inventory management](https://www.behance.net/gallery/90858523/Data-table-design-for-product-inventory-management) | 178 curtidas, 20.719 visualizações | O mesmo arranjo numa lista de produtos: busca e filtros dentro do painel, "Product name ↓" no cabeçalho, paginação no rodapé |
| [Complex data tables on mobile](https://www.behance.net/gallery/90059503/Complex-data-tables-on-mobile) | 283 curtidas, 20.389 visualizações | Não se usa: resolve o celular com rolagem lateral, que o `CLAUDE.md` proíbe (tabela vira lista no celular) |

## Problema encontrado

A página busca 40 produtos e não tem paginação: com 80 no estoque, a metade não aparece, e o texto diz "80 produtos".

## Faz

- Busca, "Mais filtros", "Limpar filtros", os chips de situação e "Colunas" passam para dentro do card da tabela, no cabeçalho dele (SaaS Data Table; Data table for inventory)
- Ordenação no cabeçalho: Produto (A a Z), Validade (primeiro a vencer ou último) e Quantidade (menor primeiro), com a seta da ordem atual e `aria-sort`. Na URL, `ordem`
- Rodapé: "Mostrando 1–25 de 80 produtos", com Anterior, páginas numeradas e Próxima. Na URL, `pagina`. 25 por página
- Os chips de situação perdem a sombra (dentro do card, a sombra separava o que já está separado)
- `services/products.ts`: a expressão que tira acento usa escapes `\u`, não os caracteres invisíveis (resto da 022)

## Não faz

- **"Linhas por página"** (SaaS Data Table): o balconista não ganha com escolher; 25 cabe numa tela de 1440 com a barra de estado legível
- **Caixa de seleção por linha e ações em massa** (as duas referências): o Valide não tem ação em massa no estoque; a retirada de vencidos em lote é uma tela própria, na lista de telas que faltam
- **Ordenar no celular:** os cards do celular seguem a ordem padrão (o que vence primeiro)

## Aceite

- [x] Todos os 80 produtos alcançáveis pela paginação
- [x] A ordem do cabeçalho muda a lista e é anunciada (`aria-sort`)
- [x] Filtro, busca e ordem se preservam ao trocar de página; trocar filtro volta à página 1
- [x] Claro e escuro, 1440, 768 e 360 sem rolagem horizontal
- [x] `tsc`, lint, `npm test`
