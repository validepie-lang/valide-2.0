# Issue 028: Registrar entrada de lote

**Origem:** levantamento de telas que faltam (09/10/2026). Receber mercadoria é a ação diária do balconista, e hoje o único jeito de pôr um lote num produto existente é a fila de validades, feita para outra coisa.
**Pedido do Marcus:** cada escolha parte de referência bem avaliada do Behance.
**Status:** executada e validada

## Referências

Behance, buscas "stock adjustment", "goods receipt", "receive stock inventory" e "stock in inventory app", por apreciações, todos os tempos. Os termos genéricos trazem projetos de marca. Com tela de estoque:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), Fikri Studio | 524 curtidas, 15.569 visualizações | "Adjust Stock" é uma ação própria, "accessed directly from the product details" (texto da seção 15 do projeto): a entrada abre do detalhe do produto. O passo "Quantity" é um card com os campos e nada mais |
| [Mobile App For Inventory](https://www.behance.net/gallery/192255499/Mobile-App-For-Inventory-UIUX) | 769 curtidas, 10.781 visualizações | Só o fluxo de ler o código para achar o item (fica para depois, ver abaixo) |

Dentro do próprio app, a tela de saída (`/estoque/[id]/baixa`) já tem o desenho que a entrada repete, para quem usa as duas não reaprender: campos à esquerda, "Como o estoque fica" à direita, com o resultado antes de gravar.

Comportamento, pelo [Primer](https://primer.style/ui-patterns/saving): botão de registrar nunca desabilitado; voltar sem registrar sempre visível.

## Faz

- Rota `/estoque/[id]/entrada`, com "Voltar ao produto"
- Card "O lote que está chegando": número do lote, fabricação (opcional), validade e quantidade, com a situação calculada enquanto a data é digitada (o mesmo `LotFields` do cadastro)
- Card lateral "Como o estoque fica": total agora, entrando (+N un), total depois; e os lotes que o produto já tem, para não repetir um código por engano
- "Registrar entrada" e "Voltar sem registrar"
- Detalhe do produto: "Registrar entrada" no cabeçalho. Na edição (026), o card de lotes também ganha o atalho
- Esqueleto de carregamento

## Não faz

- **Gravar:** como as outras telas, protótipo visual até a fase de lógica. Endpoint: `POST /products/:id/lots`
- **Se a entrada vira movimentação no histórico, e o que acontece com código de lote repetido:** ponto aberto 12 do contrato, para o Pedro
- **Ler o código de barras com a câmera** (Inventar, Mobile App For Inventory): depende da entrada a partir da busca, fora de um produto. Fica para quando houver a entrada geral
- **Botões − e + na quantidade** (Inventar, passo Quantity): o app não tem esse controle, e a saída usa campo numérico; manter as duas iguais
- **Fornecedor e nota fiscal na entrada:** o endpoint não recebe esses campos

## Aceite

- [x] Abre do detalhe do produto, com e sem lote
- [x] A situação do lote aparece ao digitar a validade
- [x] "Como o estoque fica" soma a quantidade digitada
- [x] Claro e escuro, 1440, 768 e 360 sem rolagem horizontal
- [x] `tsc`, lint, `npm test`
