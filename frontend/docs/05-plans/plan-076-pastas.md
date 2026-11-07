# Plano 076: Pastas com busca, ordem, páginas, desativar, excluir várias e excluir levando os produtos

Regra antes do código: `business-rules.md` seção 9 e 9.1 (feito).

## Como

- A lista deixa de ser montada no cliente: o servidor busca, ordena e pagina (`busca`, `ordem`, `pagina` na URL), como no Estoque. Depois de gravar, a tela pede a página de novo (`router.refresh()`), e a confirmação continua sendo a própria lista mais o aviso ao leitor de tela
- Com a API ligada, `GET /folders` devolve todas as pastas (são poucas) e o front busca, ordena e pagina; sem ela, o mesmo sobre o catálogo de exemplo
- No modo de demonstração, criar, renomear, desativar e excluir pasta entram no registro do cookie (issue 071), para a regra aparecer nas outras telas
- "Escolhas" de pasta (cadastro, edição, mover, filtro) passam por `folderChoices`: só as ativas, mais a já escolhida, marcada "(desativada)"

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `docs/00-context/business-rules.md` | Seção 9 e 9.1 (regra antes do código) |
| `src/lib/types/index.ts` | `Folder.active` |
| `src/lib/mocks/catalog.ts` | Pastas de exemplo ativas |
| `src/lib/utils/folder-list.ts` e `.test.ts` (novos) | Busca, ordem e página da lista; `folderChoices`; divisão das marcadas entre vazias e com produto |
| `src/lib/utils/demo-journal.ts` e `.test.ts` | Entrada `folderOp` (criar, renomear, ativar, excluir com destino); `applyFolders`; produtos da pasta excluída vão para o destino; nome da pasta no produto segue a renomeação |
| `src/lib/services/demo-store.ts` | `demoFolders()` |
| `src/lib/services/folders.ts` | Grava no registro; `setFolderActive` (`PATCH /folders/:id { active }`); `deleteFolder(id, moveTo)` (`DELETE /folders/:id?moveTo=`) |
| `src/lib/services/products.ts`, `product-folders.ts` | Pastas do registro no lugar da lista fixa |
| `src/lib/actions/folders.ts` | `toggleFolder`, `removeFolder(id, moveTo)` |
| `src/components/products/sortable-th.tsx` | Genérico na ordem, para servir à lista de pastas |
| `src/components/products/folder-manager.tsx` | Sem lista própria: recebe a página, guarda as marcadas, abre as janelas, atualiza depois de gravar |
| `src/components/products/folder-table.tsx`, `folder-row-actions.tsx` (novo) | Caixa, selo "Desativada", cabeçalho que ordena, Desativar e Ativar |
| `src/components/products/folder-toolbar.tsx` (novo) | Busca e a faixa "N pastas marcadas" |
| `src/components/products/folder-delete-dialog.tsx` | Destino dos produtos (item 110) |
| `src/components/products/folder-bulk-delete-dialog.tsx` (novo) | Excluir as marcadas vazias, dizendo quais ficam (item 66) |
| `src/components/products/folder-unfiled-row.tsx` | Célula vazia da caixa |
| `src/app/(app)/estoque/pastas/page.tsx` | Busca, ordem e página; a lista paginada |
| `src/app/(app)/estoque/page.tsx`, `novo/page.tsx`, `[id]/editar/page.tsx` | `folderChoices` |
| Documentos | issue, contrato v30 (`api-contract.md`, `para-o-pedro.md`), validação, `ficou-de-fora.md` |
| `src/components/products/use-folder-actions.ts` (novo) | **Entrou na execução:** as gravações saíram de `folder-manager.tsx`, que passava de 200 linhas |
