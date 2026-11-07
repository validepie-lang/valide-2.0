# Issue 068: Tabela do Estoque com linhas por página, rolagem no celular, ordem e "Sem pasta"

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 7, 10, 11 e 69), depois de ver o protótipo. Item 11 decidido em 12/10: "Sem validade" no fim nas duas ordens ("concordo").
**Status:** executada e validada.
**Depende de:** 066. Contrato v24 para o Pedro (ordem, `folderId=none`, `perPage`); até lá, dado simulado.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| SaaS Data Table (Behance, issue 029) | 897 curtidas | "Rows per page" no rodapé, ao lado das páginas |
| "Complex data tables on mobile" (origem do item 10) e NN/g, "Mobile Tables" | referência de pesquisa de UX | Tabela que rola para o lado com a primeira coluna parada, para não perder de que linha é o número; aviso de que rola |
| WCAG 2.1.1 (teclado) | | Região que rola recebe foco, para rolar com as setas |
| Ventor "Category" (Behance, issue 039) | 924 curtidas | A linha "Sem pasta" segue o desenho das outras linhas da lista de pastas |

## Faz

- **Linhas por página (7):** 25, 50 ou 100, no rodapé da tabela. A escolha fica num cookie, como as colunas, e trocar volta à primeira página. Só aparece quando há mais de 25 produtos
- **Tabela no celular (10):** a mesma tabela em todas as larguras. Abaixo de 1024px ela rola para o lado, com a coluna do produto parada, a dica "Arraste a tabela para o lado para ver todas as colunas" e foco de teclado na região. Os cartões do celular saíram. O seletor de colunas passa a aparecer no celular. Regra mudada no `CLAUDE.md` seção 10 (exceção só para o Estoque)
- **Ordem (11):** produto sem validade fica no fim também em "vence por último" (antes ia para o topo)
- **"Sem pasta" (69):** opção em Mais filtros > Pasta (`pasta=sem`, `folderId=none` na API) e linha "Sem pasta" no fim da tela Pastas, com produtos e vencidos e a vencer, sem renomear nem excluir. Quatro produtos de exemplo sem pasta entraram no catálogo simulado (o que veio da planilha e ninguém classificou)
- `product-table.tsx` dividido (`product-table-cells.tsx`); linha "Sem pasta" em `folder-unfiled-row.tsx`, para os arquivos ficarem abaixo de 200 linhas

## Não faz

- Rolagem lateral nas outras tabelas (Pastas, Movimentações, Retirar vencidos): continuam virando lista no celular
- Linhas por página nas outras listas paginadas: o item era do Estoque

## Critérios de aceite

- [x] 25, 50 e 100 linhas; a escolha continua depois de recarregar; trocar volta à página 1
- [x] No celular a tabela rola dentro do cartão, a página não; a coluna do produto não sai do lugar
- [x] "Sem validade" no fim nas duas ordens de validade
- [x] "Sem pasta" no filtro e na tela Pastas, com os números batendo com o Estoque filtrado
- [x] 360, 768 e 1440, claro e escuro; teclado alcança a região da tabela
