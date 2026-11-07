# Validação: Issue 050 - Filtros e atalhos

**Data:** 10/10/2026
**Resultado:** passou

- Avisos: Todos 6, Não lidos 3, Validade 1, Estoque mínimo 2, Equipe 2, Importação 1; "Estoque mínimo" mostra só os dois avisos de mínimo
- Estoque em 390 px: "Ordem: Nome, de A a Z" e "Aplicar" leva a `?ordem=name_asc`; a ordem padrão não vai para o endereço
- Histórico da Dipirona, "Ver em Movimentações": `/estoque/movimentacoes?produto=p1`, a pílula com o nome e 1 movimentação
- `npx tsc --noEmit`, lint, `npm test` e `next build` passam. Capturas em `telas-novas/050/`
