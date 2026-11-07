# Validação 061: Identidade Petróleo

**Data:** 11/10/2026 · **Branch:** `visual/identidade-petroleo`

## Verificações

| Item | Resultado |
| --- | --- |
| `npx tsc --noEmit` | sem erro |
| `npm run lint` | sem aviso |
| `npm test` | 122 de 122 |
| Zero hex solto | sim; tokens novos `--mint`, `--mint-hover`, `--mint-fg` em `globals.css` |
| Contraste (WCAG AA) | texto 14,6:1; apoio 5,7:1 no fundo e 5,3:1 no afundado; link 5,3:1; botão 12,3:1 claro e 11,5:1 escuro; menta 11:1 |
| Confusão com o verde de status | petróleo ~178° e escuro, verde de No prazo ~134° e médio; no escuro o primário é água, porque menta ficaria a 1,2:1 do texto do chip No prazo |
| 360px | Home e Estoque sem rolagem horizontal, sem erro de console |
| Tema escuro | Home, Estoque, Produto, Perdas e Login conferidos |

## Capturas

`06-validations/telas-novas/061/antes/` e `depois/`: Home, Estoque, Produto, Login e Perdas em 1440 claro, mais escuro e 360 no depois.

## Achado na tela

- Com a fileira de quatro trocada por 2 por 2, a linha de cima ficava mais baixa que a de baixo (o cartão Sem validade tem o link "Informar validades"). Resolvido com `auto-rows-fr`
- O fundo tingido dos cartões urgentes no escuro vinha do azul antigo e ficava arroxeado sobre o petróleo. Ajustado para `#2c2123` e `#29261c`
