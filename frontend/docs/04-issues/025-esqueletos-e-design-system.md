# Issue 025: Esqueletos de carregamento e design system na direção A

**SPEC de origem:** `docs/03-specs/direcao-visual-a.md`
**Status:** executada e validada; não publicada (o Marcus estava apresentando; publicar só com o aceite dele)

## Problema

As telas mudaram de forma nas issues 017 a 024, e quatro esqueletos ficaram com a forma antiga. Quando o dado chega, a tela pula de um desenho para outro:

- **Home**: o esqueleto mostra uma faixa de quatro segmentos, uma lista sem card e um gráfico solto. A tela real tem o card do valor em risco, os quatro cartões de estado 2 por 2, duas listas em card e o gráfico em card
- **Detalhe do produto**: os indicadores ficam soltos e as seções têm o título fora do card. Na tela real, os indicadores ficam dentro do cartão de situação, e cada seção é um card com cabeçalho
- **Validades pendentes**: o card do produto não tem a faixa cinza, e "A seguir" é uma lista solta. Na tela real, "A seguir" é um card
- **Importar**: o passo Origem não tem card

Além disso, o `design-system.md` ainda diz que card não tem sombra (14.6, e o aviso da seção 11), que o gráfico fica sem contêiner, em Ardósia, e que a faixa de status é de segmentos (14.3 e 14.5). Tudo isso deixou de valer na 017.

## Faz

- **Peças comuns:** `ListCardSkeleton` em `skeletons/pieces.tsx`, um card com cabeçalho e linhas, com ou sem a barra à esquerda. A barra sai colorida quando o estado é conhecido pela posição (a lista de vencidos da Home é sempre vermelha) e neutra quando depende do dado. `MetricCardSkeleton`, que não tinha uso e desenhava o ícone em quadrado, sai
- **Home:** a forma da tela real. Os cartões de estado aparecem com a faixa colorida, porque a ordem e a cor são fixas, mas sem o fundo tingido, que depende da contagem
- **Detalhe do produto:** o cartão de situação com a faixa neutra (o estado ainda não é conhecido) e os três indicadores dentro dele. Lotes, Histórico e Ficha vêm em card com cabeçalho
- **Validades pendentes:** a barra de progresso com 8px, o card com a faixa de Sem validade e "A seguir" em card
- **Importar:** o passo Origem em card
- **`design-system.md`:** atualizar 11, 14.3, 14.5 e 14.6, e criar a seção 15, com o resumo da direção A apontando para a SPEC

## Não faz

- Os esqueletos de Estoque, Configurações, Novo produto e Pastas, que já usam card com sombra

## Aceite

- [x] Captura antes e depois, lado a lado com a tela carregada, em 1440 claro e escuro, 768 e 360
- [x] Nada pula de lugar quando o dado chega (mesma grade, mesmas alturas aproximadas)
- [x] Sem rolagem horizontal em 360
- [x] `tsc`, lint, `npm test`

## Entrou na execução

- `CLAUDE.md`, seção 13: uma linha registrando a direção A entre as decisões fechadas. A linha de tipografia de 08/10 dizia que a Mona Sans só aparecia no título de página e no número herói, e isso deixou de ser verdade na 021
