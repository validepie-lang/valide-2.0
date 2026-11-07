# Validação 073: Movimentações com contagem, datas livres, planilha e correção

**Data:** 13/10/2026
**Como:** Chrome headless por script (`cdp073.mjs`, um passo por vez), em 1440 e em 360 com tema escuro, começando sem cookies (modo de demonstração).
**Capturas:** `telas-novas/073/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Contagem nos tipos (75) | 30 dias: "Todas 70 · Entradas 10 · Saídas 60 · Ajustes 0". 7 dias: 27, 6, 21, 0. Juliana com Saídas escolhida: "Todas 18 · Entradas 3 · Saídas 15", ou seja, o número de Entradas não zera por causa do tipo escolhido |
| Datas livres (76) | `?de=2026-09-20&ate=2026-10-01`: título "De 20/09/2026 a 01/10/2026", 22 movimentações, os campos começam com as datas e nenhum período pronto aceso. Pelo formulário (06 a 08/10): 10 movimentações. Clicar "7 dias" tira as datas (`?periodo=7d`) |
| Data que não serve | `?de=2026-10-20`: "A data de início não pode passar de hoje. Mostrando os últimos 30 dias." e a lista dos 30 dias. Os outros casos (início depois do fim, um ano para trás, data que não existe, só o fim) estão nos testes de unidade |
| Planilha (77) | Saídas dos últimos 7 dias: `movimentacoes-2026-10-07-a-2026-10-13.csv`, com BOM, período no topo, 21 linhas, a mesma contagem da tela, quantidade com sinal (`-6`) |
| Corrigir (79) | Saída de 6 un da Dipirona: a janela diz o que foi registrado; vazia, os dois avisos e o foco na quantidade; 6 de novo, "É a mesma quantidade registrada (6 un)"; 5, "Volta 1 un para o lote L2291." Gravou: faixa "Correção registrada", linha "Ajuste +1 un" no topo com "Corrige a saída de 6 un de 13/10, 14:22: O caixa bipou a mesma caixa duas vezes.", a original com "Corrigida em 13/10, 18:48" e sem o botão, "Ajustes 1" e o estoque da Dipirona de 76 para 77 un |
| Histórico do produto | A aba Histórico mostra "Ajuste · Corrige a saída de 6 un… · +1 un" |
| Cargos | `?cargo=balconista`: nenhum "Corrigir". Administrador: 25 (um por linha da página). O serviço recusa com 403 quem não pode |
| Celular | 360 escuro: largura 360, tipos dois por linha com o número, "Corrigir" com alvo de 44 px, janela com 328 de largura e os botões um embaixo do outro |
| `tsc`, lint, testes | Sem erro; 196 testes passam (16 novos: correção, datas, planilha e o registro da demonstração) |

## Defeitos achados no teste e corrigidos

- A planilha chegava sem o BOM (o caractere se perdia entre o servidor e o navegador), e o Excel em português trocaria os acentos. Agora o BOM vai em bytes na hora de montar o arquivo
- A janela de correção herdava o alinhamento à direita da célula da tabela
- "Volta 1 un para o lote" só aparecia depois da justificativa; agora aparece assim que a quantidade serve
- As datas ficavam cortadas ("dd/mm/aa") no painel estreito; da tela grande em diante, uma embaixo da outra
- Data de início no futuro dizia "a data de início vem depois da data final"
