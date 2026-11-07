# Validação: Issue 052 - Calendário de vencimentos

**Data:** 10/10/2026
**Resultado:** passou, com dado simulado (a lista de lotes por data não existe no contrato: v17 proposto)

| Critério | Resultado |
| --- | --- |
| Terceira aba do Estoque, acesa em `/estoque/calendario`; esqueletos das outras abas com três abas | ok |
| Outubro de 2026 em 5 semanas, de domingo a sábado; dias de setembro e novembro apagados, com os lotes deles | ok |
| Cada dia com lote: barra do pior estado e o número (na tela grande), e o texto para leitor de tela ("1 lote vence, o pior A vencer") | ok |
| No prazo em cinza; legenda com os três estados embaixo | ok |
| Sem `?dia`, abre no próximo dia com lote a partir de hoje (13/10); em novembro, no primeiro dia com lote (02/11) | ok |
| Setas de mês e "Hoje" (só fora do mês atual); mês e dia no endereço | ok |
| Lista do dia: produto, lote, quantidade e selo, cada um levando ao produto; dia sem lote diz "Dia livre" | ok |
| Celular (360): grade compacta só com a barra, lista do dia embaixo, sem rolagem lateral | ok |
| Tema escuro | ok |
| `npx tsc --noEmit`, lint, `npm test` (78, com 5 da grade do mês) e `next build` | passam |

## Corrigido na conferência

- Abrir em hoje mostrava "Dia livre" quando nada vencia hoje: agora abre no próximo dia com lote

Capturas em `telas-novas/052/`.
