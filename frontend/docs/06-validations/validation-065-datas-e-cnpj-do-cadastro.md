# Validação 065: Datas e CNPJ do cadastro

**Data:** 11/10/2026

| Caso | Resultado |
| --- | --- |
| Datas | local e produção mostram o Torsilax vencido em 07/09/2026; `daily` refaz o valor ao trocar o dia (teste com relógio trocado) |
| Build | todas as telas da área logada saem como dinâmicas (ƒ); antes, `/`, `/avisos`, `/ajuda`, `/configuracoes` e `/configuracoes/notificacoes` eram estáticas |
| K1 Continuar vazio | três erros (CNPJ, razão social, nome fantasia), foco no CNPJ (`telas-novas/065/vazio.png`) |
| K2 e K3 CNPJ 18.472.905/0001-64 | "Este CNPJ não confere..." no campo, foco nele (`cnpj-errado.png`) |
| K4 CNPJ corrigido | o erro some ao digitar |
| K5 Continuar com tudo certo | avança para a etapa 2 |
| E1 Configurações > Empresa | continua recusando o CNPJ errado, com a mesma mensagem |
| `tsc`, lint, 133 testes, build | sem erro |
