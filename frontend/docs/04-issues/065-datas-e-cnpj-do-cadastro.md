# Issue 065: Datas que não envelhecem e CNPJ conferido no cadastro

**Origem:** 11/10/2026, o Marcus pediu as duas da lista de pendências: "Validar o CNPJ no cadastro da empresa" e "Investigar as datas de produção".
**Status:** executada e validada.

## Investigação das datas

Os lotes de exemplo apareciam um dia depois na produção em relação ao local (Torsilax vencido em 07/09 lá, 06/09 aqui). Causas:

1. **O "hoje" do dado simulado era calculado uma vez, quando o servidor ligava** (`TODAY` em `mocks/catalog.ts`). O servidor local estava ligado desde 10/10, 23:14; a produção, publicada em 11/10, estava certa. Mas qualquer servidor que passe a meia-noite ligado mostra o dia anterior
2. **Defeito maior, achado na investigação:** Início, Avisos, Ajuda, Configurações e Notificações eram geradas uma vez, na publicação (estáticas no build), porque no modo simulado não leem cookie. O Início publicado em 11/10 diria "Domingo, 11 de outubro", com as contagens daquele dia, até a publicação seguinte

## Faz

- `daily()` (`src/lib/utils/daily.ts`, com teste): o dado simulado é refeito quando o dia de Brasília muda. Catálogo, painel, avisos, movimentações e importações viram funções (`mockProducts()`, `mockDashboard()`...), e os serviços chamam as funções
- `export const dynamic = "force-dynamic"` no layout da área logada: toda tela é feita na hora do pedido
- Etapa 1 do cadastro da empresa: o "Continuar" confere CNPJ (dígitos verificadores), razão social e nome fantasia antes de avançar. Regras e mensagens são as de Configurações > Empresa (`companyIdentityErrors`, usada pelas duas telas). Confere ao continuar, depois corrige ao digitar, foco no primeiro erro (Primer, Forms)

## Não faz

- O cadastro continua sem gravar: criar a conta depende do login do backend (B24)
