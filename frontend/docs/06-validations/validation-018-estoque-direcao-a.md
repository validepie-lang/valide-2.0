# Validação: Issue 018 - Estoque na direção visual A

**Data:** 09/10/2026
**Resultado:** passou

Capturas em `direcao-a/antes/` e `direcao-a/depois/` (`estoque-1440`, `estoque-1440-escuro`, `estoque-360`). A Home da 017 também está lá.

| Critério da SPEC | Resultado |
| --- | --- |
| Cinco regras aplicadas | passou: dois planos (card com sombra), status na barra e na distância, título em negrito, linha de contexto |
| Cor de status só nas formas da regra 2 | passou: barra, texto de distância e a contagem na linha de contexto, sempre com o rótulo do estado ao lado |
| Claro, escuro, 1440, 360 | passou; 360 por emulação sem erro de console e sem rolagem horizontal |
| `npm test`, `tsc`, lint | passou |
