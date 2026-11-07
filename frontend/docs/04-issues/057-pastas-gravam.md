# Issue 057: Pastas gravam

**Origem:** fase de lógica, quinta da ordem combinada com o Marcus em 10/10. Ele mandou seguir em 10/10 ("pode seguir").
**Status:** executada e validada. **Depende do Pedro:** com `folders` em `NEXT_PUBLIC_API_LIVE`, criar, renomear e excluir vão para `POST`, `PATCH` e `DELETE /folders`. O contrato dizia só "erro se tiver produto": os códigos vão na v20, proposta. Sem a área ligada, o simulado confere e responde, mas não guarda.

## Referências

A tela não muda (issue 039: "Category" e "Add Company" do Ventor, Behance). O comportamento é o das issues 053 a 056, do Primer:

| Fonte | O que se usa |
| --- | --- |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) | Mudança que aparece na própria tela não precisa de banner: a lista é a confirmação. Falhou, o que foi digitado fica na janela, com a mensagem |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | O erro do nome no campo, com o foco nele |
| [Primer, Loading](https://primer.style/product/ui-patterns/loading) | "Salvando…" e "Excluindo…" no botão, campo só leitura |

## Faz

- Criar e renomear gravam (`addFolder`, `saveFolderName`); excluir pasta vazia grava (`removeFolder`). A lista muda com o que o servidor devolveu, e o leitor de tela ouve "Pasta Higiene bucal criada."
- Nome: vazio, mais de 60 letras e repetido (sem diferenciar maiúscula) são recusados no campo; espaços sobrando saem. O servidor confirma o repetido com `409 FOLDER_NAME_TAKEN`, que também vai para o campo
- Pasta com produto continua explicando o caminho, sem pedir ao servidor; se mesmo assim ele recusar (`409 FOLDER_NOT_EMPTY`, por exemplo alguém classificou um produto nela agora), a mensagem fica na janela
- A janela de criar e renomear sai para `folder-name-dialog.tsx`; regra do nome em `lib/utils/folder-name.ts`, com teste
- `SubmitLabel` aceita o texto de andamento ("Excluindo…")
- Contrato v20, proposto: `FOLDER_NAME_TAKEN`, `FOLDER_NOT_EMPTY`, `FOLDER_NOT_FOUND` e o limite de 60 letras

## Não faz

Item 110 em `08-project/ficou-de-fora.md`.
