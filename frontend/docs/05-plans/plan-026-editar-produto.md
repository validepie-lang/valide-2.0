# Plan: Issue 026 - Editar produto

**Issue:** `docs/04-issues/026-editar-produto.md`
**Data:** 09/10/2026
**Status:** aprovado ("continue seguindo", 09/10, com o pedido de basear em referências)
**Etapa da esteira:** 6 de 12

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| formulário de produto | `components/products/product-form.tsx` (cadastro, 174 linhas) | sim, com o produto como valor inicial |
| campos de lote | `components/products/lot-fields.tsx` | sim, só no cadastro |
| página com produto e `notFound` | `estoque/[id]/baixa/page.tsx` | sim, o mesmo desenho |
| esqueleto do formulário | `estoque/novo/loading.tsx` | sim, reexportado |
| endpoint de edição | `PATCH /products/:id` no `api-contract.md` | já existe, nada a registrar |
| regra de quem edita | nenhuma (pergunta 6 ao Pedro) | não invento |

## 2. Arquivos a criar

| Caminho | O que é | Linhas |
| --- | --- | --- |
| `src/app/(app)/estoque/[id]/editar/page.tsx` | página de edição | 40 |
| `src/app/(app)/estoque/[id]/editar/loading.tsx` | reexporta o esqueleto do cadastro | 3 |
| `src/components/products/product-lots-section.tsx` | o card de lotes: campos no cadastro, leitura na edição | 90 |

## 3. Arquivos a alterar

| Caminho | Mudança |
| --- | --- |
| `src/components/products/product-form.tsx` | `product` opcional como valor inicial; o card de lotes sai para o componente novo; rótulos das ações na edição |
| `src/app/(app)/estoque/[id]/page.tsx` | link de "Editar produto" |
| `src/app/(app)/estoque/validades-pendentes/page.tsx` | `?produto=` põe o produto na frente |
| `src/app/(app)/estoque/[id]/baixa/page.tsx` | "Informar validade" com `?produto=` |

## 4. Validação

Capturas de `/estoque/p1/editar` e de um produto sem lote, em 1440 claro e escuro, 768 e 360. Fila aberta com `?produto=` de um produto que não é o primeiro. `tsc`, lint, `npm test`.
