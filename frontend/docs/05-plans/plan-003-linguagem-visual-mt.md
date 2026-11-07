# Plan: Issue 003 - Linguagem visual a partir da referência MT

**Issue:** `docs/04-issues/003-linguagem-visual-mt.md`
**Data:** 07/10/2026
**Status:** aprovado (pedido direto do Marcus, 07/10)
**Etapa da esteira:** 6 de 12

---

## 1. Pesquisa na base

| Procurei por | Encontrei | Decisão |
| --- | --- | --- |
| onde mora a cor | só `src/app/globals.css`, exposto ao Tailwind por `@theme inline` | trocar valores, manter os nomes. As telas não precisam mudar para herdar |
| tokens `deep` | login, cadastro, botão `onDeep`, logo, resultado da importação | passam a apontar para o navy do trilho |
| `rounded-lg` | 14 arquivos, todos cards | mudar o raio no token muda todos de uma vez |
| componentes da Home | herói, card de indicador e card de pendentes são usados só na Home | substituídos e apagados |
| `MovementsTable` | Home e detalhe do produto | fica para o produto; a Home ganha lista compacta |
| `TopNav` | só no shell | substituído pelo trilho |

## 2. Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/layout/side-rail.tsx` | trilho do desktop e barra inferior do celular |
| `src/components/ui/money.tsx` | valor em reais com centavos esmaecidos |
| `src/components/dashboard/risk-summary.tsx` | herói e os quatro blocos de estado |
| `src/components/dashboard/work-queue-stack.tsx` | pilha de abas das filas de trabalho |
| `src/components/dashboard/expiring-soon-card.tsx` | próximos a vencer, com recorte de canto |
| `src/components/dashboard/recent-movements.tsx` | movimentações em lista compacta |
| `src/components/dashboard/shortcuts-card.tsx` | atalhos |

## 3. Arquivos a modificar

`src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/app-shell.tsx`, `src/components/layout/header-actions.tsx`, `src/components/layout/logo.tsx`, `src/components/ui/card.tsx`, `src/components/ui/button.tsx`, `src/app/(app)/page.tsx`, `src/components/dashboard/side-panels.tsx`, `src/components/dashboard/folder-donut-chart.tsx`, `src/components/dashboard/expiry-week-chart.tsx`, `docs/01-references/design-system.md`, `docs/07-decisions/ux-decisions.md`, e `CLAUDE.md` (acrescentado durante a execução: a seção 14 ainda dava a tipografia como pendente, com Inter provisória).

## 4. Arquivos a apagar

`src/components/layout/top-nav.tsx`, `src/components/dashboard/hero-value-card.tsx`, `src/components/dashboard/expiry-indicator-card.tsx`, `src/components/dashboard/pending-expiry-card.tsx`.

## 5. Riscos

- **Tipografia estava na lista de pendências do `CLAUDE.md`.** A referência que o Marcus escolheu define Mona Sans, e a troca está isolada em `layout.tsx`. Registrada como decisão; se ele vetar, volta em uma linha
- Texto pequeno sobre gradiente é onde o MT reprova contraste. Cada par de texto sobre vidro é calculado
- O recorte de canto usa `mask`. Navegador sem suporte mostra o card inteiro, com o botão por cima, e continua funcionando
