# Plan: Issue 007 - Formatos de dado

**Issue:** `docs/04-issues/007-formatos-de-dado.md`
**Data:** 08/10/2026
**Status:** aprovado ("pode seguir", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/lib/utils/format.test.ts` | Testes de todas as funções de formato, com data de referência e fuso injetados |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/lib/utils/format.ts` | Funções novas, renomeadas e removidas; fuso padrão `America/Sao_Paulo` |
| `src/lib/types/index.ts` | `Movement.unit` |
| `src/lib/mocks/catalog.ts` | `isoAtLocalTime(daysAgo, "14:22")`: hora de Brasília para instante UTC |
| `src/lib/mocks/movements.ts` | usa o helper; preenche `unit` |
| `src/lib/mocks/notifications.ts` | usa o helper |
| `src/lib/mocks/imports.ts` | usa o helper. **Entrou durante a execução:** a importação gravava meia-noite UTC, que no fuso de Brasília aparecia como 21:00 do dia anterior |
| `src/components/products/movements-table.tsx` | `formatEventTime`, quantidade com sinal e unidade |
| `src/components/dashboard/recent-movements.tsx` | idem (sai na 009, mas precisa compilar) |
| `src/components/dashboard/side-panels.tsx` | `formatEventTime` (sai na 009) |
| `src/components/dashboard/expiry-week-chart.tsx` | `formatAxisDay` |
| `src/components/import/step-result.tsx` | data da importação anterior como evento |
| `docs/01-references/api-contract.md` | `Movement.unit`; convenção de exibição de hora no fuso da conta; v8 |
| `docs/01-references/design-system.md` | 14.4 confere com as funções |
| `docs/06-validations/validation-007-formatos-de-dado.md` | novo |

## Decisões de implementação

- **Mês abreviado** vem do `Intl` em pt-BR (`out.`, `set.`), sem o ponto e sem o "de". Escrever a lista de meses à mão duplicaria o que o navegador já sabe.
- **Fuso fixo nos dados de demonstração.** Brasília está em UTC−3 sem horário de verão desde 2019. O helper soma 3 horas; o maior horário do mock é 19:48, então nenhum evento troca de dia em UTC.
- **"Ano corrente" no fuso da farmácia**, não em UTC: um evento de 31/12 às 22:00 em Brasília é do ano que termina.

## Riscos

| Risco | Resposta |
| --- | --- |
| Node e navegador com dados de localidade diferentes | O Node 22+ vem com ICU completo; os testes rodam no mesmo `Intl` que o navegador usa |
| A API mandar hora local sem fuso | Contrato já diz UTC; a convenção de exibição entra ao lado |
