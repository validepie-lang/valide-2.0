# Issue 050: Filtrar avisos, ordenar no celular e movimentações de um produto

**Origem:** itens 9, 58, 63 e 78 de `ficou-de-fora.md`, liberados pelo Marcus em 10/10.
**Status:** executada e validada (o item 63 ficou de fora, ver abaixo)

## Referências

São ajustes de comportamento em telas que já vieram do Behance. Cada um reaproveita um padrão que o sistema já tem, com a referência de origem:

| Item | Padrão reaproveitado | Referência de origem |
| --- | --- | --- |
| 58, filtrar avisos | Chips de filtro com contagem, os do Estoque | SaaS Data Table (897 curtidas, issue 029) |
| 9, ordenar no celular | O painel "Mais filtros" do Estoque | Data table for inventory (issue 029) |
| 78, movimentações de um produto | O filtro como pílula com "×", como os filtros aplicados | SaaS Data Table (issue 029) |

**Item 63, busca na página 404: não feito.** Buscas "404 page", "404 page search" e "error page" por apreciações: nenhuma das bem avaliadas (404 Error Page Template 1.403, Error Page Design 554, 404 Page Design Concepts 522, 404 pack #2 410, a da UxJournal 212) tem campo de busca. Pela regra de 09/10, não entra sem referência; os atalhos para Estoque, Validades e Avisos continuam.

## Faz

- Avisos: chips "Todos", "Não lidos", "Validade", "Estoque mínimo", "Equipe" e "Importação", cada um com a contagem; vazio diz que os outros continuam em Todos
- Estoque no celular e no tablet: "Ordem" no "Mais filtros" (vence primeiro, vence por último, nome, menor quantidade). Na tela grande o campo some, porque a ordem fica no cabeçalho da tabela
- Movimentações aceita `?produto=`: a pílula com o nome do produto e o "×" para tirar; o histórico do produto ganha "Ver em Movimentações, com filtros". O contrato já tinha `productId`
