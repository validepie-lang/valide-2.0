# Issue 040: Adicionar e editar pessoa

**Origem:** levantamento de telas e abas que faltam (10/10, item B). Em Configurações › Usuários, "Adicionar pessoa" e "Editar" não abriam nada, e bloquear o acesso de quem sai da farmácia não tinha onde ser feito.
**Status:** executada e validada

## Referências

Behance, buscas "user management dashboard", "team members settings", "add member modal", "roles and permissions", "add new user", "invite team members" e "admin panel users", por apreciações, todos os tempos. "Add member" e "invite" trazem convites de casamento e carros; "roles" traz ilustração. A tela de usuários aparece em painéis administrativos:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [User Page](https://www.behance.net/gallery/184520011/User-Page) | 547 curtidas, 28.864 visualizações | "Add Users" no alto à direita; cada bloco com o seu "Edit"; nome em destaque e o cargo embaixo, apagado |
| [Inventory management dashboard, SaaS & UX UI Design (Ventor)](https://www.behance.net/gallery/181600909/Inventory-management-dashboard-SaaS-UX-UI-Design), "Add Company" e "Permissions" | 808 curtidas, 2.944 visualizações | Janela com os campos em duas colunas, seleção para o que tem opções fixas, "Cancel" e "Save" embaixo à direita; a tabela de permissões por grupo, que a tela já tinha |
| [HR Management Dashboard](https://www.behance.net/gallery/185372253/HR-Management-Dashboard-Project), perfil do funcionário (issue 037) | 1.074 curtidas, 13.776 visualizações | Dado de leitura com o rótulo apagado à esquerda e o valor à direita |

## Faz

- "Adicionar pessoa" abre a janela (o `Dialog` da 039): nome, usuário de acesso, senha inicial e cargo, em duas colunas da tela pequena em diante. O cargo é uma seleção, e embaixo dela aparece o que aquele cargo pode, tirado da mesma tabela "O que cada cargo pode"
- Erros que o front já sabe dar: campo vazio, usuário com espaço ou acento, usuário que já existe na lista, senha com menos de 8 caracteres (a mesma regra do Perfil). O servidor continua sendo quem recusa de verdade: o `login` é único no banco inteiro, não só na farmácia
- "Editar" abre a mesma janela com o nome e o cargo; o usuário de acesso aparece só para leitura, porque o `PATCH /users/:id` não o muda
- "Nova senha", opcional, na edição: é para onde vai quem esqueceu a senha ("peça a quem administra a conta"). Depende do ponto aberto 10 do contrato
- Bloquear e liberar o acesso, com confirmação. Bloquear não apaga: o histórico continua com o nome da pessoa
- Ninguém muda o próprio cargo nem bloqueia o próprio acesso pela tela: a farmácia não pode ficar sem administrador. Proposta ao servidor no contrato (v14)

## Não faz

Itens 70 a 74 em `08-project/ficou-de-fora.md`.
