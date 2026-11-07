# Plan: Issue 056 - Importação envia, mapeia e confirma

**Issue:** `docs/04-issues/056-importacao-grava.md`
**Data:** 10/10/2026
**Status:** aprovado (ordem da fase de lógica combinada com o Marcus em 10/10)
**Etapa da esteira:** 6 de 12

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| serviço de importação | `services/imports.ts` só lê (job, prévia, histórico) | sim; entram enviar, mapear e confirmar |
| envio de arquivo | `client.ts` só manda JSON | não, `apiPostForm` novo |
| peças de envio | `form-status.tsx`, `ActionResult` (053 a 055) | sim; `SubmitLabel` ganha a seta depois do texto |
| limite do envio | 1 MB padrão das server actions (docs do Next 16) | sobe para 4,3 MB em `next.config.ts` |

## 2. Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/lib/utils/import-draft.ts` e `.test.ts` | `checkCatalogFile`, `formatFileSize`, `validateMapping` |
| `src/lib/actions/imports.ts` | `uploadCatalog`, `saveMapping`, `runImport`, `checkImport` |
| `src/components/import/catalog-drop.tsx` | escolher, arrastar e enviar |
| `src/components/import/mapping-form.tsx` | o mapeamento com estado e envio |
| `src/components/import/import-run.tsx` | confirmar e acompanhar |

## 3. Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/lib/api/client.ts` | `apiPostForm` |
| `src/lib/services/imports.ts` | `startImport`, `saveImportMapping`, `confirmImport` |
| `next.config.ts` | `serverActions.bodySizeLimit` |
| `src/components/import/step-source.tsx`, `step-mapping.tsx`, `step-review.tsx`, `step-result.tsx` | usam as peças novas; "Baixar lista de erros" sai |
| `src/components/ui/form-status.tsx` | `iconAfter` |
| `src/app/(app)/estoque/importar/page.tsx` | `?importacao=` |
| docs: contrato (v19), ficou-de-fora (106 a 109) | |
