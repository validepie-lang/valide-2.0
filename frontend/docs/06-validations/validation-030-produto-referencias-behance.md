# Validação: Issue 030 - Detalhe do produto a partir de referências do Behance

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/030/antes` (produção, antes do deploy) e `depois`: p1 (com lotes), p16 (sem lote), aba Histórico; 1440 claro e escuro, 768 e 360.

## Conferido

- Abas: "Visão geral" ativa por padrão, `?aba=historico` mostra só o histórico com a aba sublinhada; o rótulo traz a contagem ("Histórico (1)")
- Card Estoque: 76 un, mínimo de 20 un, L2291 Vencido 14 un, L2318 No prazo 62 un, custo parado R$ 564 (R$ 7,42 por unidade). Sem lote (p16): só o total e o custo
- Cabeçalho: "Editar produto" e a ação principal (Registrar saída, ou Informar validade sem lote); a entrada está no card
- Celular: situação, lotes, estoque, ficha, nessa ordem; 360 sem rolagem horizontal, sem erro no console

## Achado e corrigido

1. Com a ficha na coluna da direita, a esquerda ficava curta e a direita comprida. O Inventar põe as informações básicas embaixo do conteúdo principal, à esquerda; a ficha foi para lá, em três colunas.
2. No celular, o card Estoque caiu para o fim, depois da ficha. Grade explícita: no celular ele vem logo depois dos lotes.

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
