# Plano 073: Movimentações com contagem, datas livres, planilha e correção

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `docs/00-context/business-rules.md` | Regra antes do código: seção 3.5 (correção por AJUSTE, histórico imutável) e a linha "Corrigir uma movimentação" na tabela de cargos |
| `src/lib/types/index.ts` | `Movement.type` ganha `adjust`; `corrects` e `correctedAt`; `MovementCounts`; `MovementFilters.to` |
| `src/lib/utils/movement-fix.ts` e `.test.ts` (novos) | Regras da correção: diferença, validação, frases do efeito e do vínculo, observação da lista |
| `src/lib/utils/date-range.ts` e `.test.ts` (novos) | Datas livres do endereço: o que serve e a frase do que não serve; título "De … a …" |
| `src/lib/utils/movement-csv.ts` e `.test.ts` (novos) | A planilha, no formato de Perdas |
| `src/lib/utils/permissions.ts` | `canAdjustStock`: Farmacêutico e Administrador |
| `src/lib/utils/demo-journal.ts` e `.test.ts`, `src/lib/services/demo-store.ts` | Ação `fix` no registro da demonstração: muda o lote, vira movimentação de ajuste e marca a corrigida |
| `src/lib/services/movements.ts` | `getMovements` com `to`, `type=adjust` e a contagem por tipo; `getMovementsForExport` (de 100 em 100, até 5.000); `adjustMovement` |
| `src/lib/actions/movements.ts` | `correctMovement` e `exportMovements` |
| `src/components/movements/movement-params.ts` | `tipo=ajuste`, `de` e `ate`, `corrigido`, `cargo` |
| `src/components/movements/movement-filters.tsx` | Contagem nos tipos, "Ajustes", datas livres no formulário |
| `src/components/movements/movement-day-list.tsx` | Coluna "Corrigir" / "Corrigida em…"; observação do ajuste |
| `src/components/movements/fix-movement.tsx`, `movement-export.tsx`, `movement-list-header.tsx` (novos) | A janela de correção, o botão da planilha e o topo do cartão (sai da página para ela caber) |
| `src/app/(app)/estoque/movimentacoes/page.tsx` | Título com as datas, aviso de data inválida, faixa "Correção registrada", quem pode corrigir |
| `src/components/products/movements-table.tsx` | Selo "Ajuste", quantidade com sinal, o que o ajuste corrige e "Corrigida em" no histórico do produto |
| Documentos | issue, contrato v28 (`api-contract.md`, `para-o-pedro.md`), validação, `ficou-de-fora.md` |
