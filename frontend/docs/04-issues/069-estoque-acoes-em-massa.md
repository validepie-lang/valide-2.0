# Issue 069: Marcar produtos no Estoque e agir em vários de uma vez

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 8, 46 e 68). Em 12/10 ele aprovou as duas ações recomendadas ("pode seguir"): mover de pasta e retirar vencidos. Registrar saída em massa ficou de fora porque cada produto pede a própria quantidade.
**Status:** executada e validada.
**Depende de:** 068. Contrato v25 para mover em lote; até lá, dado simulado.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| SaaS Data Table (Behance, issue 029) | 897 curtidas | Caixa de marcar na primeira coluna; com linha marcada, uma barra no alto da tabela com a contagem e as ações |
| Data Table UX/UI (Behance, issue 035) | 576 curtidas | Marcar a página no cabeçalho, com o meio-marcado quando só parte está marcada, e o aviso "os 25 desta página estão marcados. Marcar todos os 84" |
| Ventor "Category" (Behance, issue 039) | 924 curtidas | Mover produtos de pasta numa janela com a pasta de destino |
| Primer, Saving | | Gravou, a confirmação aparece onde a pessoa estava, e o foco não se perde |

## Faz

- **Caixa de marcar (8):** em cada linha, dentro da coluna do produto, que fica parada no celular; no cabeçalho, marcar ou desmarcar a página, com meio-marcado
- **Barra de ações:** aparece no alto da tabela com "3 marcados", **Mover de pasta**, **Retirar vencidos** (só quando há vencido entre os marcados) e **Desmarcar**
- **Todos os N (46):** com a página toda marcada e mais produtos no filtro, "Os 25 desta página estão marcados. Marcar todos os 84"; marcados todos, "Os 84 estão marcados. Marcar só esta página"
- **Mover de pasta (68):** janela com a pasta de destino (as pastas e "Sem pasta"). Grava pelo `PATCH /products/folder` (contrato v25, proposto) com os ids; "todos os N" junta os ids no servidor do Next com o mesmo filtro da tela. Confirmação acima da tabela: "8 produtos movidos para Medicamentos."
- **Retirar vencidos:** leva à tela de retirar com só os lotes vencidos dos marcados (`?produtos=`), ou do filtro, quando são todos os N. A tela diz que está recortada e tem "Ver todos os vencidos"
- Mudar de página, filtro ou ordem desmarca tudo

## Não faz

- Registrar saída em massa: cada produto pede a própria quantidade
- Marcar em uma página e continuar marcando na outra: a seleção é da página ou do filtro inteiro

## Critérios de aceite

- [x] Marcar linha, marcar página (com meio-marcado) e marcar todos os N
- [x] Mover de pasta grava, confirma e desmarca; recusa do servidor fica na janela
- [x] Retirar vencidos aparece só com vencido marcado e leva só os lotes deles
- [x] Celular: a caixa fica na coluna parada; teclado e leitor de tela alcançam caixas e barra
