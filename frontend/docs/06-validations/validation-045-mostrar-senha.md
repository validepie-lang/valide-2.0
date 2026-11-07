# Validação: Issue 045 - Mostrar e esconder a senha

**Data:** 10/10/2026
**Resultado:** passou

- Login: digitada a senha, o olho troca o campo para texto, o rótulo vira "Esconder a senha" e `aria-pressed` fica `true`
- Nenhum `type="password"` sobrou fora do componente (6 campos trocados)
- `npx tsc --noEmit`, lint, `npm test` e `next build` passam
- Captura em `telas-novas/045/`
