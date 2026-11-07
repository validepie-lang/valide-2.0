# Validação: Issue 054 - Entrada e saída gravam

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado

Conferido no Chrome por script, no produto Allegra 120mg (`p10`, lote AL7733 com 7 un).

| Critério | Resultado |
| --- | --- |
| Saída sem nada: "Informe quanto está saindo." e "Escolha o motivo da saída.", foco na quantidade; o botão não fica mais desabilitado | ok |
| Saída de 9999: "Este lote tem 7 un. Escolha uma quantidade menor ou troque de lote." na hora | ok |
| Envio recusado (sem motivo) e depois "Voltar ao produto": abre "Sair sem salvar?" (antes, o envio zerava o aviso) | ok |
| Saída de 2 un, Venda, com justificativa: volta a `/estoque/p10?registrado=saida&lote=AL7733&qtd=2` com "Saída de 2 un do lote AL7733 registrada." | ok |
| "×" da faixa: volta a `/estoque/p10` sem ela | ok |
| Entrada sem nada: mensagem no lote, na validade e na quantidade, foco no lote | ok |
| Entrada com "al7733": "Este produto já tem o lote AL7733." enquanto se digita e ao enviar; nada é enviado | ok |
| Fabricação depois da validade: mensagem na validade, foco nela | ok |
| Entrada de 24 un do lote NOVO54: volta ao produto com "Entrada de 24 un do lote NOVO54 registrada." | ok |
| Entrada geral, Enter na quantidade: volta à busca com "… registrada em Allegra 120mg, 10 comprimidos. Ver o produto", foco na busca | ok |
| Saída sem rede: "Não foi possível falar com o servidor. Verifique a conexão e tente de novo. O que você digitou continua aqui."; quantidade e motivo continuam | ok |
| Celular (360): saída com erros e produto com a faixa, sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (99) e `next build` | passam |

## O que se vê no modo simulado

O produto mostra o estoque de antes logo abaixo de "Saída de 2 un … registrada.": sem a API, nada é guardado (item 99). Com o Pedro ligado, a página do produto é lida de novo ao chegar e já vem com a saída.

## Não conferido na tela

- `403` do Balconista tentando descarte: o simulado não tem token para saber o cargo, e a tela já esconde os motivos de descarte dele. A mensagem do servidor cai na faixa de falha, como a de rede
- `409 LOT_CODE_TAKEN` vindo do servidor: a tela recusa antes de enviar com os lotes que conhece

Capturas em `telas-novas/054/`.
