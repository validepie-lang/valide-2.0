# Issue 004: Acabamento visual e responsividade

**SPEC de origem:** nenhuma. Pedido do Marcus em 07/10/2026: "ainda tem coisas fora do lugar e coisas que estão bagunçadas", com atenção à responsividade.
**Status:** executada
**Depende de:** 003
**Etapa da esteira:** 5 de 12

---

## Objetivo

Corrigir o que a auditoria visual das 13 rotas encontrou em 1440, 768 e 360, claro e escuro, sem mudar dado, rota ou contrato.

## Inventário da auditoria

| # | Onde | Problema | Correção |
| --- | --- | --- | --- |
| G1 | Todas com ações no cabeçalho | No celular os botões empilham com larguras diferentes, alinhados à esquerda | Botões dividem a largura igualmente abaixo de `sm` |
| G2 | Cabeçalho | A busca do topo não faz nada, e no estoque aparece junto com a busca da página | Busca do topo pesquisa no estoque de verdade e some em `/estoque`, onde a página tem a dela |
| G3 | Configurações | Subtítulo fala em "conexões com outros sistemas", que saíram em 17/09 | Texto corrigido |
| E1 | Estoque | Onze chips de filtro quebram em duas linhas no desktop e em cinco no celular, com "Suplementos" órfão | Filtros vão para dentro do card da tabela, em duas linhas rotuladas (Situação, Pasta), cada uma rolando na horizontal quando não cabe |
| E2 | Estoque, celular | O selo "no mínimo" quebra em duas linhas | Selo não quebra |
| P1 | Produto | Coluna da esquerda termina na metade, sobra um vão grande; três cards de dados soltos à direita | Faixa de quatro indicadores no topo; lotes e histórico à esquerda; uma ficha única à direita |
| V1 | Validades pendentes | Conteúdo centralizado com largura máxima, desalinhado do título que começa na margem | Conteúdo na mesma grade da página |
| I1 | Importação, celular | As quatro etapas quebram em duas linhas desencontradas | Abaixo de `sm`, vira "Etapa 1 de 4" com barra segmentada |
| I2 | Importação | Coluna da direita com um card pequeno e um vão embaixo | Card com as quatro etapas do processo completa a coluna |
| F1 | Pastas, celular | "Higiene e beleza" quebra uma palavra por linha, espremido pelos botões | Botões viram ícone com nome acessível abaixo de `sm` |
| C1 | Configurações, aparência | Três opções de tema que parecem botões e não fazem nada; texto manda usar "o botão no topo", que mudou de lugar | Opções funcionam, com `aria-pressed`, e incluem o automático |

## Critérios de aceite

- [ ] Cada item do inventário corrigido e fotografado
- [ ] Nenhuma rolagem horizontal da página em 360
- [ ] `tsc`, lint e testes passam
- [ ] Publicado na Vercel ao final (pedido do Marcus)
