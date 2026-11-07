# Validação 066: Menu e atalhos

**Data:** 11/10/2026
**Como:** Chrome headless por script (`cdp066.mjs`), em 1440 por 800, 1440 por 640 e 360 (emulação de celular), tema claro e escuro.
**Capturas:** `telas-novas/066/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Oito itens no trilho, um aceso por tela | Passou nas nove rotas: `/` Início, `/estoque` Estoque, `/estoque/validades-pendentes` Validades, `/estoque/movimentacoes` Movimentos, `/estoque/calendario` Calendário, `/avisos` Avisos, `/perdas` Perdas, `/configuracoes` Ajustes, `/ajuda` Ajuda |
| 1440 por 800 sem rolar | Passou: a lista cabe exata (sobra 0px), tema termina em 780px |
| 1440 por 640 | A lista rola dentro do trilho (faltam 106px); Ajuda e tema continuam visíveis |
| Rótulos inteiros | Passou, depois da correção abaixo |
| Barra do celular em 360 | Seis itens de 60 por 64px, nenhum rótulo cortado, página sem rolagem lateral. Em `/ajuda` acende Ajuda; em `/estoque/movimentacoes` acende Estoque |
| Sombra do botão principal | Claro: `rgba(18, 28, 61, 0.16) 0 1px 2px`. Escuro: `rgba(0, 0, 0, 0.4) 0 1px 2px` |
| Teclado | Tab: pular para o conteúdo, logo, os oito itens na ordem visual, Ajuda, tema. Foco visível em todos |
| `tsc`, lint, testes | Sem erro; 133 testes passam |

## Corrigido durante a validação

1. **"Movimentações" passava da largura do trilho** (89px num espaço de 80). Virou "Movimentos", como no protótipo que o Marcus aprovou; a aba e o título da tela continuam "Movimentações"
2. **Em 800px a lista ainda rolava.** O item ficou mais baixo (respiro de 4px, intervalo de 2px) e a lista começa 16px abaixo do logo

## Observação

O "N" no canto de baixo das capturas do desktop é o indicador do Next no servidor local; não existe na produção.
