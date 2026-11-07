# Validação: Issue 046 - Aviso ao sair com alterações não salvas

**Data:** 10/10/2026
**Resultado:** passou

- Entrada sem nada digitado: o link do menu segue direto
- Com o lote digitado: o link do menu abre "Sair sem salvar?", com o foco em "Continuar preenchendo"
- "Continuar preenchendo" fica na página com o que foi digitado (`L9999`)
- "Sair sem salvar" vai para o link
- `npx tsc --noEmit`, lint, `npm test` e `next build` passam
- Captura em `telas-novas/046/`
