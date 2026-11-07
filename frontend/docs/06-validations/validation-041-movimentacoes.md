# Validação: Issue 041 - Movimentações

**Data:** 10/10/2026
**Resultado:** passou

## Antes e depois

- **Antes:** entradas e saídas só apareciam no histórico de cada produto. Para saber o que saiu hoje, era preciso abrir produto por produto
- **Depois:** aba "Movimentações" no Estoque, com filtros à esquerda (Inventar) e a lista agrupada por dia (Ctrl Panel). 70 movimentações de exemplo em 30 dias

## Critérios

| Critério | Resultado |
| --- | --- |
| Abas "Produtos" e "Movimentações" nas duas telas, com a ativa sublinhada e o Estoque aceso no menu | ok |
| Tipo e período por botão; motivo e pessoa por lista com "Aplicar filtros" | ok |
| Escolher um motivo acende "Saídas"; com "Entradas", o campo de motivo some | ok |
| `?tipo=saida&motivo=vencimento&periodo=7d` mostra 2, feitas por Rafael (Farmacêutico) e Marcus (Administrador) | ok: descarte nunca aparece feito por Balconista |
| Filtro sem resultado (`?pessoa=u5`, acesso bloqueado) mostra o vazio com "Limpar filtros" | ok |
| Página além da última vai para a última (`?pagina=99` para `?pagina=3`) | ok, como no Estoque |
| Dia no fuso da farmácia: "Hoje", "Ontem", "quinta, 08/10" | ok, com teste (4 casos) |
| Direção por ícone e sinal, sem verde nem vermelho | ok |
| 1440 claro e escuro, 768 e 360 sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (69) e `next build` | passam |

## Corrigido na conferência

- No painel estreito, "Saídas" caía sozinho na segunda linha: os botões de tipo e período viraram grade de três, como os botões de situação do Inventar
- Em 768 a tabela apertava o nome do produto em quatro linhas: a tabela ficou para a tela grande; tablet e celular usam a lista
- "Aplicar filtros" ocupava a largura toda em 768

Capturas em `telas-novas/041/`. Filtros pedidos ao servidor no contrato, v15.
