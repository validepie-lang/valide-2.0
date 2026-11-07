# Validação: Issue 010 - Estoque

**Issue:** `docs/04-issues/010-estoque.md`
**Plano:** `docs/05-plans/plan-010-estoque.md`
**Data:** 08/10/2026
**Resultado:** passou

## Antes e depois

| | Antes | Depois |
| --- | --- | --- |
| 1440 | `redesign-hierarquia/antes/estoque-1440.png` | `redesign-hierarquia/depois/estoque-1440.png` |
| 360 | `redesign-hierarquia/antes/estoque-360.png` | `redesign-hierarquia/depois/estoque-360.png` |
| Escuro | | `redesign-hierarquia/depois/estoque-1440-escuro.png` |
| 1366 × 768 | | `redesign-hierarquia/depois/estoque-1366x768.png` |
| Mais filtros e Colunas | | `estoque-mais-filtros-1440.png`, `estoque-colunas-1440.png` |

Antes: oito colunas, duas linhas de chips, selo "no mínimo" em 13 de 20 linhas, "Adicionar produto" como ação principal. Depois: quatro colunas, uma linha de chips, sem selo, "Importar produtos" como ação principal. No celular cabem sete produtos por tela, contra quatro.

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Um único botão cheio | passou | "Importar produtos"; "Adicionar produto" com contorno |
| Quatro colunas por padrão; seletor liga e desliga; volta ao recarregar | passou | Chrome controlado por script: padrão "Produto, Validade, Situação, Quantidade"; ligando Pasta e Custo parado, as duas aparecem; recarregando, continuam (cookie `valide_colunas=pasta,custo`) |
| `status=expired,soon` mostra 27, com os dois chips ativos | passou | "27 produtos com situação Vencido ou A vencer" |
| Fornecedor e marca filtram; pasta e origem continuam | passou | Panarello: 16; Medley: 5; origem manual: 1 |
| Valor inválido na URL é ignorado | passou | `status=foo,expired` mostra só os 5 vencidos |
| Quantidade com unidade, à direita, tabular | passou | Capturas |
| Sem "no mínimo" | passou | Busca no código e capturas |
| Teclado nos painéis | passou | "Mais filtros" abre com Enter; Esc fecha e o foco volta ao botão. Aplicar um fornecedor deixa a URL limpa (`?fornecedor=...`, sem `pasta=&marca=`) e o botão anuncia "Mais filtros, 1 ativo" |
| Claro, escuro, 1440, 1366, 768, 360, sem rolagem horizontal | passou | Emulação em 360 e 768: largura do documento igual à da tela, nenhum erro de console |
| `npm test`, `tsc`, lint | passou | 57 testes (4 novos, da leitura do cookie), zero erro, zero aviso |

## Corrigido durante a validação

- **Frase da contagem no plural errado** ("27 produtos vencido e a vencer"). Virou "com situação Vencido ou A vencer", com o vocabulário fixo.
- **Esqueleto do celular passava da borda** e ainda desenhava os cards antigos. Redesenhado na forma nova, sem largura fixa maior que a coluna.
- **Caixa de seleção piscava** entre o clique e a página voltar do servidor. A escolha passou a ser guardada também no componente.
- **Lint do React** recusou escrever `document.cookie` dentro do componente. A gravação foi para uma função no nível do módulo.
- **Comentário da Home** dizia que o filtro com dois estados ainda não existia.

## Achado sobre o método de verificação

A captura em 360 por iframe (`capturar.sh`) mostrou o estoque preso no carregamento. Por emulação do Chrome, sem iframe, a tela carrega inteira e sem erro. O iframe já tinha enganado antes (não desenha o Recharts). A skill `design-valide` ganhou `capturar-celular.mjs`, que captura por emulação, lista erro de console e avisa rolagem horizontal.

## Fora do plano

Tudo que entrou durante a execução está registrado no plano: `use-dismiss.ts` (e os dois menus que passaram a usar), `pieces.tsx`, o script da skill e o comentário da Home.

## Contrato

v10: `status` com vários valores, `supplier`, `brand`, `source` documentado, e `GET /products/facets` novo. A SPEC dizia "nenhum endpoint novo"; o motivo da exceção está na issue.

## Security Review

- [x] Cookie de colunas só guarda nomes de coluna, sem dado de usuário; o servidor aceita só nomes conhecidos (`parseColumns`, testado com valor adulterado)
- [x] Filtros na URL não carregam dado sensível
- [x] `samesite=lax`, sem `httpOnly` de propósito: o próprio navegador escreve, e não é credencial

## UX Review

- [x] Uma pergunta, uma ação primária
- [x] Filtro principal (situação) visível; os demais a um clique
- [x] Status com cor, ícone e rótulo
- [x] "Aplicar filtros" diz o que acontece
- [x] Sem travessão
