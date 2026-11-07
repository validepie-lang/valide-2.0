# Plan: Issue 004 - Acabamento visual e responsividade

**Issue:** `docs/04-issues/004-acabamento-visual-e-mobile.md`
**Data:** 07/10/2026
**Status:** aprovado (pedido direto do Marcus, 07/10)
**Etapa da esteira:** 6 de 12

---

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/ui/stat-tile.tsx` | bloco de indicador no formato da Home, para o detalhe do produto |
| `src/components/layout/theme-choice.tsx` | escolha de tema da tela de perfil |
| `.claude/skills/design-valide/SKILL.md` | skill de design do projeto: linguagem, grade, simetria, auditoria |
| `.claude/skills/design-valide/scripts/capturar.sh` | captura das rotas em 1440, 768 e 360, claro e escuro |

## Arquivos a modificar

| Caminho | Item |
| --- | --- |
| `src/components/layout/page-header.tsx` | G1 |
| `src/components/layout/header-actions.tsx` | G2 |
| `src/app/(app)/configuracoes/layout.tsx` | G3 |
| `src/app/(app)/estoque/page.tsx`, `src/components/products/filter-bar.tsx` | E1 |
| `src/components/products/product-table.tsx` | E2 |
| `src/app/(app)/estoque/[id]/page.tsx` | P1 |
| `src/components/products/quick-fill-form.tsx` | V1 |
| `src/components/import/import-stepper.tsx`, `src/components/import/step-source.tsx` | I1, I2 |
| `src/app/(app)/estoque/pastas/page.tsx` | F1 |
| `src/app/(app)/configuracoes/page.tsx` | C1 |
| `.claude/skills/componente-valide/SKILL.md` | citava componentes apagados e a paleta antiga |
| `docs/01-references/design-system.md` | seção de grade e simetria |

## Regras de layout que esta issue fixa

1. Tudo começa na mesma margem do título. Nada centralizado com largura máxima dentro da área logada, exceto estado vazio.
2. Em grade de duas colunas, a coluna mais curta não pode terminar antes da metade da mais longa. Se termina, o conteúdo está mal distribuído.
3. Linha de chips nunca quebra. Se não cabe, rola na horizontal dentro do próprio trilho.
4. Abaixo de `sm`, botões de ação dividem a largura.
