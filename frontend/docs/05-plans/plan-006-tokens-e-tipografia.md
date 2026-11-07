# Plan: Issue 006 - Tokens, tipografia em duas famílias, forma e cor de erro

**Issue:** `docs/04-issues/006-tokens-e-tipografia.md`
**Data:** 08/10/2026
**Status:** aprovado (SPEC aprovada e "pode começar a construir", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a modificar

### Base

| Caminho | O que muda |
| --- | --- |
| `src/app/layout.tsx` | Carrega Inter (`--font-inter`) e Mona Sans (`--font-mona`) |
| `src/app/globals.css` | `font-sans` = Inter, `font-display` = Mona Sans; escala; raio; sem `shadow-card`; sem `.surface-card`; tokens `error` e `chart-base`/`chart-focus`; `.tnum` tabular, proporcional dentro de `.font-display` |

### Usos de token que sai (troca mecânica)

| Troca | Arquivos |
| --- | --- |
| `rounded-lg` para `rounded-md` | os 16 arquivos que usam, em `src/app` e `src/components` |
| `shadow-card` removido | os 8 arquivos que usam |
| `surface-card` para `bg-surface` | os 6 arquivos que usam |
| `text-card` para `text-section`; no avatar grande, `text-section` | `card.tsx`, `empty-state.tsx`, `error-state.tsx`, `avatar.tsx`, `logo.tsx` e os 4 do painel da Home |
| `text-eyebrow ... uppercase` para `text-label font-medium` | `estoque/[id]/page.tsx`, `filter-bar.tsx`, `risk-summary.tsx`, `work-queue-stack.tsx` |

### Fonte de exibição

| Caminho | O que muda |
| --- | --- |
| `src/components/layout/page-header.tsx` | `h1` em `font-display`, `text-display-sm` no celular |
| `src/components/dashboard/risk-summary.tsx` | número herói em `font-display` |
| `src/components/layout/logo.tsx` | nome "Valide" em `font-display` |

### Cor de erro

| Caminho | O que muda |
| --- | --- |
| `src/components/ui/field.tsx` | texto e borda de erro em `error` |
| `src/app/(auth)/login/page.tsx` | alerta de credencial em `error` |
| `src/components/products/exit-form.tsx` | borda de quantidade acima do lote em `error` |

### Documentação

| Caminho | O que muda |
| --- | --- |
| `CLAUDE.md` | Regra 1 da seção 5 com o erro; decisões fechadas com a revisão de 08/10 |
| `docs/01-references/design-system.md` | Seção 14: tokens novos com contraste conferido, e o `.glass` saindo só na 009 |
| `docs/01-references/visual-ref/README.md` | Nota de que parte do que veio da MT saiu em 08/10 |
| `.claude/skills/design-valide/SKILL.md` | Regras novas no lugar de vidro, recorte e caixa alta |
| `docs/06-validations/validation-006-tokens-e-tipografia.md` | novo |

## Reutilizado

Todos os componentes continuam. Nenhum componente novo nesta issue.

## Riscos

| Risco | Resposta |
| --- | --- |
| Tirar `--radius-lg` faria `rounded-lg` voltar ao valor padrão do Tailwind (8px) em silêncio | O token é desligado com `initial`, o que remove a classe; um uso esquecido aparece na busca do critério de aceite |
| Mona Sans com `.tnum` dentro do herói mostraria o zero com ponto | Regra no CSS: dentro de `.font-display`, algarismos proporcionais, com especificidade maior que `.tnum` |
| Inter do Google Fonts sem o recurso `tnum` | Conferido no arquivo em cache: a Inter servida pelo `next/font` tem `tnum` e `zero.tf` sem ponto |

## Verificação

`npm test`, `npx tsc --noEmit`, `npm run lint`; busca dos tokens que saíram; capturas de todas as telas em 1440 e 360, claro e escuro, comparadas com as de antes.
