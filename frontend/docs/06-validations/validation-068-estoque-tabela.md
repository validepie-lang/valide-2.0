# Validação 068: Tabela do Estoque

**Data:** 12/10/2026
**Como:** Chrome headless por script (`cdp068.mjs`, `cdp068f.mjs` e `cdp068d.mjs`), em 360 (emulação de celular, claro e escuro), 768 e 1440.
**Capturas:** `telas-novas/068/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Linhas por página | Sem cookie, 25 ("Mostrando 1–25 de 84"). Escolhendo 50: 50 linhas. Recarregando na página 2: "51–84 de 84", seletor em 50. Voltando a 25: página 1 de novo |
| Celular, rolagem | Em 360 a região da tabela rola e a página não. Rolando 300px, a coluna do produto continua a 17px da borda e as outras passam por baixo dela. Dica e botão "Colunas" visíveis |
| Desktop e tablet | Em 1440 a tabela cabe sem rolar e a dica não aparece. Em 768 rola dentro do cartão, com a dica. No escuro, a coluna parada usa a superfície do tema e a linha da borda |
| Ordem | "Vence por último": a página 1 começa em 17/11/2027 e desce; a página 4 só tem "Sem validade" (antes estavam no topo). "Vence primeiro": idem, sem validade no fim |
| "Sem pasta" | Mais filtros > Pasta lista as seis pastas e "Sem pasta"; aplicar leva a `?pasta=sem`, 4 produtos. Na tela Pastas, a linha "Sem pasta" mostra 4 produtos e 2 vencidos e a vencer, com os links `?pasta=sem` e `?pasta=sem&status=expired,soon`; no celular, "4 produtos, 2 vencidos e a vencer" |
| `tsc`, lint, testes | Sem erro; 146 testes passam (2 novos) |

## Observações

- O catálogo simulado passou de 80 para 84 produtos (os quatro sem pasta), então os números do Início e do Estoque mudaram um pouco: 6 vencidos e 23 a vencer
- Com a coluna do produto parada, o nome quebra em até três linhas em 360; é o preço de manter a coluna à vista
