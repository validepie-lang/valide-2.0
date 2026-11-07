# Validação: Issue 059 - Configurações gravam

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado

Conferido no Chrome por script.

| Critério | Resultado |
| --- | --- |
| Nome vazio: "Escreva o seu nome. É o que aparece no histórico.", foco no campo | ok |
| Nome salvo: "Nome salvo." ao lado do botão | ok |
| Trocar senha sem nada: mensagem na atual e na nova, foco na atual | ok |
| Nova e repetida diferentes: "As duas senhas novas não são iguais.", foco na repetida | ok |
| Sair com a senha pela metade, depois de salvar o nome: abre "Sair sem salvar?" | ok |
| Senha trocada: os três campos vazios, "Senha trocada. Use a nova na próxima vez que entrar." | ok |
| Sair depois de tudo salvo: não pergunta (antes da correção do `UnsavedGuard`, perguntava) | ok |
| Empresa com CNPJ 18.472.905/0001-64 e e-mail sem @: as duas mensagens, foco no CNPJ | ok |
| Corrigir o CNPJ: a mensagem dele some ao digitar; a do e-mail fica | ok |
| Empresa salva: "Dados da empresa salvos."; sair não pergunta | ok |
| Desligar "Estoque abaixo do mínimo": grava ao tocar, "Estoque abaixo do mínimo: desligado." | ok |
| Tocar sem rede: o interruptor volta, "… A preferência voltou para como estava." | ok |
| Entrada e saída (054) de novo, depois da correção do `UnsavedGuard`: o aviso de sair sem salvar continua abrindo | ok |
| `npx tsc --noEmit`, lint, `npm test` (122) e `next build` | passam |

## Não conferido na tela

- Senha atual errada (`422 WRONG_PASSWORD`): o simulado não tem senha para conferir

Capturas em `telas-novas/059/`.
