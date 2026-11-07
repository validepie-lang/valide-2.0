# Validação: Issue 055 - Cadastrar e editar produto gravam

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado

Conferido no Chrome por script.

| Critério | Resultado |
| --- | --- |
| Cadastro vazio: nome, custo e preço com mensagem, foco no nome | ok |
| Digitar o nome depois: a mensagem do nome some; as outras continuam | ok |
| Custo 10,00 e venda 5,00: "Abaixo do custo de aquisição. Dá para salvar assim, se for de propósito.", sem vermelho | ok |
| Lote só com o número: mensagem na validade e na quantidade do lote, foco na validade | ok |
| Código de barras 7891012367716: "já é do produto Allegra 120mg, 10 comprimidos", no campo, foco nele | ok |
| Depois da recusa, "Voltar ao estoque": abre "Sair sem salvar?" | ok |
| Código livre: volta a `/estoque?cadastrado=…` com "Dipirona Teste 055 cadastrado. Cadastrar outro" | ok |
| Edição com mínimo 20 e máximo 10: "O estoque máximo precisa ser maior que o mínimo.", foco no máximo | ok |
| Edição certa: volta a `/estoque/p10?salvo=produto` com "Alterações do produto salvas." | ok |
| `npx tsc --noEmit`, lint, `npm test` (107) e `next build` | passam |

## O que se vê no modo simulado

O produto cadastrado não aparece na lista, e a edição não muda o nome na página do produto: sem a API, nada é guardado (item 99).

Capturas em `telas-novas/055/`.
