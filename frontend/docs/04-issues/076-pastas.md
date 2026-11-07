# Issue 076: Pastas com busca, ordem, páginas, desativar, excluir várias e excluir levando os produtos

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 64, 65, 66 e 110). Em 13/10 ele aprovou a proposta para o item 65 ("pode seguir").
**Status:** executada e validada.
**Depende de:** 075. Contrato v30 para o Pedro (pasta ativa, excluir com destino); até lá, dado simulado.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| Ventor "Category" (Behance, issue 039) | 924 curtidas | Busca em cima da lista, ordem pelo cabeçalho, páginas no rodapé, caixa em cada linha, "Active" e "Deactive" na linha |
| Ventor, excluir com destino (Behance, issue 039) | 924 curtidas | Ao excluir uma categoria com itens, escolher na mesma janela para onde eles vão |
| Data Table UX/UI (Behance, issues 035 e 069) | 576 curtidas | A faixa "N marcadas" com a ação em lote acima da tabela |
| Primer, Saving | | Ação que se desfaz com um toque (desativar) não pede confirmação; excluir pede e diz o que acontece com os produtos |

## A regra que muda (item 65)

Hoje a pasta só existe ou não existe. Passa a ter **ativa ou desativada** (`business-rules.md` seção 9):

- Pasta desativada **some das escolhas**: cadastro e edição de produto, mover de pasta, filtro do Estoque e destino ao excluir outra pasta
- Os produtos **continuam nela** e aparecem normalmente no Estoque, no Início e na própria tela Pastas. Na edição de um produto que está numa pasta desativada, ela continua escolhida, com "(desativada)" no nome
- Selo neutro "Desativada" na linha; nunca verde ou vermelho (verde e vermelho são de validade)
- Só o Administrador ativa e desativa (a tela Pastas já é só dele)

## Faz

- **Busca, ordem e páginas (64):** campo "Buscar pasta" acima da lista; ordem pelo cabeçalho (Pasta, Produtos, Vencidos e a vencer); 25 por página, com as páginas no rodapé só quando passar disso. "Sem pasta" continua no fim e some quando há busca
- **Desativar e ativar (65):** na linha, ao lado de Renomear e Excluir; o selo "Desativada" ao lado do nome
- **Excluir várias (66):** caixa em cada linha e no cabeçalho (a página); a faixa "N pastas marcadas" com "Excluir". Só as vazias são excluídas: se alguma marcada tem produto, a janela diz quais ficam e por quê
- **Excluir com produtos (110):** a janela de excluir uma pasta com produtos pergunta para onde eles vão (outra pasta ativa ou "Sem pasta") e exclui na mesma hora
- **No modo de demonstração**, criar, renomear, desativar e excluir pasta passam a ficar no registro do navegador (cookie da issue 071), para a regra aparecer nas outras telas

## Não faz

- Excluir várias com produtos de uma vez (cada uma pode precisar de um destino diferente)
- Pasta dentro de pasta
- Desativar em lote

## Critérios de aceite

- [x] Buscar "gen" mostra só Genéricos; ordenar por Produtos inverte ao clicar de novo
- [x] Desativar Infantil: some do cadastro, do mover e do filtro; os produtos continuam em Infantil no Estoque; a edição de um deles mostra "Infantil (desativada)"
- [x] Ativar de novo volta tudo
- [x] Marcar duas vazias e uma com produto: exclui as duas e diz qual ficou
- [x] Excluir Suplementos levando os produtos para Medicamentos: a contagem de Medicamentos sobe e os produtos aparecem lá no Estoque
- [x] Recarregar mantém tudo no modo de demonstração
- [x] 360 e 1440, claro e escuro, teclado
