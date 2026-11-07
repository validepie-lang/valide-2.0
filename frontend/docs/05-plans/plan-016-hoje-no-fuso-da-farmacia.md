# Plan: Issue 016 - "Hoje" é o dia do calendário da farmácia

**Issue:** `docs/04-issues/016-hoje-no-fuso-da-farmacia.md`
**Data:** 08/10/2026
**Status:** aprovado ("faça a correção do hoje", Marcus, 08/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/lib/utils/calendar.ts` | `DEFAULT_TIME_ZONE` e `calendarToday(now?, timeZone?)` |
| `src/lib/utils/calendar.test.ts` | Testes da virada de dia, de mês e de ano no fuso |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/lib/utils/expiry.ts` | Padrão de `today` passa a ser `calendarToday()` |
| `src/lib/utils/expiry.test.ts` | Caso das 22h em Brasília |
| `src/lib/utils/format.ts` | Importa `DEFAULT_TIME_ZONE` de `calendar.ts` (e reexporta) |
| `src/lib/mocks/catalog.ts` | `TODAY = calendarToday()` |
| `docs/07-decisions/technical-decisions.md` | Decisão: o dia de referência é o do calendário da farmácia |
| `docs/01-references/design-system.md` | Nota de fuso da 14.4 cita `calendarToday` |
| `docs/06-validations/validation-016-hoje-no-fuso-da-farmacia.md` | novo |

## Reutilizado

Nenhuma tela muda: todas chamam `daysUntil` e `getExpiryStatus` sem passar `today`, e passam a receber o dia certo pelo padrão. É o motivo de a regra morar num lugar só.

## Decisão de implementação

`calendarToday` devolve `Date.UTC(ano, mês, dia)` da data local, lida pelo `Intl` com o fuso explícito. Não usa `getDate()` nem `getTimezoneOffset()`, que dependem do fuso da máquina: o servidor da Vercel está em UTC, e o computador do caixa pode estar com o fuso errado.
