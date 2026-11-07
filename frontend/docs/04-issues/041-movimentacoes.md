# Issue 041: Movimentações

**Origem:** levantamento de telas e abas que faltam (10/10, item C). O histórico de entradas e saídas só existia dentro de cada produto; o dono não tinha como ver "quem tirou o quê do estoque hoje".
**Status:** executada e validada

## Referências

Behance, buscas "transaction history dashboard", "activity log ui", "stock movement", "inventory history" e "inventory audit", por apreciações, todos os tempos. Os termos trazem marcas, carteiras de cripto e rastreadores de atividade física; o histórico de estoque aparece dentro de sistemas de estoque e de gestão:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), mapa de telas e lista de produtos | 524 curtidas, 15.571 visualizações | "Stock Adjustment List" como sub-item do Estoque, ao lado de "Product"; os filtros num painel à esquerda (situação em botões, ordem e listas de escolha) e a lista à direita |
| [Ctrl Panel, Ecommerce Management System](https://www.behance.net/gallery/96148423/Ctrl-Panel-Ecommerce-Management-System) | 1.431 curtidas, 5.373 visualizações | A tabela agrupada: cada grupo abre com uma faixa cinza com o nome do grupo, e as linhas embaixo; aba "Transactions history" separada do perfil |
| SaaS Data Table (issue 029) | 897 curtidas | O rodapé "Mostrando 1–25 de N" com as páginas |

## Faz

- Rota `/estoque/movimentacoes`, com abas "Produtos" e "Movimentações" embaixo do título do Estoque, como o sub-menu do Inventar
- Filtros à esquerda, da tela grande em diante: tipo (Todas, Entradas, Saídas), motivo da saída, pessoa e período (hoje, 7 dias, 30 dias). No celular e no tablet, em cima da lista. Formulário GET: o filtro fica no endereço
- Lista agrupada por dia, como o Ctrl Panel: faixa "Hoje", "Ontem" ou "quarta, 08/10", e embaixo a hora, o produto com o lote, o movimento, a quantidade com sinal e quem fez. Observação, quando há, embaixo do produto
- Direção por ícone e sinal, sem cor: verde e vermelho são de validade (como já fazia o histórico do produto)
- 25 por página, com o rodapé do Estoque
- Dados de exemplo: 12 movimentações viraram 70 em 30 dias, e descarte por vencimento ou avaria só aparece feito por Farmacêutico ou Administrador (regra do banco)
- Contrato v15: `GET /movements` ganha `type`, `reason`, `userId` e `from`

## Não faz

Itens 75 a 80 em `08-project/ficou-de-fora.md`.
