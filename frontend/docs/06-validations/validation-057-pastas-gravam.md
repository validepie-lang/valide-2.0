# Validação: Issue 057 - Pastas gravam

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado

Conferido no Chrome por script, em `/estoque/pastas`.

| Critério | Resultado |
| --- | --- |
| Criar sem nome: "Dê um nome à pasta.", foco no campo | ok |
| Criar "dermocosméticos": "Já existe a pasta Dermocosméticos. Escolha outro nome." | ok |
| Criar "Higiene bucal": a janela fecha, a pasta entra na lista em ordem alfabética, e o leitor de tela ouve "Pasta Higiene bucal criada." | ok |
| Renomear para "Higiene oral": a lista muda, "Pasta renomeada para Higiene oral." | ok |
| Excluir Dermocosméticos (tem produtos): a janela explica o caminho, sem pedir ao servidor | ok |
| Excluir Higiene oral (vazia): some da lista, "Pasta Higiene oral excluída." | ok |
| Criar sem rede: a mensagem de conexão dentro da janela, o nome digitado continua | ok |
| `npx tsc --noEmit`, lint, `npm test` (117) e `next build` | passam |

## O que se vê no modo simulado

A pasta criada some ao recarregar a página: sem a API, nada é guardado (item 99).

Captura em `telas-novas/057/`.
