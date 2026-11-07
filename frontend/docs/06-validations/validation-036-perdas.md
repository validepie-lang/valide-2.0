# Validação: Issue 036 - Perdas

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/036/`: 30 dias e 12 meses, 1440 claro e escuro, 768 e 360.

## Conferido

- 30 dias: R$ 2.390, 87 unidades, +12% sobre os 30 dias anteriores; vencimento 91%, avaria e roubo 9%; cinco semanas com o pico (27 set) em destaque
- 12 meses: R$ 25.095, sem variação (não há ano anterior); doze meses
- As porcentagens fecham 100%; a soma por motivo bate com o total
- Menu: "Perdas" ativo no trilho e na barra do celular (cinco itens cabem em 360)
- 360 sem rolagem horizontal, sem erro no console

## Achado e corrigido

O terceiro indicador era "Produtos com perda: 5+", mas o 5 vinha do limite da lista, não de uma contagem. Trocado por "Por avaria e roubo", que os dados sustentam.

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
