# Issue 026: Editar produto

**Origem:** levantamento de telas que faltam (09/10/2026). O botão "Editar produto" do detalhe leva a `/estoque/novo?produto=`, que abre o cadastro vazio. "Informar validade" leva à fila, que ignora `?produto=` e abre no primeiro da fila.
**Status:** executada e validada
**Pedido do Marcus (09/10):** nada inventado; cada escolha parte de referência bem avaliada de UI/UX, pesquisada no Behance.

## Referências

Pesquisa no Behance, buscas "inventory management", "pharmacy dashboard", "add product form", "edit product dashboard" e "product management saas", ordenadas por apreciações, todos os tempos. Os projetos de estoque e farmácia mais bem avaliados (500 a 1.000 curtidas) são, na maioria, vitrine de marca e de painel, sem tela de formulário. O único com o fluxo de produto completo:

| Projeto | Avaliação | O que se usa dele |
| --- | --- | --- |
| [Inventar, inventory and Warehouse Management system](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), Fikri Studio | 524 curtidas, 15.569 visualizações | (1) Formulário de produto em página inteira, com as seções numa navegação à esquerda e "Back to product list" no topo. (2) "Edit" fica no cabeçalho do detalhe do produto. (3) Estoque não se edita no formulário: "Adjust Stock" é uma ação própria, aberta do detalhe, e cada ajuste entra no histórico com autor e data. (4) Ações no rodapé, a principal cheia à direita, a secundária em contorno ao lado |

O Behance mostra a tela, não o comportamento. Para o comportamento de edição, o Primer, design system público do GitHub:

| Fonte | Regra usada |
| --- | --- |
| [Primer, Edit](https://primer.style/product/scenario-patterns/edit) | "Use a full page for settings that span several sections." "Give every edit surface a visible cancel alongside the save button." "Keep the save button enabled even when the form is unchanged or invalid" |
| [Primer, Saving](https://primer.style/ui-patterns/saving) | Rótulo com verbo ativo ("Save", "Update"); nunca desabilitar o botão de salvar |

## Faz

- Rota `/estoque/[id]/editar`, página inteira (Primer; Inventar), com "Voltar ao produto" no topo e o nome e o código do produto no cabeçalho
- O mesmo `ProductForm` do cadastro, preenchido com os dados do produto. Mesma navegação de seções à esquerda (Inventar)
- No lugar de "Lote e validade", um card "Lotes" só de leitura: lote, validade e quantidade, com "Registrar saída". Lote e quantidade mudam por movimentação, que fica no histórico (Inventar, "Adjust Stock"; regra do banco: histórico imutável)
- Ações: "Cancelar", que volta ao produto, e "Salvar alterações" (Primer: cancelar visível, verbo ativo, botão nunca desabilitado)
- Detalhe do produto: "Editar produto" passa a levar a `/estoque/[id]/editar`
- Fila de validades: `?produto=` põe esse produto na frente da fila. A baixa sem lote também passa a mandar o `?produto=`
- Esqueleto de carregamento da edição, igual ao do cadastro

## Não faz

- **Gravar.** Como o cadastro, a baixa e as configurações, o formulário é protótipo visual até a fase de lógica. O endpoint já está no contrato: `PATCH /products/:id`
- **Aviso de alterações não salvas** ao sair (Primer, Saving). Depende de saber se o formulário mudou, e entra com a lógica
- **Quem pode editar.** É a pergunta 6 ao Pedro (permissões por cargo). Até a resposta, o botão aparece para todos, como hoje
- **Histórico de edições do produto** (Inventar mostra "Change product name to…"). O histórico do Valide é de movimentação de estoque; registrar edição de cadastro é pergunta para o backend

## Aceite

- [x] Editar abre com todos os campos preenchidos com os dados do produto
- [x] Nenhum campo de lote ou quantidade editável
- [x] "Informar validade" abre a fila no produto certo
- [x] Claro e escuro, 1440, 768 e 360 sem rolagem horizontal
- [x] `tsc`, lint, `npm test`
