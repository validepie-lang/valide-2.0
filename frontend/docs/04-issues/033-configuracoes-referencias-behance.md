# Issue 033: Configurações a partir de referências do Behance

**Pedido do Marcus (09/10):** construir o sistema a partir de referências bem avaliadas do Behance.
**Status:** executada e validada

## Referências

Behance, buscas "settings page dashboard", "account settings ui" e "user management dashboard", por apreciações, todos os tempos:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Profile Settings Page for a Fintech Web App](https://www.behance.net/gallery/160949619/Profile-Settings-Page-for-a-Fintech-Web-App) | 110 curtidas, 15.034 visualizações | As seções numa lista vertical, num card à esquerda, com a ativa marcada; o formulário num card à direita; "Save Changes" no fim |
| [Profile Setting Ui Design](https://www.behance.net/gallery/187458035/Profile-Setting-Ui-Design) | 793 curtidas, 3.410 visualizações | O mesmo menu lateral de seções, com ícone em cada uma |
| [My Account Page / Settings Page](https://www.behance.net/gallery/161417943/My-Account-Page-My-Profile-Page-Settings-Page) | 81 curtidas, 7.776 visualizações | Dados de leitura em linhas, rótulo à esquerda (já era o `ReadOnlyRows`). Usa abas no topo: perdeu para o menu lateral, que aparece em dois |
| Pharmly (issue 027) | 356 curtidas | Linhas com rótulo e apoio à esquerda, controle à direita |

## Faz

- A partir de 1024, as três seções (Meu perfil, Empresa, Usuários) numa lista vertical à esquerda, num card, com ícone, uma linha de apoio e a ativa marcada por fundo e barra; o conteúdo nas 9 colunas da direita. Abaixo de 1024, as abas de antes

## Não faz

Itens 39 a 41 em `08-project/ficou-de-fora.md`: seção de notificações, rótulo à esquerda nos formulários, cancelar no cabeçalho da seção.
