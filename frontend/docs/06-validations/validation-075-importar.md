# Validação 075: Importar com vários arquivos, progresso, rascunho, colunas reais, revisão com filtro e cancelar

**Data:** 13/10/2026
**Como:** Chrome headless por script (`cdp075.mjs`, um passo por vez), em 1440 e em 360 com tema escuro, começando sem cookies (modo de demonstração). As planilhas foram geradas por script (`gera075.py`): duas "lojas" em CSV com ponto e vírgula no formato do Excel antigo (Windows-1252), uma com colunas diferentes, uma de 5,8 MB com 97.000 linhas e um XLSX com validade em data do Excel. A cada 9 linhas, uma sem nome; a cada 13, a quantidade em texto.
**Capturas:** `telas-novas/075/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Vários arquivos (37) | `loja1.csv` e `loja2.csv` juntos: "loja1.csv, loja2.csv · 200 linhas · 6 colunas, 6 já reconhecidas" |
| Colunas diferentes | `loja1.csv` com `outra.csv`: "outra.csv tem colunas diferentes de loja1.csv: não tem DESCRICAO_PRODUTO, … Exporte as duas do mesmo jeito, ou importe uma de cada vez." Seis arquivos: "Escolha até 5 planilhas por vez." |
| Acima de 4 MB e progresso (35, 109) | `grande.csv` (5,8 MB) subiu em 6 partes, com a barra e "4 MB de 5,8 MB · 69%" no meio; 97.000 linhas lidas |
| Colunas reais na demonstração (106) | CSV: as 6 colunas com os valores do arquivo e os acentos certos ("PRODUTO 1-0 AÇÚCAR", que veio em Windows-1252); o palpite acertou as 6. XLSX: DESCRICAO, COD_BARRAS, QTD_ESTOQUE e VALIDADE, com a validade convertida ("31/05/2027") |
| Contagens | 200 linhas: 22 sem nome (com erro), 15 com quantidade em texto (com aviso), 178 para entrar; "Importar 178 produtos". Conferem com o gerador |
| Aviso da demonstração | "toda linha aparece como produto novo: a regra que reconhece um produto que já existe ainda está em decisão com a equipe" (item 26) |
| Desmarcar e filtros (25) | `loja1.csv`: "Desmarcadas 0", "Importar 107 produtos"; desmarcar a linha 2: "Desmarcadas 1", "Importar 106 produtos", e continua depois de recarregar. O filtro "Desmarcadas" mostra a linha 2 com o selo "Desmarcada"; "Com erro" mostra a linha sem nome |
| Planilha das linhas com problema (107) | `linhas-com-problema-imp_….csv`, com BOM, cabeçalho "Linha;Produto;Código de barras;Código interno;Tipo;Problema" e uma linha por problema |
| Rascunho (38) | "Salvar rascunho" no Mapear: faixa "Rascunho salvo…", cartão "Importação não terminada · loja2.csv · colunas conferidas, falta revisar · 80 linhas"; "Continuar" abre a revisão |
| Descartar (108) | Janela "Descartar esta importação? O arquivo enviado e o que você escolheu até aqui somem. Nada foi gravado no estoque."; descartado, a faixa e o cartão some |
| Cancelar durante a importação (108) | "Importando loja1.csv… Cancelar importação": cancelada, o Resultado diz "Importação cancelada" e o histórico mostra "Cancelada · nenhum produto entrou" |
| Cancelar o envio (108) | No meio do arquivo grande: "Envio cancelado. Nada foi gravado no estoque." |
| Concluir | "Importação concluída · 107 produtos criados e 0 atualizados · 13 de 120 linhas ficaram de fora…" com "Baixar as linhas com problema" |
| Celular | 360 escuro: largura 360 na primeira tela e na revisão; filtros quebram em duas linhas, a caixa de marcar à esquerda de cada linha |
| `tsc`, lint, testes | Sem erro; 212 testes passam (16 novos: leitura de CSV e XLSX, palpite e prévia, várias planilhas, planilha de problemas) |

## Defeitos achados no teste e corrigidos

- O aviso "preço abaixo do custo" aparecia nas linhas da demonstração, mas a contagem "Com aviso", que é por coluna, não o via: os números não batiam. Saiu da demonstração (o servidor continua podendo dar esse aviso)
- A paginação dizia "1–25 de 120" mostrando só as 5 linhas que a demonstração tem; agora só aparece quando há outra página, e o subtítulo explica
- "Linhas 1 a 5" contradizia a coluna Linha, que começa em 2 (o cabeçalho da planilha é a linha 1)
- O cartão de quem salvou no Mapear dizia "parou na revisão"
- O cartão do arquivo enviando ficava estreito
