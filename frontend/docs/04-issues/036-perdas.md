# Issue 036: Perdas

**Origem:** levantamento de telas que faltam (09/10). O dono quer saber quanto perde; é o argumento comercial do Valide.
**Status:** executada e validada

## Referências

Behance, buscas "food waste dashboard", "reports dashboard saas" e "expense report dashboard", por apreciações, todos os tempos:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Sales Analytics Dashboard](https://www.behance.net/gallery/206520067/Sales-Analytics-Dashboard) | 1.081 curtidas, 8.530 visualizações | Três indicadores no topo, com a variação "vs. período anterior"; o seletor de período no topo; gráfico por categoria com a maior barra em destaque e as outras neutras |
| Gyle, Pharmly (issue 027) | 690 e 356 curtidas | O indicador principal em cartão cheio |
| Gyle, "Stock Alert" (issue 027) | 690 curtidas | A lista dos que mais pesaram, com o valor à direita |

As buscas de desperdício ("food waste") trazem app de doação de comida, sem relatório.

## Faz

- Rota `/perdas` e o item "Perdas" no menu (o canvas da direção A já mostrava)
- Seletor de período: 30 dias, 90 dias, 12 meses (`?periodo=`)
- Cartão cheio: total perdido, unidades e a variação em relação ao período anterior, em texto neutro
- "Por vencimento" (a parte que o controle evita, com link para Retirar vencidos) e "Por avaria e roubo"
- Perda por semana (ou por mês, no ano), com o pico em destaque e o valor escrito
- Por motivo, em barras horizontais da maior para a menor (design-system 14.5)
- Os cinco produtos que mais perderam, com o motivo principal
- Contrato v12: `GET /reports/losses`, proposto; dados simulados até lá (`mocks/losses.ts`)

## Não faz

Itens 50 a 55 em `08-project/ficou-de-fora.md`.
