# Validação: Issue 035 - Retirar vencidos em lote

**Data:** 10/10/2026
**Resultado:** passou

## Fluxo no Chrome, por script

- Início: "5 lotes de 5 marcados · 48 unidades · R$ 519 a preço de custo"
- Desmarcar o segundo: "4 lotes de 5 marcados · 40 unidades · R$ 460", cabeçalho em estado parcial
- "Registrar descarte de 4": a barra pergunta "Tirar 4 lotes do estoque? Não dá para desfazer." com Voltar e Confirmar
- Confirmar: "Descarte registrado. 4 lotes saíram do estoque como Vencimento."
- `?cargo=balconista`: zero caixas, nenhum botão de descarte, o aviso de quem registra

Capturas em `telas-novas/035/`: as etapas do fluxo, 1440 claro e escuro, 768 e 360 (sem rolagem horizontal, sem erro no console).

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
