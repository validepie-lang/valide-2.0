# Validação: Issue 034 - Login e cadastro a partir de referências do Behance

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/034/antes` e `depois`: login, login com erro e cadastro em 1440 claro e escuro e 768; login e cadastro em 360.

## Conferido

- 1440: duas metades; o painel da marca acompanha a tela inteira; o formulário centralizado na metade esquerda
- O erro de login continua no lugar, em vermelho, com ícone e texto
- 768 e 360: só o formulário, com o logo; sem rolagem horizontal, sem erro no console
- Painel no escuro: texto 9,2:1 e apoio 5,9:1 (os mesmos tokens `feature` da Home)

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
