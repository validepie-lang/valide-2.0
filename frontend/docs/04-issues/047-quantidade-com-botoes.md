# Issue 047: Quantidade com − e +, e o formulário de saída dividido

**Origem:** itens 21 e 31 de `ficou-de-fora.md`, liberados pelo Marcus em 10/10.
**Status:** executada e validada

## Referências

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), "Adjust Stock" (issue 028) | 524 curtidas, 15.571 visualizações | O número no meio, − à esquerda e + à direita, numa caixa só |

## Faz

- `QuantityStepper` em `components/ui`: − e + em volta do campo. Os botões ficam fora do Tab; no teclado, as setas do campo fazem o mesmo
- Na quantidade do lote (cadastro, edição e entradas) e na saída, onde o + para no que o lote tem
- `ExitLotPicker`: a escolha do lote saiu do formulário de saída, que caiu de 212 para 150 linhas (limite 200)

## Não faz

- A fila de Validades pendentes continua com o campo simples: ali o uso é pelo teclado, e o − e o + não ajudam quem preenche 400 itens
