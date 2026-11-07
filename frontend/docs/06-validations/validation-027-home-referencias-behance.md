# Validação: Issue 027 - Home a partir de referências do Behance

**Data:** 09/10/2026
**Resultado:** passou

Capturas em `telas-novas/027/antes` (a Home da produção, antes do deploy) e `telas-novas/027/depois`: 1440 claro e escuro, 768, 360 e o esqueleto.

## Conferido

- **Cada bloco tem a sua referência** (tabela da issue): fileira de indicadores com o principal cheio, título com ação à direita, gráfico largo com lista estreita ao lado, tabela com cabeçalho de colunas e "Ver os 22"
- **Contraste do cartão cheio:** texto 13,9:1 no claro e 9,2:1 no escuro; apoio 6,1:1 e 5,9:1; botão claro com 13,9:1 e 12,5:1
- **Uma ação primária:** "Ver produtos em risco" (botão claro no cartão cheio). "Adicionar produto" no cabeçalho é secundário
- **Responsivo:** fileira de quatro estados só a partir de 1024; em 768 e 360, 2 por 2. Tabela de lotes a partir de 1024; abaixo, a lista de duas linhas. 360 sem rolagem horizontal, sem erro no console
- **Esqueleto** na mesma grade, com o cartão principal já cheio (a cor não depende do dado)

## Achado e corrigido

Em 768, os quatro estados numa fileira apertavam: "Sem validade" quebrava em duas linhas e "Informar validades" encostava na borda. A fileira passou a valer a partir de `lg`.

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
