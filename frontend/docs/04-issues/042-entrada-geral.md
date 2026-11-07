# Issue 042: Entrada geral com leitura de código

**Origem:** levantamento de telas e abas que faltam (10/10, item D), e itens 20 e 23 de `ficou-de-fora.md` (tela T5). A entrada de lote só abria de dentro de um produto: quem recebe uma caixa no balcão tinha de achar o produto no Estoque antes.
**Status:** executada e validada

## Referências

Behance, buscas "barcode scanner app", "goods receiving" e "point of sale search product", por apreciações, todos os tempos, mais os projetos de estoque já baixados. "Goods receiving" traz embalagens e marcas; os leitores de código são apps de consumidor (comida, QR). O que serve está nos sistemas de estoque:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), "Search Product With Scan" e mapa de telas | 524 curtidas, 15.571 visualizações | O botão de ler código dentro do próprio campo de busca; a busca como porta de entrada; "+ New Stock Adjustment" saindo da lista de ajustes |
| [Mobile App For Inventory](https://www.behance.net/gallery/192255499/Mobile-App-For-Inventory-UIUX), telas "Search" e "Scan QR" | 769 curtidas, 10.786 visualizações | Buscar e ler código são o mesmo passo; o resultado é uma lista curta com nome, código e quantidade |

## Faz

- Rota `/estoque/entrada`, aberta por "Registrar entrada" no cabeçalho de Movimentações (como o "+ New Stock Adjustment" do Inventar)
- Passo 1, "Qual produto chegou?": um campo só, com o foco já nele. O leitor de código do caixa funciona como teclado: bipou, o código entra no campo e o Enter busca. Código de barras ou código interno exato abre o produto direto
- Resultado em lista curta (nome, código interno, código de barras, quanto tem), cada um abrindo o passo 2. Nada encontrado: "Cadastrar produto", porque produto que chega pela primeira vez ainda não existe no Valide
- Passo 2: o produto escolhido no topo, com "Trocar produto", e o mesmo formulário da entrada pelo produto (028): lote, validade, quantidade e como o estoque fica
- Depois de bipar, o foco vai para o número do lote: quem está com a caixa na mão segue digitando
- O formulário de entrada passa a aceitar para onde "voltar sem registrar" leva

## Não faz

Itens 81 a 84 em `08-project/ficou-de-fora.md`. Ler pela câmera continua de fora (item 20): o leitor do caixa já funciona hoje, e a câmera é comportamento, da fase de lógica. Fornecedor e nota fiscal continuam no item 22.
