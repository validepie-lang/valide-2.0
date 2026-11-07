# Validação: Issue 028 - Registrar entrada de lote

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/028/`: entrada de produto com lotes (p1) e sem lote (p16), detalhe do produto com o atalho, edição com o card de lotes; 1440 claro e escuro, 768 e 360. `entrada-preenchida` (claro e escuro): lote L3104, validade 28/10/2026, 24 un, digitados por script.

## Conferido

- **Situação ao digitar:** validade 28/10/2026 mostra "Este lote fica como A vencer"
- **Como o estoque fica:** total agora 76 un, entrando +24 un, fica no total 100 un. Sem quantidade, "nada ainda"
- **Lotes que já existem** listados ao lado (L2291, L2318); sem lote, "Nenhum ainda. Este será o primeiro."
- **Atalhos:** "Registrar entrada" no cabeçalho do detalhe (só ícone no celular, como "Editar") e no card de lotes da edição
- **Saída sem regressão:** a baixa usa a mesma linha de resultado, agora em `stock-preview-row.tsx`; `exit-form.tsx` caiu de 248 para 231 linhas
- 360 sem rolagem horizontal, sem erro no console

## Achado e corrigido

O card do lote esticava até a altura da coluna da direita e deixava um vazio embaixo. Passou a ter a altura do conteúdo.

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.

## Complemento de 10/10: decisões do Marcus

O Marcus respondeu o ponto aberto 12: a entrada grava ENTRADA no histórico, e código de lote repetido no mesmo produto é recusado. Na tela:

- "Seu nome, a data e a hora entram no histórico do produto automaticamente", como na saída
- Digitar um código que o produto já tem mostra o erro no campo, sem diferenciar maiúscula: "l2291" em p1 dá "Este produto já tem o lote L2291. Confira o número impresso na caixa." (`entrada-lote-repetido.png`)
- Contrato: `409` com `LOT_CODE_TAKEN`, na seção Lotes. Falta o aceite do Pedro
