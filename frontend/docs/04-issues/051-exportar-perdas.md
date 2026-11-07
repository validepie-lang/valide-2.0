# Issue 051: Exportar Perdas em planilha

**Origem:** item 52 de `ficou-de-fora.md`, liberado pelo Marcus em 10/10.
**Status:** executada e validada

## Referências

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| SaaS Data Table (issue 029) | 897 curtidas | "Export" no cabeçalho, botão secundário ao lado dos filtros |
| [Sales Analytics Dashboard](https://www.behance.net/gallery/206520067/Sales-Analytics-Dashboard) (issue 036) | 1.081 curtidas | O botão junto do seletor de período, no alto à direita |

## Faz

- "Exportar planilha" ao lado do seletor de período, que baixa `perdas-<período>-<data>.csv`
- O arquivo sai do mesmo relatório que a tela mostra (`GET /reports/losses`): total, por motivo, por semana ou mês, e os produtos com maior perda. Nenhum endpoint novo
- Feito para o Excel em português: ponto e vírgula, vírgula decimal, valor sem "R$" (para somar), data dd/mm/aaaa e acentos certos (BOM)
- `src/lib/utils/loss-csv.ts`, com 4 testes

## Não faz

PDF: a impressão do navegador já salva a tela em PDF.
