# Issue 059: Configurações gravam

**Origem:** fase de lógica, sétima da ordem combinada com o Marcus em 10/10. Ele mandou seguir em 10/10 ("pode seguir").
**Status:** executada e validada. **Depende do Pedro:** com `auth` ligada, o nome vai para `PATCH /users/me`, a senha para `POST /auth/password` e a empresa para `PATCH /companies/current`; com `notifications`, as preferências para `PUT /users/me/notification-preferences` (v16). O nome próprio e o erro de senha atual vão na v21, proposta. Sem as áreas ligadas, o simulado responde, mas não guarda.

## Referências

As telas não mudam de desenho (issues 014, 033 e 044). O comportamento vem do Primer, como nas issues 053 a 058:

| Fonte | O que se usa |
| --- | --- |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) | Quem continua na tela vê a confirmação ao lado do botão (InlineMessage), sem banner. "Automatic saving: changes apply immediately. Recommended for toggle switches", e "never mix save patterns in a single form": em Notificações, cada interruptor grava ao tocar, e o "Salvar preferências" sai |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | Erro no campo, foco no primeiro errado, e depois da primeira tentativa o erro some ao corrigir |
| [Primer, Loading](https://primer.style/product/ui-patterns/loading) | "Salvando…" no botão, campos só leitura |

## Faz

- Meu perfil, nome: grava e lê a página de novo, para o nome mudar também no alto. "Nome salvo." ao lado do botão
- Meu perfil, senha: senha atual obrigatória, nova com 8 ou mais e diferente da atual, as duas novas iguais. Senha atual errada (`422 WRONG_PASSWORD`) vai para o campo dela. Trocou, os três campos esvaziam e aparece "Senha trocada. Use a nova na próxima vez que entrar."
- Nome e senha são formulários separados, cada um com o seu aviso de sair sem salvar: salvar o nome não cala a senha digitada pela metade
- Empresa: CNPJ conferido pelos dígitos verificadores, nome fantasia e razão social obrigatórios, CEP com 8 números, e-mail com @ e domínio. Grava, "Dados da empresa salvos." e a página é lida de novo, porque a janela de a vencer muda o painel
- Notificações: cada interruptor grava ao tocar; recusado, volta para onde estava e diz por quê. "Estoque abaixo do mínimo: desligado." confirma
- Corrige o `UnsavedGuard`: ele religava o aviso logo depois de salvar, quando o foco saía do campo (o navegador dispara `change` nessa hora). Agora escuta só `input`
- O CNPJ de demonstração não passava na conta dos dígitos: virou 18.472.905/0001-20
- Peças: `SavedNote` (a confirmação na própria tela) e o fecho da `FormFailure` ajustável; `Switch` aceita estado de fora; `apiPut` no cliente
- Regras em `lib/utils/settings-draft.ts`, com teste; telas em `components/settings/`
- Contrato v21, proposto: `PATCH /users/me` para o próprio nome, `422 WRONG_PASSWORD` na troca de senha, e o corpo do `PATCH /companies/current`

## Não faz

Itens 112 e 113 em `08-project/ficou-de-fora.md`.
