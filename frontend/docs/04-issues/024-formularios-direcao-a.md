# Issue 024: Cadastro de produto, baixa e pastas na direção visual A

**SPEC de origem:** `docs/03-specs/direcao-visual-a.md`
**Status:** executada e validada; não publicada (o Marcus está apresentando)

## Faz

- As três telas já usam `Card` e `CardTitle`, então herdaram a sombra (017) e o título em `font-display` (021) sem mudança própria
- Baixa: cada opção de lote ganha a barra de estado de 5px à esquerda (regra 2 da SPEC), também quando está selecionada

## Corrigido durante a validação

A barra não aparecia: a cor da borda de seleção (`border-primary`, nos quatro lados) vinha depois na lista de classes e o `twMerge` descartava a cor da esquerda. A classe da barra passou para o fim.

## Para depois

`exit-form.tsx` está com 248 linhas (limite 200 do `CLAUDE.md`). O corte natural é tirar "Como o estoque fica" para um componente próprio.
