# Issue 058: Pessoas gravam

**Origem:** fase de lógica, sexta da ordem combinada com o Marcus em 10/10. Ele mandou seguir em 10/10 ("pode seguir").
**Status:** executada e validada. **Depende do Pedro:** com `auth` em `NEXT_PUBLIC_API_LIVE`, adicionar vai para `POST /users`, e editar, bloquear e liberar para `PATCH /users/:id`, com as recusas da v14 (já enviada a ele em 10/10). Sem a área ligada, o simulado confere e responde, mas não guarda.

## Referências

A tela não muda (issue 040: User Page e "Add Company" do Ventor, Behance). O comportamento é o das issues 053 a 057, do Primer:

| Fonte | O que se usa |
| --- | --- |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) | A lista é a confirmação; falhou, o digitado fica na janela |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | Erro no campo, foco no primeiro errado |
| [Primer, Loading](https://primer.style/product/ui-patterns/loading) | "Salvando…", "Bloqueando…" e "Liberando…" no botão, campos só leitura |

## Faz

- Adicionar grava (`addUser`), editar grava (`saveUser`) e bloquear e liberar gravam (`saveUser` com `active`)
- Na edição vai só o que pode mudar: o próprio cargo nunca vai (a tela já trava o campo), e a senha só se foi digitada
- Usuário de acesso repetido (`409 LOGIN_TAKEN`, que o servidor confere no banco inteiro) vai para o campo; o resto, inclusive o `403` de mudar o próprio cargo, acima dos botões
- A lista muda com o que o servidor devolveu, e o leitor de tela ouve "Ana Teste entrou na lista com o cargo Balconista."
- Os campos de usuário e de senha saem para `user-credential-fields.tsx` (a janela passava de 200 linhas)

## Não faz

Item 111 em `08-project/ficou-de-fora.md`.
