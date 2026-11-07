# Validação: Issue 016 - "Hoje" é o dia do calendário da farmácia

**Issue:** `docs/04-issues/016-hoje-no-fuso-da-farmacia.md`
**Plano:** `docs/05-plans/plan-016-hoje-no-fuso-da-farmacia.md`
**Data:** 08/10/2026
**Resultado:** passou

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Às 22h de Brasília, lote de amanhã é A vencer, a um dia | passou | Teste em `expiry.test.ts` |
| Às 22h de Brasília, lote de hoje é Vencido | passou | Teste em `expiry.test.ts` |
| Não depende do fuso da máquina | passou | `calendar.test.ts` injeta o instante em UTC; a data é lida pelo `Intl` com fuso explícito |
| Testes anteriores continuam passando | passou | 53 testes (46 anteriores e 7 novos) |
| `tsc`, lint | passou | zero erro, zero aviso |

## Conferência no site rodando

Feita às 21:53 de 08/10 em Brasília (00:53 de 09/10 em UTC), dentro da janela em que o erro aparecia. Os eventos de hoje aparecem como "8 out" (antes, "9 out"), e a distância do lote da Dipirona continua "venceu há 12 dias", coerente com o status calculado pelo mock.

## Fora do plano

Nenhum arquivo fora da lista.

## Security Review

Sem dado sensível, permissão ou credencial.
