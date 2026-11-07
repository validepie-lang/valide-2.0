# Validação: Issue 017 - Home na direção visual A

**Data:** 09/10/2026
**Resultado:** passou, publicado em produção

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Igual à direção A do canvas | passou | Captura em 1440 claro e escuro |
| Celular | passou | Emulação em 360: documento com 360 de largura, sem erro de console |
| Status com cor, ícone e rótulo | passou | Cartões e listas |
| `npm test`, `tsc`, lint | passou | 57 testes, zero erro, zero aviso |
| Produção | passou | https://valide-eight.vercel.app responde 200 com a Home nova |

**Corrigido durante a validação:** a legenda "5 vencidos" saía com espaço duplo (número e palavra viravam itens separados do flex).

**Não feito, por pressa:** esqueleto de carregamento da Home, 768 e 1366, SPEC e documentação do design system. Ficam para a próxima issue.
