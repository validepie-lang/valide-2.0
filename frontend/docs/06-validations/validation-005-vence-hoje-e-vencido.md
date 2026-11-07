# Validation: Issue 005 - Lote que vence hoje é Vencido

**Issue:** `docs/04-issues/005-vence-hoje-e-vencido.md`
**Data:** 08/10/2026
**Etapa da esteira:** 8 de 12

| Critério | Resultado | Como foi verificado |
| --- | --- | --- |
| Hoje Vencido, amanhã A vencer, 30 A vencer, 31 No prazo | passou | `npm test`, 29 de 29 (entrou o caso "vence amanhã") |
| Nenhum "vence hoje" ao lado do selo Vencido | passou | `formatExpiryDistance(0)` diz "venceu hoje"; é a única função que escreve a distância, usada no produto e na Home |
| `tsc`, lint, build | passou | |

Nenhum lote dos dados de demonstração vence exatamente hoje, então as telas atuais não mudam de aparência. A regra vale para o primeiro lote que cair no dia.
