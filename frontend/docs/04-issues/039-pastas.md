# Issue 039: Pastas

**Origem:** levantamento de telas e abas que faltam (10/10, item A). A rota `/estoque/pastas` existia desde a 015, mas nenhum link levava até ela, e era a única tela que ainda não tinha passado por referência do Behance.
**Status:** executada e validada

## Referências

Behance, buscas "category management dashboard", "product categories ui", "inventory categories", "ecommerce admin categories", "category page dashboard", "product management dashboard", "folders management ui" e "inline editing table", por apreciações, todos os tempos. A maior parte traz painéis de outro assunto, kits de app ou fontes; a tela de categorias aparece dentro de projetos de estoque:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Inventory Management Dashboard (Ventor)](https://www.behance.net/gallery/186045923/Inventory-Management-Dashboard), tela "Category" | 924 curtidas, 5.876 visualizações | Título com "Add Category" à direita; tabela com o nome, um número por categoria e uma coluna de estado; ações de editar e excluir no fim da linha; total no rodapé |
| [Inventory management dashboard, SaaS & UX UI Design (Ventor)](https://www.behance.net/gallery/181600909/Inventory-management-dashboard-SaaS-UX-UI-Design), "Add Company" | 808 curtidas, 2.944 visualizações | Criar em janela sobre a lista: título, fechar no canto, campos, "Cancel" e "Save" embaixo à direita |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), mapa de telas | 524 curtidas, 15.571 visualizações | A categoria mora dentro do Estoque, não no menu principal |

## Faz

- `/estoque/pastas` refeita como a "Category" do Ventor: "Criar pasta" no cabeçalho, uma tabela de largura inteira com Pasta, Produtos, Vencidos e a vencer, e as ações Renomear e Excluir
- "Vencidos e a vencer" por pasta, o mesmo número que o painel já recebe (`byFolder` do `GET /dashboard`), com link para o estoque filtrado por pasta e situação. Número neutro: a cor de status não vai para uma soma de dois estados
- Criar e renomear em janela, como o "Add Company"; excluir também, com a confirmação
- Pasta com produto não se exclui (regra do contrato: `DELETE /folders/:id` dá erro se tiver produto). O botão não fica apagado: a janela explica o caminho e leva aos produtos da pasta, porque botão apagado não diz por quê
- No celular a tabela vira lista
- Porta de entrada: "Gerenciar pastas" no painel "Mais filtros" do Estoque, embaixo do filtro de pasta, só para quem administra
- Componente `Dialog` novo em `components/ui`, com o `<dialog>` do navegador: prende o foco, fecha com Esc e devolve o foco ao botão que abriu. Serve à próxima tela (adicionar pessoa)

## Não faz

Itens 64 a 69 em `08-project/ficou-de-fora.md`.
