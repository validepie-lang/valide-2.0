# Validação: Issue 053 - Validades pendentes grava

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado (com `products` em `NEXT_PUBLIC_API_LIVE`, o lote vai para `POST /products/:id/lots`)

Conferido no Chrome por script (teclado, rede lenta e sem rede simuladas pelo próprio Chrome).

| Critério | Resultado |
| --- | --- |
| Enter com tudo vazio: mensagem no lote e na validade, foco no lote, `aria-invalid` e `aria-describedby` apontando para a mensagem | ok |
| Digitar o lote depois do erro: a mensagem do lote some na hora; a da validade continua | ok |
| Salvar sem data: foco vai para a validade | ok |
| Quantidade 0: "A quantidade precisa ser maior que zero.", no lugar da dica | ok |
| Quantidade em branco: vale o estoque atual, como a dica diz | ok |
| Lote e data certos com Enter na data: envia uma vez (um POST no servidor), avança, foco no lote do próximo | ok |
| "Salvo: Cetaphil Loção Hidratante 473ml, lote L9001, vence em 01/12/2026." no cartão, em `role="status"` | ok |
| Lote já vencido (01/01/2025): a prévia avisa e salva mesmo assim | ok |
| Enter duas vezes seguidas: um envio só | ok |
| Rede lenta: o botão vira "Salvando…" (`aria-busy`), campos só leitura | ok |
| Sem rede: "Não foi possível falar com o servidor. Verifique a conexão e tente de novo. O que você digitou continua aqui."; lote e data continuam preenchidos, o produto não muda | ok |
| Celular (360) no tema escuro, com os erros abertos: sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (87, com 9 da validação do lote) e `next build` | passam |

## Não conferido na tela

- Código de lote repetido (`409 LOT_CODE_TAKEN`) na fila: todo produto da fila não tem lote, então o simulado nunca recusa ali. O caminho existe (mensagem no campo do lote, enquanto o número for o mesmo) e volta a ser conferido na entrada (issue 054), onde o produto já tem lotes

## O que muda para o Pedro

Nada de endpoint novo: a fila já estava no contrato com `POST /products/:id/lots`. A partir desta issue, o front de fato chama.

Capturas em `telas-novas/053/`.
