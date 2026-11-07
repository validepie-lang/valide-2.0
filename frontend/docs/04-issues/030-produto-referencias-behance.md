# Issue 030: Detalhe do produto a partir de referências do Behance

**Pedido do Marcus (09/10):** construir o sistema a partir de referências bem avaliadas do Behance.
**Status:** executada e validada

## Referências

Behance, buscas "product details dashboard" e "inventory product detail", por apreciações, todos os tempos:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), Fikri Studio, tela "Product Details" | 524 curtidas, 15.569 visualizações | (1) Abas abaixo do título: "General Information", "History", "Notes". (2) Card "Stock" à direita: "Quantity at hand" em número grande, "Adjust Stock" logo abaixo, a quantidade separada por depósito. (3) "Basic information" em pares de rótulo e valor, embaixo do conteúdo principal, à esquerda. (4) "Edit" no cabeçalho |
| [Dashboard / Order Detail Page](https://www.behance.net/gallery/140414089/Dashboard-Order-Detail-Page) | 266 curtidas, 10.366 visualizações | Abas logo abaixo do título da página, sublinhando a ativa |
| [Ecommerce Product Details](https://www.behance.net/gallery/181679741/Ecommerce-Product-Details) | 587 curtidas, 4.249 visualizações | Não se usa: o detalhe gira em torno de foto e avaliações, que o Valide não tem |

## Faz

- Abas "Visão geral" e "Histórico (N)" abaixo do título, com o `TabsNav` que já existia (ganhou `active` para aba na query, `?aba=historico`)
- Visão geral em duas colunas: situação, lotes e ficha à esquerda; card "Estoque" à direita (Inventar)
- Card "Estoque": "Em estoque" em número grande, "abaixo do mínimo" quando for o caso, "Registrar entrada" logo abaixo (o "Adjust Stock"), a quantidade por lote com o chip de situação, e o custo parado
- Ficha em três grupos lado a lado (Identificação, Valores, Estoque)
- "Registrar entrada" sai do cabeçalho: mora no card Estoque, como no Inventar
- No celular, a ordem é situação, lotes, estoque e ficha (o estoque é nível 2, a ficha nível 3)
- Esqueleto de carregamento na forma nova

## Não faz

- **Aba "Notes"** (Inventar): o Valide não tem observação de produto, e o contrato também não
- **Foto do produto** (Inventar, Ecommerce Product Details): o cadastro não tem imagem
- **Quantidade por lote com "low"** (Inventar marca depósito com pouco estoque): o mínimo é do produto, não do lote; o aviso "abaixo do mínimo" fica no total
