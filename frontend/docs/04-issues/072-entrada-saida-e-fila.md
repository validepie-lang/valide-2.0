# Issue 072: Entrada, saída e validades pendentes

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 22, 24, 98, 100, 101, 102, 104 e 105). Em 12/10 ele aprovou a recomendação para o placar ("pode seguir"): a cor do acerto é a da marca, nunca verde ou vermelho.
**Status:** executada e validada.
**Depende de:** 071 (o desfazer na demonstração tira a ação do registro). Contrato v27 para o Pedro.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| Inventar (Fikri Studio, Behance, issue 028) | 524 curtidas | Fornecedor e número da nota no recebimento ("Purchase order") |
| Quizai e English Learning App (Behance, issue 031) | 27.801 e 32.037 visualizações | Placar de acertos seguidos e a comemoração ("Great job!") com troféu |
| Gmail e Primer, Saving | | "Desfazer" na própria confirmação, por pouco tempo, sem janela de "tem certeza" |
| Primer, Forms | | Código interno repetido aparece no campo, como o código de barras |

## Faz

- **Fornecedor e nota fiscal na entrada (22):** campos opcionais "Fornecedor" (com os fornecedores que já existem na conta) e "Nota fiscal" no lote que está chegando, nas duas entradas. Vão no `POST /products/:id/lots` e aparecem na observação da ENTRADA no histórico
- **Fabricação na fila (100):** campo opcional "Fabricação" na fila de validades pendentes, com a mesma regra da entrada (completa, e não depois da validade)
- **Placar (24):** na fila, "N seguidas" ao lado do progresso; a cada 10 seguidas, troféu e "Muito bem!"; a linha do salvo em tom da marca. Pular zera a sequência. No fim da fila, a melhor sequência. Sem verde nem vermelho, sem animação
- **Desfazer na fila (98):** "Salvo: … · Desfazer" volta o lote que acabou de entrar e devolve o produto à tela com o que foi digitado. `DELETE /products/:id/lots/:lotId`
- **Desfazer a saída (102):** na faixa "Saída de 2 un do lote L2291 registrada.", o botão "Desfazer". O servidor registra um estorno (o histórico continua imutável, como no item 79). `POST /movements/:id/reverse`
- **Registrar outra saída (101):** "Registrar e fazer outra" ao lado de "Registrar saída": grava e fica na tela de saída, com a faixa de confirmação em cima e o formulário limpo
- **Voltar à entrada geral (104):** produto cadastrado a partir da entrada geral (`?codigo=`) volta para a busca, com "X cadastrado." e o campo pronto para o próximo
- **Código interno repetido (105):** recusado no campo, como o código de barras: "Este código interno já é do produto X". `409 SKU_TAKEN`

## Não faz

- Desfazer depois de sair da tela: o desfazer vale na confirmação; depois, corrige-se com outra movimentação (item 79, issue 073)
- Desfazer a entrada pela faixa: o pedido era da saída e da fila
- Ranking entre pessoas: o placar é de quem está preenchendo, agora

## Critérios de aceite

- [x] Entrada com fornecedor e nota; os dois aparecem no histórico
- [x] Fila com fabricação opcional e conferida
- [x] Sequência, troféu a cada 10 e melhor sequência no fim, em cor da marca
- [x] Desfazer na fila e na saída, com o estoque de volta
- [x] "Registrar e fazer outra" grava e limpa o formulário
- [x] Cadastro vindo da entrada geral volta à busca
- [x] Código interno repetido recusado no campo
