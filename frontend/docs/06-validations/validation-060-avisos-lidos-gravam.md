# Validação: Issue 060 - Marcar aviso como lido grava

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado

Conferido no Chrome por script.

| Critério | Resultado |
| --- | --- |
| Sino com 3 não lidos; abrir "Maleato de Enalapril 10mg está abaixo do estoque mínimo": vai ao produto e o sino passa a 2 | ok |
| Avisos, "Marcar todos" sem rede: a lista volta a 3 não lidos, "… Os avisos continuam como não lidos." | ok |
| Avisos, "Marcar todos" com rede: "Tudo lido", o botão some, a mensagem de erro some | ok |
| `npx tsc --noEmit`, lint, `npm test` (122) e `next build` | passam |

## O que se vê no modo simulado

Recarregar a página traz os avisos de volta como não lidos (item 99).

Captura em `telas-novas/060/`.
