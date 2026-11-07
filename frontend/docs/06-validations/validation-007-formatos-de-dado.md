# Validação: Issue 007 - Formatos de dado

**Issue:** `docs/04-issues/007-formatos-de-dado.md`
**Plano:** `docs/05-plans/plan-007-formatos-de-dado.md`
**Data:** 08/10/2026
**Resultado:** passou

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Cada formato da 14.4 tem função e teste | passou | `format.test.ts`: 17 testes novos (46 no total) |
| Nenhum uso das funções antigas | passou | Busca em `src/` e `docs/01-references/`: zero |
| 14:22 em Brasília aparece como 14:22 com o dado em 17:22Z | passou | Teste "mostra a hora de Brasília, não a de UTC"; captura da Home: "9 out, 14:22" |
| Saída com menos tipográfico e unidade | passou | Captura da Home: "−6 un", "+24 un" |
| `npm test`, `tsc`, lint | passou | 46 testes, zero erro, zero aviso |

## Arquivo que entrou durante a execução

`src/lib/mocks/imports.ts`. A importação gravava meia-noite UTC, que na hora de Brasília aparecia como "21:00 do dia anterior". Registrado no plano antes da mudança.

## Achado fora do escopo, para issue própria

**O "hoje" do sistema é o dia em UTC.** O mock (`TODAY`) e a função `daysUntil` usam a data UTC. Entre 21h e meia-noite em Brasília, o UTC já está no dia seguinte: os eventos de hoje aparecem com a data de amanhã, e a distância "vence em N dias" fica um dia menor durante essas três horas. Não muda o status no servidor (é o backend que calcula), mas muda o que a tela escreve.

Não foi corrigido aqui porque toca `expiry.ts`, que é regra de negócio com teste próprio. Proposta: issue curta para `daysUntil` e o mock usarem a data do calendário de Brasília, e um item na pauta para o Pedro confirmar que o banco usa `CURRENT_DATE` no fuso de Brasília, não no do servidor.

## Contrato

v8: `Movement.unit` e a convenção de exibição (validade lida em UTC, instante no fuso da conta). Marcado "a avisar o Pedro".

## Security Review

Sem dado sensível, permissão ou credencial.

## UX Review

- [x] Data de validade no formato da embalagem, sem mudança
- [x] Hora do evento na hora da farmácia
- [x] Quantidade de movimentação com unidade real do produto
- [x] Sem travessão
