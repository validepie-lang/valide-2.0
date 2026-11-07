# Validação: Issue 048 - Folha impressa e quantidade por lote

**Data:** 10/10/2026
**Resultado:** passou

- − no primeiro lote: de 6 para 5, e o resumo de 48 para 47 unidades e de R$ 519 para R$ 506
- 999 no campo: aviso "Confira a quantidade" e "Registrar descarte" travado
- PDF da impressão (A4): só a folha, com os 5 lotes, as caixas e o "Conferido por"; nada do menu
- Celular (360) e visão do balconista conferidos
- `npx tsc --noEmit`, lint, `npm test` e `next build` passam. Capturas e PDF em `telas-novas/048/`
