# Plan: Issue 013 - Importar

**Issue:** `docs/04-issues/013-importar.md`
**Data:** 09/10/2026
**Status:** aprovado ("pode seguir", Marcus, 09/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/import/review-rows.tsx` | Linhas da revisão: tabela a partir de `lg`, lista abaixo (em 768 a tabela espremia o nome em três linhas). Tira a tabela de `step-review.tsx` |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/components/import/import-stepper.tsx` | Número e texto, sublinhado na atual, ✓ na concluída; só concluída é link |
| `src/components/import/step-source.tsx` | Uma coluna; primário no "Escolher arquivo"; saem os dois cards laterais |
| `src/components/import/step-mapping.tsx` | `tnum` no resumo |
| `src/components/import/step-review.tsx` | Três `Metric` sem card; usa `ReviewRows`; textos corrigidos; rodapé de botões |
| `src/components/import/step-result.tsx` | Sem card no resumo, sem verde, sem degradê, sem barra; histórico em lista simples |
| `src/app/(app)/estoque/importar/loading.tsx` | Esqueleto novo |
| `src/lib/mocks/imports.ts` | `unit` nas linhas da prévia (o arquivo tem a coluna UNID mapeada) |
| `docs/06-validations/validation-013-importar.md` | novo |

## Reutilizado

`Metric`, `Card` (só na tabela, que precisa de superfície), `LinkButton`, `Select`, `formatNumber`, `formatMoney`, `formatQuantity`, `formatEventTime`, os tokens `--error`.

## Como verificar

- Capturas dos quatro passos em 1440 claro e escuro, 1366, 768 e 360 (emulação)
- Teclado: Tab pelas etapas (só as concluídas recebem foco) e pelo rodapé de cada passo
