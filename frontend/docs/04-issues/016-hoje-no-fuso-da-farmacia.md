# Issue 016: "Hoje" é o dia do calendário da farmácia, não o dia em UTC

**SPEC de origem:** nenhuma. Achado da validação da issue 007 (`validation-007-formatos-de-dado.md`). Marcus pediu a correção em 08/10/2026 ("faça a correção do hoje"). Numerada 016 porque 008 a 015 estão reservadas na SPEC do redesign.
**Status:** executada e validada
**Depende de:** 007
**Etapa da esteira:** 5 de 12

---

## Objetivo

A conta de "quantos dias faltam" usa a data de hoje em UTC. Entre 21h e meia-noite de Brasília, o UTC já está no dia seguinte. Nessas três horas:

- "vence em 12 dias" aparece como "vence em 11 dias"
- um lote que vence amanhã aparece como Vencido na prévia do formulário
- os dados de demonstração datam os eventos de hoje com a data de amanhã

O servidor da Vercel roda em UTC, então o erro acontece no site publicado para todo mundo, não só numa máquina.

## Escopo

### Faz

- `calendarToday()`: o dia do calendário no fuso da farmácia, como meia-noite UTC daquela data (a mesma representação da data de validade, então a comparação continua sendo de data com data)
- `daysUntil` e `getExpiryStatus` passam a usar `calendarToday()` como padrão. A regra não muda: o dia do vencimento continua Vencido
- O fuso padrão (`America/Sao_Paulo`) sai de `format.ts` e vai para `calendar.ts`, um lugar só para os dois usos
- O `TODAY` dos dados de demonstração passa a ser o dia de Brasília
- Testes do caso que falhava: 22h em Brasília, lote que vence amanhã

### Não faz

- Não lê o fuso da conta (`Company.timezone`). Mesmo limite da 007
- Não muda o cálculo oficial, que é do backend. A pauta 2.6 pergunta ao Pedro e ao Antônio em que fuso o banco decide o dia

## Critérios de aceite

- [ ] Às 22h de 08/10 em Brasília (01h de 09/10 em UTC), um lote que vence em 09/10 é A vencer e "vence amanhã"
- [ ] Às 22h em Brasília, um lote que vence em 08/10 é Vencido e "venceu hoje"
- [ ] O resultado não depende do fuso da máquina que roda (teste injeta o instante)
- [ ] Os 46 testes anteriores continuam passando
- [ ] `tsc`, lint
