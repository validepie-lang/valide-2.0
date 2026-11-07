# Validação: Issue 051 - Exportar Perdas

**Data:** 10/10/2026
**Resultado:** passou

- 90 dias, "Exportar planilha": baixou `perdas-90d-2026-10-10.csv`, com total R$ 5.447,23 e 190 unidades (os mesmos da tela), os três motivos, 13 semanas e os cinco produtos
- Abre no Excel em português sem ajuste: ponto e vírgula, vírgula decimal, acentos certos
- Testes de `loss-csv.ts`: BOM, separadores, datas e texto com ponto e vírgula e aspas
- Celular (360): o botão desce para baixo do seletor de período
- `npx tsc --noEmit`, lint, `npm test` (73) e `next build` passam. Capturas e o arquivo em `telas-novas/051/`
