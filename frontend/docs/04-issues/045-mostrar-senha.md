# Issue 045: Mostrar e esconder a senha

**Origem:** item 43 de `ficou-de-fora.md`, liberado pelo Marcus em 10/10 ("itens que não dependem de dado: pode fazer").
**Status:** executada e validada

## Referências

As da issue 034, que já mostravam o olho no campo de senha:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Login/ Sign Up UI/UX Page Template Design](https://www.behance.net/gallery/182557681/Login-Sign-Up-UIUX-Page-Template-Design) | 175 curtidas, 12.170 visualizações | O olho dentro do campo, à direita |
| [Modern Login Page UI Concept](https://www.behance.net/gallery/231746377/Modern-Login-Page-UI-Concept) | 112 curtidas, 6.811 visualizações | O mesmo, com o ícone trocando entre olho aberto e riscado |

## Faz

- `PasswordInput` em `components/ui`: o campo de senha com o botão do olho, que diz "Mostrar a senha" ou "Esconder a senha" e marca `aria-pressed`
- Em todos os campos de senha: login, cadastro da empresa, Meu perfil (as três) e a janela de pessoa

## Não faz

Nada de força da senha ou regras novas: a regra continua "ao menos 8 caracteres".
