# Validação: Issue 047 - Quantidade com − e +

**Data:** 10/10/2026
**Resultado:** passou

- Saída: três cliques em + levam a 3, e "Como o estoque fica" acompanha (−3 un, fica 11 un); a seta para cima no campo leva a 4
- Entrada: + leva a 1 e "Entrando" mostra +1 un
- Celular (360): a caixa ocupa a largura toda, − apagado em zero
- `exit-form.tsx` com 150 linhas
- Ao trocar de página com quantidade digitada, o navegador perguntou antes de sair (a issue 046 funcionando)
- `npx tsc --noEmit`, lint, `npm test` e `next build` passam. Capturas em `telas-novas/047/`
