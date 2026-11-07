# Plan: Issue 011 - Detalhe do produto

**Issue:** `docs/04-issues/011-detalhe-do-produto.md`
**Data:** 08/10/2026
**Status:** aprovado ("pode seguir", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/products/lot-situation.tsx` | A frase de nível 1 com o chip |
| `src/components/products/lots-table.tsx` | Tabela de lotes, com a lista do celular |

O detalhe tem 281 linhas; com as duas peças fora, fica abaixo de 200 (regra do `CLAUDE.md`).

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/(app)/estoque/[id]/page.tsx` | Composição nova |
| `src/app/(app)/estoque/[id]/loading.tsx` | Esqueleto novo |
| `src/components/layout/page-header.tsx` | `description` aceita conteúdo, não só texto, para a pasta ser link |
| `docs/01-references/design-system.md` | Seção 8: `StatTile` e `Money` saíram |
| `.claude/skills/componente-valide/SKILL.md` | Idem |
| `docs/06-validations/validation-011-detalhe-do-produto.md` | novo |

## Arquivos a remover

`src/components/ui/stat-tile.tsx`, `src/components/ui/money.tsx`: o detalhe era o último uso.

## Reutilizado

`Metric`, `StatusChip`, `MovementsTable`, `EmptyState`, `LinkButton`, `Card`, `PageHeader`, `daysUntil`, `formatDate`, `formatExpiryDistance`, `formatQuantity`, `formatMoney`, `formatMoneyWhole`.
