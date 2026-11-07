# Plano 075: Importar com vários arquivos, progresso, rascunho, colunas reais, revisão com filtro e cancelar

Sem o item 26 (pendente com a equipe, decisão do Marcus em 13/10).

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `docs/01-references/import-strategy.md` | Regra antes do código: só no modo de demonstração o navegador lê a planilha (item 106) |
| `src/lib/types/index.ts` | `ImportStatus` ganha `uploading` e `canceled`; `ImportJob.files`, `warningRows`, `excludedRows`; `ImportPreviewRow.excluded`; `ImportRowFilter` |
| `src/lib/utils/catalog-read.ts` e `.test.ts` (novos) | Leitura de CSV (delimitador, aspas, UTF-8 ou Windows-1252) e XLSX (zip e XML, sem biblioteca) no modo de demonstração |
| `src/lib/utils/import-sample.ts` e `.test.ts` (novos) | Palpite do campo pelo nome da coluna; a revisão e as contagens montadas da amostra |
| `src/lib/utils/import-draft.ts` e `.test.ts` | 20 MB e 5 planilhas, partes de 1 MB, mesmas colunas |
| `src/lib/utils/import-issues-csv.ts` e `.test.ts` (novos) | A planilha das linhas com problema |
| `src/lib/utils/download.ts` (novo), `src/components/movements/movement-export.tsx` | O download com o BOM em bytes, agora compartilhado |
| `src/lib/services/import-store.ts` (novo) | A importação de demonstração num cookie |
| `src/lib/services/imports.ts`, `src/lib/actions/imports.ts` | Abrir, enviar parte, ler, desmarcar linha, cancelar, filtrar a prévia, rascunhos e colunas (contrato v29) |
| `src/components/import/catalog-drop.tsx`, `upload-files.tsx` (novo) | Vários arquivos, partes, barra por arquivo, cancelar o envio, leitura no navegador na demonstração |
| `src/components/import/discard-import.tsx`, `import-drafts.tsx` (novos) | Descartar ou cancelar com confirmação; a importação parada na primeira tela |
| `src/components/import/mapping-form.tsx`, `step-mapping.tsx` | "Salvar rascunho", "Descartar importação", aviso de arquivo não lido |
| `src/components/import/step-review.tsx`, `review-rows.tsx`, `row-toggle.tsx`, `import-issues-export.tsx` (novos os dois últimos) | Filtros com contagem, caixa de marcar, paginação, planilha das linhas com problema, rascunho e descarte |
| `src/components/import/step-result.tsx`, `import-run.tsx` | Estado "cancelada", cancelar enquanto importa, planilha das linhas com problema |
| `src/app/(app)/estoque/importar/page.tsx` | Filtro e página da revisão, rascunhos e faixas na primeira tela |
| Documentos | issue, contrato v29 (`api-contract.md`, `para-o-pedro.md`), validação, `ficou-de-fora.md` |
