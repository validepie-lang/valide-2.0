# Plan: Issue 053 - Validades pendentes grava

**Issue:** `docs/04-issues/053-validades-pendentes-grava.md`
**Data:** 10/10/2026
**Status:** aprovado (fase de lógica pedida pelo Marcus em 10/10, ordem combinada)
**Etapa da esteira:** 6 de 12

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| server action que já grava | `src/lib/actions/movements.ts` (`discardLots`, issue 035): chama o serviço, devolve `{ ok }` | sim, o mesmo caminho; a resposta ganha a mensagem do erro |
| serviço de lote | `src/lib/services/lots.ts` (`getLotsExpiring`, 052) | sim, `createLot` entra nele |
| erro tratado da API | `src/lib/api/errors.ts` (`ApiError`, `toApiError`, mensagens em português) | sim, a mensagem que a tela mostra sai daí |
| regra de lote repetido | `lot-fields.tsx` (`takenCodes`, mensagem "Este produto já tem o lote") | sim, a mesma frase no simulado |
| validação com teste | `lib/utils/user-draft.ts` e `user-draft.test.ts` (040) | sim, o mesmo formato (`*Errors` por campo) |
| feedback de status ao digitar | `getExpiryStatus` e a prévia que já estão na fila | sim, sem mudança |
| mensagem do campo | `Field` com `error` e `hint` | sim; ganha `id` na mensagem |

## 2. Arquivos a criar

| Caminho | O que é | Linhas estimadas |
| --- | --- | --- |
| `src/lib/actions/result.ts` | `ActionResult` e `actionFailure`: o formato de resposta de toda server action | 30 |
| `src/lib/actions/lots.ts` | `addLot`, server action | 25 |
| `src/lib/utils/lot-draft.ts` | `validateQueueLot`: campos obrigatórios, data completa, quantidade | 60 |
| `src/lib/utils/lot-draft.test.ts` | teste da validação | 60 |
| `src/components/products/queue-lot-fields.tsx` | os três campos e a prévia, tirados da fila (o arquivo passaria de 200 linhas) | 110 |

## 3. Arquivos a modificar

| Caminho | O que muda exatamente |
| --- | --- |
| `src/lib/services/lots.ts` | `createLot`: com `products` ligado, `POST /products/:id/lots`; sem, confere produto e código repetido como o servidor e responde sem guardar |
| `src/components/products/quick-fill-form.tsx` | salvar de verdade: validar, enviar, "Salvando…", sucesso com a linha "Salvo", falha guardando o digitado |
| `src/components/ui/field.tsx` | `id` na mensagem de erro e na dica (`<htmlFor>-mensagem`) |
| `docs/01-references/api-contract.md` | nada de endpoint novo; a seção da fila diz que o preenchimento já chama o `POST` |
| `docs/08-project/ficou-de-fora.md` | itens 98 a 100 |

## 4. Fora do plano

Nenhuma tela além da fila. Entrada e saída são a issue 054.
