# Plano 072: Entrada, saída e validades pendentes

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/lib/utils/lot-draft.ts` e `.test.ts` | `LotInput` ganha `supplier` e `invoiceNumber`; `validateEntryOrigin` (fornecedor até 80 letras, nota com número); `QueueLotDraft.madeAt` e a fila conferindo a fabricação como a entrada |
| `src/lib/utils/queue-streak.ts` e `.test.ts` (novos) | Placar: salvo soma, pular zera, melhor sequência, troféu a cada 10 |
| `src/components/products/entry-origin-fields.tsx`, `entry-summary.tsx` (novos), `entry-form.tsx`, as duas páginas de entrada | Fornecedor (com os da conta) e Nota fiscal no lote que chega; o resumo lateral sai para caber em 200 linhas |
| `src/lib/utils/demo-journal.ts` | Na demonstração, a ENTRADA ganha a observação "Fornecedor · NF número" |
| `src/components/products/movements-table.tsx` | O histórico do produto passa a mostrar a observação embaixo do tipo (fornecedor e nota na entrada, justificativa na saída), como a tela Movimentações já fazia. Entrou no plano durante o teste: sem isso, o item 22 não aparecia no histórico |
| `src/components/products/queue-lot-fields.tsx`, `quick-fill-form.tsx`, `queue-saved.tsx`, `queue-actions.tsx` (novos), `queue-progress.tsx`, `queue-done.tsx` | Fabricação na fila; "Salvo: … · Desfazer" que devolve o produto com o que foi digitado; "N seguidas", troféu, melhor sequência no fim. A fila fica a da hora em que a tela abriu (gravar recarregava a lista e pulava um produto a cada salvo, defeito que veio da 071) |
| `src/lib/services/lots.ts`, `src/lib/actions/lots.ts` | `deleteLot` / `removeLot`: `DELETE /products/:id/lots/:lotId`; na demonstração, tira o lote do registro |
| `src/lib/services/movements.ts`, `src/lib/actions/movements.ts`, `src/components/products/undo-exit.tsx` (novo) | `reverseExit` / `undoExit`: `POST /movements/:id/reverse`; na demonstração, tira a saída do registro |
| `src/lib/services/demo-store.ts` | `unrecord(id)` |
| `src/components/products/registered-banner.tsx`, `exit-form.tsx`, `src/app/(app)/estoque/[id]/page.tsx`, `src/app/(app)/estoque/[id]/baixa/page.tsx` | Faixa com "Desfazer" e "Saída desfeita."; "Registrar e fazer outra" grava e fica na tela de saída com o formulário limpo |
| `src/components/products/product-form.tsx`, `product-fields.tsx`, `src/lib/services/products.ts` | `409 SKU_TAKEN` no campo do código interno (o campo passa a mostrar erro); cadastro vindo da entrada geral volta para ela com "X cadastrado." |
| Documentos | issue, contrato v27 (`api-contract.md`, `para-o-pedro.md`), `design-system.md` 14.9 (placar), validação, `ficou-de-fora.md` |
