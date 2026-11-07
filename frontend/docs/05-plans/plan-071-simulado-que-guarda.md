# Plano 071: O modo de demonstração guarda o que foi gravado

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/lib/utils/demo-journal.ts` e `.test.ts` (novos) | O registro: tipos das ações, leitura e escrita do cookie (descarta as mais antigas acima de 3,5 KB), aplicação ao catálogo, movimentações e notas do registro |
| `src/lib/services/demo-store.ts` (novo) | Lê e grava o cookie `valide_demo` (só no ramo simulado); `demoProducts`, `demoMovements` |
| `src/lib/services/products.ts`, `lots.ts`, `movements.ts`, `product-folders.ts`, `product-extras.ts`, `dashboard.ts` | Leem o catálogo com o registro; cadastro, edição, lote, saída, retirada em lote, mudança de pasta e nota gravam no registro. A retirada em lote passa a conferir os lotes, como o servidor |
| `src/lib/mocks/dashboard.ts` | `buildDashboard(produtos, movimentações)`; o painel de exemplo é o mesmo com o catálogo original |
| `src/components/products/product-form.tsx`, `src/app/(app)/estoque/[id]/page.tsx`, `src/app/(app)/estoque/page.tsx` | Cadastrou, abre o produto novo com "Produto cadastrado. Cadastrar outro"; o aviso antigo da lista sai |
| `src/lib/actions/demo.ts`, `src/components/settings/demo-reset.tsx` (novos), `src/app/(app)/configuracoes/page.tsx` | Seção "Demonstração" com a contagem e "Apagar o que a demonstração guardou" |
| Documentos | issue, validação, `ficou-de-fora.md` (99 e 103) |
