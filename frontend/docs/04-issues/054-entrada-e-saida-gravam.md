# Issue 054: Entrada e saída gravam

**Origem:** fase de lógica, segunda da ordem combinada com o Marcus em 10/10 (depois da fila, 053). Ele mandou seguir em 10/10 ("continue").
**Status:** executada e validada. **Depende do Pedro:** com `products` em `NEXT_PUBLIC_API_LIVE`, a entrada vai para `POST /products/:id/lots`; com `movements`, a saída vai para `POST /movements/out`. Sem as áreas ligadas, o servidor simulado confere e responde como o do Pedro, mas não guarda: o produto continua com o estoque de antes.

## Referências

As telas não mudam: entrada (028, 042) e saída (Inventar, "Adjust Stock", Behance). O comportamento é o da 053, do Primer:

| Fonte | O que se usa |
| --- | --- |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) | "Do not disable or hide a form's save button even if the form is invalid or has not been changed": o "Registrar saída" ficava desabilitado até o formulário ficar certo. Mudança que leva a outra página: a confirmação num Banner no topo da página de chegada. Falhou, o que foi digitado fica |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | Validar ao enviar, depois enquanto se digita; mensagem no campo, no lugar da dica; foco no primeiro campo errado |
| [Primer, Loading](https://primer.style/product/ui-patterns/loading) | "Salvando…" no botão, campos só leitura enquanto grava |

## Faz

- Entrada (pelo produto e geral) grava por `addLot` (a action da 053); saída grava por `exitLot` (`actions/movements.ts`) e `registerExit` (`services/movements.ts`)
- Entrada: lote, validade e quantidade obrigatórios; fabricação opcional, mas completa e não depois da validade; lote repetido no produto recusado no campo (antes de enviar e, se o servidor recusar, `409 LOT_CODE_TAKEN`)
- Saída: quantidade e motivo obrigatórios; passar do que o lote tem aparece na hora; a justificativa vai junto
- Gravou: entrada e saída pelo produto voltam ao produto com "Saída de 2 un do lote AL7733 registrada."; a entrada geral volta à busca, com o foco nela, "… registrada em Allegra 120mg" e "Ver o produto" (`RegisteredBanner`, `SavedBanner`), para bipar o próximo da caixa. A faixa fecha com "×"
- Peças comuns em `components/ui/form-status.tsx` (`SubmitLabel`, `FormFailure`, `focusFirstError`), também usadas pela fila
- Corrige o `UnsavedGuard`: qualquer envio zerava o aviso de sair sem salvar, até o recusado pela validação. Agora só salvar zera (`markSaved` para quem grava e fica na tela)
- Regras em `lib/utils/lot-draft.ts` (`validateLot`) e `lib/utils/exit-draft.ts`, com teste

## Não faz

Itens 101 e 102 em `08-project/ficou-de-fora.md`.
