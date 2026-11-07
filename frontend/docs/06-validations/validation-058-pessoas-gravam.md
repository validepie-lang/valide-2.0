# Validação: Issue 058 - Pessoas gravam

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado

Conferido no Chrome por script, em `/configuracoes/usuarios`.

| Critério | Resultado |
| --- | --- |
| Adicionar sem nada: nome, usuário e senha com mensagem, foco no nome | ok |
| Usuário "juliana.ferreira": "O usuário juliana.ferreira já existe. Escolha outro.", foco no campo | ok |
| Ana Teste, ana.teste, senha de 8: a janela fecha, a pessoa entra na lista como Balconista, o leitor de tela ouve a frase | ok |
| Editar Ana Teste para Farmacêutico: a lista muda | ok |
| Editar a si mesmo: o cargo está travado e não vai no envio; salvar o nome funciona | ok |
| Bloquear Ana Teste: "Acesso bloqueado" na linha | ok |
| Adicionar sem rede: a mensagem de conexão na janela, o que foi digitado continua | ok |
| `npx tsc --noEmit`, lint, `npm test` (117) e `next build` | passam |

## Não conferido na tela

- `403` de mudar o próprio cargo ou se bloquear: a tela não deixa chegar lá. Se o servidor recusar mesmo assim, a mensagem dele cai acima dos botões

Captura em `telas-novas/058/`.
