# Issue 048: Retirar vencidos com folha impressa e quantidade por lote

**Origem:** itens 47 e 48 de `ficou-de-fora.md`, liberados pelo Marcus em 10/10.
**Status:** executada e validada

## Referências

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Data Table UX/UI](https://www.behance.net/gallery/77856047/Data-Table-UXUI) (issue 035) | 576 curtidas, 18.718 visualizações | A linha marcada ganha o campo de edição no fim, sem sair da tabela |
| SaaS Data Table (issue 029) | 897 curtidas | A ação de levar a tabela para fora ("Export") no cabeçalho, como botão secundário |
| Inventar, "Adjust Stock" (issue 047) | 524 curtidas | O − e o + na quantidade |

A folha impressa não tem referência no Behance (é papel, não tela): segue a própria tabela da tela, em preto no branco.

## Faz

- "Imprimir lista" no cabeçalho, para todos os cargos: o balconista é quem percorre as gôndolas
- A folha: farmácia, data e número de lotes; produto, lote, venceu em, quantidade, e duas caixas, "Retirado" e "Não achei"; "Conferido por" e data no fim. Menu, cabeçalho e botões somem na impressão
- Em cada lote marcado, "Sai do estoque" com − e +, começando no lote inteiro. O resumo do topo acompanha (unidades e custo)
- Quantidade fora do lote (zero ou mais do que tem) mostra o aviso e trava "Registrar descarte"
- O contrato não muda: `POST /movements/out/batch` já recebe a quantidade de cada lote
- `discard-batch.tsx` dividido (linha, folha e tela de fim em arquivos próprios): 196 linhas
- No celular, o nome do produto quebra linha em vez de cortar
