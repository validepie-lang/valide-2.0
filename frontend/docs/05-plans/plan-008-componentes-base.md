# Plan: Issue 008 - Componentes base

**Issue:** `docs/04-issues/008-componentes-base.md`
**Data:** 08/10/2026
**Status:** aprovado ("depois siga", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/ui/metric.tsx` | Anatomia única de indicador |
| `src/components/dashboard/status-summary.tsx` | Faixa dos quatro estados |
| `src/components/ui/tabs-nav.tsx` | Abas com sublinhado, rota ativa por `usePathname` |
| `src/components/dashboard/expiry-week-headline.ts` | `expiryWeekHeadline` e `peakWeeks`, fora do arquivo `"use client"` do gráfico para a página no servidor poder chamar |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/(app)/page.tsx` | Linha 1: `Metric` + botão primário + `StatusSummary` no lugar do `RiskSummary`; título do gráfico vira a conclusão |
| `src/components/dashboard/expiry-week-chart.tsx` | Padrão de gráfico; exporta `expiryWeekHeadline` |
| `src/components/layout/settings-nav.tsx` | Usa `TabsNav` |
| `src/lib/utils/cn.ts` | **Entrou na execução:** a escala de texto do `tailwind-merge` ainda listava `card` (saiu na 006) e não tinha `display-sm` (entrou na 006). Sem isso, `cn` trataria `text-display-sm` como cor |
| `docs/01-references/design-system.md` | Seção 8 com os componentes novos |
| `docs/06-validations/validation-008-componentes-base.md` | novo |

**Saiu do plano na execução:** `src/app/(app)/loading.tsx`. O esqueleto da Home já desenhava um layout anterior à issue 003; reescrever para o estado intermediário e de novo na 009 seria trabalho dobrado. Fica para a 009, com a Home final.

## Arquivos a remover

| Caminho | Por quê |
| --- | --- |
| `src/components/dashboard/risk-summary.tsx` | Substituído por `Metric` e `StatusSummary` |

## Reutilizado

`StatusIcon` e `STATUS_LABEL`/`STATUS_ORDER` (ícone e rótulo de status, sem duplicar), `LinkButton`, `formatMoneyWhole`, `formatMoney`, `formatNumber`, `formatAxisDay`.

## Decisões de implementação

- **Faixa com `gap-px` sobre fundo `line`.** As linhas entre os segmentos funcionam igual em 4 colunas e em 2 por 2, sem lógica de borda por posição.
- **Número de tamanhos diferentes alinhado pela base.** O número fica numa caixa de altura fixa, alinhado embaixo, para Vencido (28px) e No prazo (18px) terminarem na mesma linha.
- **"Informar validades" dentro do link do segmento**, não um segundo link. Link dentro de link é HTML inválido e confunde leitor de tela.
- **Sem dica flutuante no gráfico.** Com o valor escrito em cada barra, a dica repete o que já está na tela.
