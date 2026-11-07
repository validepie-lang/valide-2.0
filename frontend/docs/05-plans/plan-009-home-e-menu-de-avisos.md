# Plan: Issue 009 - Home em uma coluna e menu de avisos

**Issue:** `docs/04-issues/009-home-e-menu-de-avisos.md`
**Data:** 08/10/2026
**Status:** aprovado ("pode seguir", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/dashboard/expiring-soon-list.tsx` | Lista "Vencem nos próximos 30 dias" |
| `src/components/layout/notifications-menu.tsx` | Sino com menu de avisos |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/(app)/page.tsx` | Composição nova; deixa de buscar avisos |
| `src/app/(app)/loading.tsx` | Esqueleto da Home nova |
| `src/components/layout/app-shell.tsx` | Sino vira `NotificationsMenu`, recebendo os avisos que o shell já carrega |
| `src/components/layout/header-actions.tsx` | Sai `NotificationBell` |
| `src/app/globals.css` | Saem `.glass`, `.glass-tab`, `.notch-tr`, tokens de vidro, `chart-1..6` |
| `src/lib/types/index.ts` | `ExpiringSoonItem.unit` |
| `src/lib/mocks/dashboard.ts` | `expiringSoon` só A vencer, cinco, com `unit`; semanas a partir de amanhã |
| `docs/01-references/api-contract.md` | v9 |
| `docs/01-references/design-system.md` | 14.5.1 e 14.6: o que saiu, saiu |
| `.claude/skills/componente-valide/SKILL.md` | Tira a nota "Saindo" do que já saiu |
| `docs/06-validations/validation-009-home-e-menu-de-avisos.md` | novo |

## Arquivos a remover

`dashboard/work-queue-stack.tsx`, `dashboard/folder-donut-chart.tsx`, `dashboard/recent-movements.tsx`, `dashboard/shortcuts-card.tsx`, `dashboard/side-panels.tsx`, `dashboard/expiring-soon-card.tsx`.

`ui/money.tsx` e `ui/stat-tile.tsx` ficam até a 011: o detalhe do produto ainda usa.

## Reutilizado

`Metric`, `StatusSummary`, `ExpiryWeekChart`, `expiryWeekHeadline`, `LinkButton`, `Card`, `StatusIcon`, `formatDate`, `formatExpiryDistance`, `formatQuantity`, `formatEventTime`, o padrão de menu do `UserMenu` (Esc, clique fora, foco de volta).

## Decisões de implementação

- **O menu de avisos é um `role="dialog"` com lista de links, não `role="menu"`.** Um aviso tem título, texto e hora; `menuitem` lê só um rótulo curto. Diálogo não modal, com nome, é o padrão de painel de notificação.
- **Aviso sem link vira item de texto**, não link para `#`. Link que não leva a lugar nenhum fere a regra "controle que parece clicável funciona".
- **A Home deixa de buscar avisos.** O shell já busca para o sino; a Home não usa mais.
