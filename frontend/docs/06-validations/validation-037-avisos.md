# Validação: Issue 037 - Avisos e estoque abaixo do mínimo

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/037/`: 1440 claro e escuro, 768 e 360.

## Conferido

- "Marcar todos como lidos": de "3 não lidos" e três pontos para "Tudo lido" e nenhum ponto (Chrome, por script)
- O sino tem "Ver todos os avisos"
- Abaixo do mínimo: 12 produtos, do Amoxil BD (4 un, mínimo 6) ao Amoxicilina (12 un, mínimo 15)
- 360 sem rolagem horizontal, sem erro no console

## Achado e corrigido

Os avisos simulados contradiziam o estoque: "Álcool em Gel chegou ao estoque mínimo, restam 43 e o mínimo é 20" e "Dipirona, restam 14" (o estoque mostra 76). Agora os avisos de mínimo e de "lotes vencem nos próximos 7 dias" tiram os números do catálogo.

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
