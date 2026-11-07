# Issue 055: Cadastrar e editar produto gravam

**Origem:** fase de lógica, terceira da ordem combinada com o Marcus em 10/10 (depois da fila, 053, e de entrada e saída, 054). Ele mandou seguir em 10/10 ("pode seguir").
**Status:** executada e validada. **Depende do Pedro:** com `products` em `NEXT_PUBLIC_API_LIVE`, o cadastro vai para `POST /products` e a edição para `PATCH /products/:id`. O corpo do cadastro estava como "corpo do produto mais lotes iniciais" no contrato: detalhado na v18, proposta. Sem a área ligada, o simulado confere e responde, mas não guarda.

## Referências

A tela não muda (issue 026: Inventar, Behance). O comportamento é o das issues 053 e 054, do Primer:

| Fonte | O que se usa |
| --- | --- |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | Validar ao enviar, depois enquanto se corrige; mensagem no campo, no lugar da dica; foco no primeiro campo errado, na ordem da tela |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) | Salvar nunca desabilitado; falhou, o digitado fica; mudança que leva a outra página, a confirmação no topo dela |
| [Primer, Loading](https://primer.style/product/ui-patterns/loading) | "Salvando…" no botão, campos só leitura |

## Faz

- Cadastro grava por `addProduct` e edição por `editProduct` (`actions/products.ts`, `createProduct` e `updateProduct` em `services/products.ts`)
- Obrigatórios: nome, custo de aquisição e preço de venda. Código de barras, se vier, só números, de 8 a 14. Estoque mínimo em branco vale 0; máximo, se vier, não menor que o mínimo. Dinheiro aceita "7,42", "1.234,56" e "R$ 12" e vai em centavos
- Preço de venda abaixo do custo: aviso neutro no campo, sem bloquear (business-rules.md seção 8)
- Lotes do cadastro: bloco em branco não vai (o produto nasce Sem validade); bloco começado é validado como na entrada, e dois blocos com o mesmo lote são recusados
- Código de barras de outro produto (`409 BARCODE_TAKEN`, o `ean` é único no banco): a mensagem diz de qual produto é, no campo
- Cadastrou: volta ao Estoque com "Dipirona Sódica 500mg cadastrado. Cadastrar outro". Editou: volta ao produto com "Alterações do produto salvas."
- Contrato v18, proposto: o corpo de `POST /products` e de `PATCH /products/:id`, e `409 BARCODE_TAKEN`
- Regras em `lib/utils/product-draft.ts`, com teste; estado do formulário em `product-form-state.ts`, campos em `product-fields.tsx` (o formulário passava de 200 linhas)

## Não faz

Itens 103 a 105 em `08-project/ficou-de-fora.md`.
