# Validação: Issue 032 - Importar a partir de referências do Behance

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/032/antes` e `depois`: os quatro passos em 1440 claro e escuro e 768; Origem e Mapear em 360.

## Conferido

- Etapas: Origem e Mapear com ✓ e link quando já feitas; a atual com círculo cheio e `aria-current="step"`; as futuras sem link
- Mapear: "catalogo-setembro.xlsx, 814 linhas · 12 colunas, 11 já reconhecidas", "Trocar arquivo"; ações no fim
- Resultado cabe nas 9 colunas, com "Importações anteriores" ao lado
- 360: campo de seleção na largura inteira; sem rolagem horizontal, sem erro no console

## Achado e corrigido

Em 360 o campo de seleção do Mapear ficava pela metade: o `flex-1` ia para o `<select>`, dentro de uma `div` que não crescia. O invólucro ganhou o `flex-1`.

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
