# Validação 069: Marcar produtos e agir em vários

**Data:** 12/10/2026
**Como:** Chrome headless por script (`cdp069.mjs` e `cdp069k.mjs`), em 1440 (claro e escuro) e 360 (emulação de celular).
**Capturas:** `telas-novas/069/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Caixas | 25 na página, cada uma com o nome ("Marcar Torsilax, 30 comprimidos"). Uma marcada: barra "1 marcado" e cabeçalho meio-marcado |
| Página e todos os N | Cabeçalho marca os 25 e aparece "Os 25 desta página estão marcados. Marcar todos os 84"; marcando todos, "84 marcados" e "Marcar só esta página" |
| Mover de pasta | Janela "Mover 84 produtos" com o foco na pasta. Sem escolher: "Escolha a pasta de destino." e o foco volta ao campo. Para Medicamentos: "84 produtos movidos para Medicamentos.", janela fechada, tudo desmarcado. Dois para "Sem pasta": "2 produtos ficaram sem pasta." |
| Retirar vencidos | Aparece só com vencido marcado. Com dois marcados, leva a `?produtos=p6,p30` e a tela mostra 2 lotes, com "Só os lotes vencidos dos produtos que você marcou no estoque. Ver todos os vencidos". Com todos os N, leva ao recorte da tela. Em "Sem pasta", marca 4 e só 1 tem vencido |
| Desmarcar ao mudar | Indo para a página 2, nada fica marcado |
| Teclado | A caixa do cabeçalho entra no Tab, com foco visível; Espaço marca os 25 |
| Celular | A caixa fica na coluna parada; a barra quebra em duas linhas; a página não rola para o lado |
| Erros no navegador | Nenhum |
| `tsc`, lint, testes | Sem erro; 155 testes passam (9 novos) |

## Corrigido durante a validação

1. **Faixa branca acima da barra no celular:** o respiro de cima saiu do contêiner e foi para a dica de arrastar

## Observação

O modo simulado responde como o servidor, mas não guarda: depois de mover, a tabela continua mostrando as pastas antigas até a API do Pedro (contrato v25) ou o item 99 (071).
