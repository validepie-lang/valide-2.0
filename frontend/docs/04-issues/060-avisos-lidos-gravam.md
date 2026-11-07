# Issue 060: Marcar aviso como lido grava

**Origem:** fase de lógica, oitava e última da ordem combinada com o Marcus em 10/10. Ele mandou seguir em 10/10 ("pode seguir").
**Status:** executada e validada. **Depende do Pedro:** com `notifications` em `NEXT_PUBLIC_API_LIVE`, marcar como lido vai para `PATCH /notifications/:id/read`, que já está no contrato. "Marcar todos" manda um por aviso; `POST /notifications/read-all` (v13, sugestão) faria tudo de uma vez. Sem a área ligada, nada é guardado.

## Referências

As telas não mudam (sino da issue 009; página Avisos da 037, do HR Management Dashboard, Behance). O comportamento:

| Fonte | O que se usa |
| --- | --- |
| [HR Management Dashboard](https://www.behance.net/gallery/185372253/HR-Management-Dashboard-Project), tela "Notification" (issue 037) | "Mark all as read" no alto da lista; o ponto de não lido some quando o aviso é lido |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) | A mudança aparece na hora (a lista é a confirmação); recusado, volta e diz por quê |

## Faz

- Abrir um aviso, no sino ou na página, marca como lido; o número do sino desconta na hora
- "Marcar todos como lidos" grava os que faltam; a lista muda na hora e, se o servidor recusar, volta e diz "Os avisos continuam como não lidos."
- Abrir um aviso sai da página: se a gravação falhar, ele só continua não lido, sem mensagem (não há onde mostrar)

## Não faz

Item 114 em `08-project/ficou-de-fora.md`.
