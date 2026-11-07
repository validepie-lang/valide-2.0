# Validação: Issue 031 - Validades pendentes a partir de referências do Behance

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/031/antes` e `depois`: 1440 claro e escuro, 768, 360; `fila-produto-6` e `fila-concluida` (fluxo feito por script).

## Fluxo de ponta a ponta, no Chrome

- Início: "Produto 1 de 18", barra vazia
- Cinco produtos preenchidos com lote e data, salvando com Enter: "Produto 6 de 18", "5 preenchidos · R$ 5.345 ainda parados"
- Os 13 restantes pulados: "Fila concluída", "Na fila 18 / Preenchidos 5 / Para depois 13", e o foco no título (H2)
- 360 sem rolagem horizontal, sem erro no console

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
