# Issue 005: Lote que vence hoje é Vencido

**SPEC de origem:** nenhuma. Decisão do Marcus em 08/10/2026 ("pode ajustar"), alinhando o frontend à migration do banco de 07/10.
**Status:** executada
**Depende de:** nenhuma
**Etapa da esteira:** 5 de 12

---

## Objetivo

O mesmo lote não pode aparecer com situação diferente no banco e na tela. A `vw_alerta_validade` da migration classifica `dias_para_vencer <= 0` como VENCIDO. O frontend tratava o dia do vencimento como último dia válido (A vencer), decisão de 17/09 que já previa revisão "se o Pedro implementar diferente no backend".

## Escopo

### Faz

- `getExpiryStatus`: `days <= 0` passa a ser `expired`. A janela de A vencer vira 1 a 30 dias, que coincide com a faixa VERMELHO do banco
- `formatExpiryDistance(0)` passa a dizer "venceu hoje", para não aparecer "vence hoje" ao lado do selo Vencido
- Testes atualizados, com o motivo da mudança escrito no próprio teste
- Decisão de 17/09 substituída; pauta 2.5 e contrato marcados como resolvidos

### Não faz

- Não cria a faixa de 31 a 60 dias nem muda as cores. Isso continua em aberto no contrato (ponto 8): a proposta é o banco manter as quatro faixas e a API devolver os três status do contrato

## Critérios de aceite

- [ ] Vence hoje é Vencido; amanhã é A vencer; 30 dias ainda é A vencer; 31 é No prazo
- [ ] Nenhuma tela mostra "vence hoje" com selo Vencido
- [ ] `npm test`, `tsc` e lint passam
- [ ] Publicado na Vercel
