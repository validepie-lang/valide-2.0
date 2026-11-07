# Validação 067: Início com variação semanal, rosca por pasta e foto

**Data:** 12/10/2026
**Como:** Chrome headless por script (`cdp067.mjs` e `cdp067m.mjs`), em 1440 (claro e escuro), 768 e 360 (emulação de celular).
**Capturas:** `telas-novas/067/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Pílula da variação | "+56% desde a semana passada" no cartão, com a seta; neutra nos dois temas. Sem a semana passada não aparece (teste de unidade) |
| Rosca | "Medicamentos tem 10 dos 27 produtos em risco"; quatro pastas e "Outras pastas" (4), porcentagens 37, 30, 11, 7 e 15 (somam 100). O 27 do meio bate com 5 vencidos mais 22 a vencer do cartão principal |
| Legenda leva ao Estoque | Medicamentos abre `/estoque?pasta=f1&status=expired,soon`, que mostra 10 produtos: o mesmo número da legenda. "Outras pastas" não é link |
| Foto | Carregada pelo otimizador do Next (750px no celular, 640 no desktop), 143 KB no arquivo original; texto na faixa sólida legível nos dois temas |
| Larguras | 1440, 768 e 360 sem rolagem lateral; no celular a rosca fica em cima da legenda e a foto embaixo |
| Teclado | Tab passa pelas quatro pastas da legenda e depois por "Ver como fazer", com foco visível; a rosca fica fora do Tab (os números estão na legenda) |
| Erros no navegador | Nenhum |
| `tsc`, lint, testes | Sem erro; 144 testes passam (11 novos) |

## Corrigido durante a validação

1. **A página quebrava no servidor:** a função de cor das fatias estava no componente de cliente e o servidor também a chamava (legenda). Foi para `folder-share.ts`

## Observações

- O valor da semana passada é simulado (estado de cada lote calculado para sete dias atrás, com a quantidade de hoje). Com a API, vem do `valueAtRiskLastWeek` (contrato v23)
- Nas capturas de página inteira a foto aparece vazia quando fica fora da tela: é o carregamento sob demanda do Next, que só baixa a foto quando ela chega perto da tela
