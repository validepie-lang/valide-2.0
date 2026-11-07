# Plan: Issue 005 - Lote que vence hoje é Vencido

**Issue:** `docs/04-issues/005-vence-hoje-e-vencido.md`
**Data:** 08/10/2026
**Status:** aprovado ("pode ajustar", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/lib/utils/expiry.ts` | `days < 0` vira `days <= 0` |
| `src/lib/utils/expiry.test.ts` | "vence hoje" e "janela de 0" mudam de expectativa; entra o caso "amanhã é A vencer" |
| `src/lib/utils/format.ts` | `formatExpiryDistance(0)` diz "venceu hoje" |
| `docs/07-decisions/technical-decisions.md` | decisão de 08/10 substitui a de 17/09 |
| `docs/01-references/design-system.md` | trecho de código da seção 9 |
| `docs/01-references/api-contract.md` | decisão 10; ponto aberto 8 sem o primeiro item |
| `docs/08-project/pauta-reuniao.md` | item 2.5 resolvido |

Quem usa a regra (estoque, produto, Home, chip, formulário rápido, mocks) não muda: todos passam por `getExpiryStatus`. É exatamente para isso que ela mora num lugar só.
