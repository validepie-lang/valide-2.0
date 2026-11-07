# Validação: Issue 038 - Página 404 geral

**Data:** 10/10/2026
**Resultado:** passou

- `/nao-existe-xyz` responde **404** com a página nova (antes, a página padrão do Next em inglês)
- O "não encontrado" do produto (`/estoque/zzz`) continua o próprio
- Capturas em `telas-novas/038/`: 1440 claro e escuro, 768 e 360, sem rolagem horizontal
- `npx tsc --noEmit`, lint e `npm test` passam
