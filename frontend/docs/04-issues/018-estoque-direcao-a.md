# Issue 018: Estoque na direção visual A

**SPEC de origem:** `docs/03-specs/direcao-visual-a.md`
**Status:** executada e validada; não publicada (o Marcus está apresentando o projeto ao vivo)

## Faz

- Título de página em negrito em todas as telas (`PageHeader`)
- Linha de contexto sob "Estoque": total de produtos e quantos vencidos e a vencer pedem atenção, com a contagem na cor do estado
- Chips de estado maiores (40px), com sombra curta e a contagem em destaque
- Tabela em card de borda a borda, cabeçalho em `sunken`, linhas com a barra de estado à esquerda (regra 2 da SPEC), nome em semibold, data em peso médio e a distância na cor de texto do estado quando é Vencido ou A vencer
- Celular: os cartões da lista ganham a mesma barra e a distância colorida

## Não faz

Não muda filtros, colunas, ordenação nem o estado vazio.
