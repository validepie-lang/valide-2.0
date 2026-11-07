# Validação: Issue 008 - Componentes base

**Issue:** `docs/04-issues/008-componentes-base.md`
**Plano:** `docs/05-plans/plan-008-componentes-base.md`
**Data:** 08/10/2026
**Resultado:** passou, com o estado intermediário da Home descrito abaixo

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Valor em risco como R$ 8.573, completo no `title` e no leitor de tela | passou | `008/home-1440.png`; `fullValue` em `sr-only` e `title` |
| Um único botão cheio no topo | passou | "Ver produtos em risco". O "Ver vencidos" da pilha sai na 009 |
| Faixa em 4 colunas a partir de 768, 2 por 2 em 360, Vencido e A vencer maiores | passou | `008/home-1440.png`, `008/home-360-topo.png` |
| Cada segmento leva ao estoque filtrado; Sem validade à fila | passou | `href` de cada segmento |
| Gráfico com destaque no pico, valor em cada barra, título com a conclusão | passou | Empate de 6 lotes em duas semanas: as duas destacadas, título "As semanas de 15 out e 29 out concentram 6 lotes cada" |
| Abas de Configurações com sublinhado | passou | `008/configuracoes-1440.png` |
| Foco visível | passou | Segmentos e abas são links, com o anel de foco recuado para dentro (`-outline-offset-2`) para não ser cortado pelo contêiner |
| Claro e escuro, 1440, 768, 360 | passou | Capturas nas quatro variações |
| `npm test`, `tsc`, lint | passou | 53 testes, zero erro, zero aviso |

## Corrigido durante a validação

- **Datas do eixo sobrepostas** no card estreito ("8 out15 ou..."). O eixo passou a pular rótulos quando falta espaço; o valor de cada barra continua escrito nela.
- **"Informar validades" quebrando em 360**, com a seta sozinha numa linha. Em 360 o segmento tem uns 132px úteis: o texto cabe, texto e seta não. A seta aparece a partir de 640px.
- **Função do título dentro do arquivo `"use client"`.** A página roda no servidor e não pode chamar função exportada de módulo de cliente. Foi para `expiry-week-headline.ts`.

## Arquivos que mudaram em relação ao plano

- Entrou `src/lib/utils/cn.ts`: a escala de texto do `tailwind-merge` ainda tinha `card` e não tinha `display-sm`, ambos da 006.
- Entrou `src/components/dashboard/expiry-week-headline.ts` (motivo acima).
- Saiu `src/app/(app)/loading.tsx`: o esqueleto já desenhava um layout anterior à 003, e é reescrito uma vez só, na 009.

Os três estão registrados no plano.

## Estado intermediário da Home, até a 009

A coluna da esquerda da primeira linha termina uns 80px antes da pilha de filas, ao lado. A pilha, a rosca, os avisos, os atalhos e as movimentações saem na 009, e a Home vira uma coluna. Não vale corrigir a grade agora para desfazer em seguida.

O botão "Ver produtos em risco" já aponta para `status=expired,soon`. O estoque só aceita um estado até a 010, então hoje abre o estoque inteiro, que já vem ordenado pela validade e começa pelos vencidos e a vencer.

## Security Review

Sem dado sensível, permissão ou credencial.

## UX Review

- [x] Um nível 1 (valor em risco) e uma ação primária no topo
- [x] Status com cor, ícone e rótulo, sem quadrado colorido
- [x] Contagem zero apagada, sem sumir
- [x] Gráfico sem cor de status, destaque no pico
- [x] Sem travessão
