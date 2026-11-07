# Validação 072: Entrada, saída e validades pendentes

**Data:** 13/10/2026
**Como:** Chrome headless por script (`cdp072.mjs`, um passo por vez), em 1440 e em 360 com tema escuro, começando sem cookies (modo de demonstração).
**Capturas:** `telas-novas/072/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Fornecedor e nota (22) | Entrada do lote NF7788 no Dorflex com "Distribuidora Santa Cruz" e nota 000123456: a tela volta ao produto com a faixa, e o histórico mostra "Entrada · Distribuidora Santa Cruz · NF 000123456 · +30 un" |
| Fabricação na fila (100) | Fabricação depois da validade é recusada ("A data de validade não pode ser anterior à data de fabricação."); corrigida, salva |
| Placar (24) | Dois salvos: "Produto 3 de 19 · 2 seguidas". Dez salvos: troféu, "Muito bem! 10 seguidas." na linha do salvo. Fila inteira com o 3º pulado: "Melhor sequência: 16 seguidas" no fim. Pílula e linha em `primary-soft`, ícones em `accent`; sem verde, vermelho ou animação |
| Desfazer na fila (98) | "Desfazer" no 2º salvo: volta para "Produto 2 de 19", o lote digitado (FX2) de volta no campo, foco no lote, sequência volta a 1 e "Desfeito. O produto voltou com o que você digitou." |
| Registrar outra (101) | "Registrar e fazer outra" com 2 un: fica em `/estoque/p1/baixa`, com "Saída de 2 un do lote L2291 registrada. Desfazer" em cima e a quantidade vazia |
| Desfazer a saída (102) | Saída de 3 un (74 para 71), "Desfazer" na faixa: vai para `?desfeito=saida`, "Saída desfeita. O estoque voltou ao que era antes dela." e o estoque volta a 74 un |
| Voltar à entrada geral (104) | `/estoque/novo?codigo=7899999000017`: o código vem preenchido; cadastrado, volta para `/estoque/entrada?registrado=cadastro&de=…` com "Soro Fisiológico 500ml Teste cadastrado. Ver o produto" e o foco na busca |
| Código interno repetido (105) | MED-1047 (do Dorflex) na Dipirona: "O código interno MED-1047 já é do produto Dorflex, 36 comprimidos. Use outro ou deixe em branco." no campo, com o foco nele |
| Celular | 360 escuro: fila e entrada sem rolagem lateral (largura 360); a linha do salvo quebra com o ícone à esquerda e "Desfazer" no fim da frase |
| `tsc`, lint, testes | Sem erro; 180 testes passam (4 novos do placar, 3 da origem e da fabricação) |

## Defeitos achados no teste e corrigidos

- **A fila pulava um produto a cada salvo** (vinha da 071): gravar põe a ação no cookie da demonstração, o Next recarrega a página e a lista chegava sem o produto salvo, enquanto a posição avançava. Depois de dois salvos aparecia "Produto 3 de 17". A fila agora é a da hora em que a tela abriu
- **O código interno repetido não aparecia**: o campo nunca recebeu mensagem de erro. Passou a receber (`product-fields.tsx`)
- **O histórico do produto não mostrava observação nenhuma** (nem a justificativa da saída). Passou a mostrar embaixo do tipo, como a tela Movimentações (`movements-table.tsx`)
- No celular, o ícone do salvo ficava sozinho numa linha; e no fim da fila a linha encostava no cartão

## Observação

O Chrome por script travou várias vezes ao abrir uma tela depois de outro roteiro: eram processos antigos do Chrome presos. Com cada passo numa porta nova e os processos encerrados entre um e outro, todos os passos rodaram. Com `curl`, as mesmas telas respondem em 0,1 s.
