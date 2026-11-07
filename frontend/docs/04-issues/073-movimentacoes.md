# Issue 073: Movimentações com contagem, datas livres, planilha e correção

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 75, 76, 77 e 79). Em 13/10 ele mandou seguir ("pode seguir").
**Status:** executada e validada.
**Depende de:** 072. Contrato v28 para o Pedro (contagem por tipo, `to`, ajuste); até lá, dado simulado.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| Inventar (Fikri Studio, Behance, issues 028 e 041) | 524 curtidas | Contagem em cada botão de situação ("All 120", "Low 12"); a "Stock Adjustment List" e o "New Stock Adjustment", com quantidade e motivo |
| Sales Analytics (Behance, issue 036) | 1.081 curtidas | Período com datas escolhidas ("01 Sep – 30 Sep") ao lado dos períodos prontos |
| SaaS Data Table (Behance, issue 029) | 897 curtidas | "Export" no cabeçalho da tabela, com o que está filtrado |
| Primer, Saving e Forms | | A correção grava numa janela, com a recusa do servidor ali dentro e o que foi digitado mantido |

## A regra que muda (item 79)

O histórico continua imutável: nenhuma movimentação é apagada ou editada. **Corrigir é registrar um AJUSTE** (tipo que o banco já tem, `TipoMovimentacao.AJUSTE`), com a diferença, a justificativa obrigatória e o vínculo com a movimentação corrigida. Quem corrige: **Farmacêutico e Administrador**, porque o banco diz que o nível 2 "autoriza descartes e ajustes". Cada entrada ou saída se corrige uma vez; um ajuste não se corrige (se errou, outro ajuste não resolve o que o primeiro já registrou: chama-se quem administra). Fica escrito em `business-rules.md`, seção 3.5.

## Faz

- **Contagem nos tipos (75):** "Todas 70", "Entradas 10", "Saídas 60", "Ajustes 0", como os botões de situação do Inventar. A contagem respeita período, pessoa e produto, e não o próprio tipo nem o motivo (senão "Entradas" mostraria zero quando o filtro é saída). Tipo ganha "Ajustes"; os quatro ficam dois por linha
- **Datas livres (76):** no painel, "De" e "Até" embaixo dos períodos prontos, no mesmo formulário de motivo e pessoa. Vão no endereço (`?de=2026-09-01&ate=2026-09-30`); escolher um período pronto tira as datas. Até um ano para trás, o "até" não passa de hoje e não vem antes do "de". Data inválida no endereço: a tela usa os últimos 30 dias e diz por quê. Título "De 01/09/2026 a 30/09/2026"
- **Planilha (77):** "Exportar planilha" no cabeçalho da lista, com tudo o que o filtro achou (não só a página), no formato de Perdas (ponto e vírgula, vírgula decimal, abre no Excel em português). Até 5.000 linhas; acima, as 5.000 mais recentes e o aviso. Usa o mesmo `GET /movements`, de 100 em 100
- **Corrigir (79):** "Corrigir" em cada entrada e saída da lista, para Farmacêutico e Administrador. A janela mostra o que foi registrado ("Saída de 6 un do lote L2291, hoje às 14:22, por Juliana Ferreira"), pede a quantidade certa (zero quando não aconteceu) e a justificativa, e diz o que vai acontecer ("Volta 4 un para o lote L2291"). Gravou: a lista ganha a linha "Ajuste +4 un" com "Corrige a saída de 6 un de 13/10, 14:22: <justificativa>", e a original fica marcada "Corrigida". `POST /movements/:id/adjust`
- O histórico do produto mostra o ajuste do mesmo jeito (selo "Ajuste", sinal na quantidade)
- No modo de demonstração, a correção entra no registro do cookie (issue 071) e muda o lote

## Não faz

- Corrigir pelo histórico do produto: a correção mora em Movimentações, onde se vê quem fez o quê
- Corrigir de novo ou desfazer um ajuste
- Exportar em outro formato (PDF, Excel nativo): a planilha CSV é a que o contador abre

## Critérios de aceite

- [x] Contagem certa nos quatro tipos, mudando com período, pessoa e produto
- [x] Datas livres filtram, aparecem no título, e data inválida volta aos 30 dias com aviso
- [x] A planilha traz todas as linhas do filtro, com acentos certos no Excel
- [x] Corrigir grava o ajuste, muda o estoque do lote, marca a original e não deixa corrigir de novo
- [x] Balconista (`?cargo=balconista`) não vê "Corrigir"; o servidor recusa com 403
- [x] 360 e 1440, claro e escuro, teclado
