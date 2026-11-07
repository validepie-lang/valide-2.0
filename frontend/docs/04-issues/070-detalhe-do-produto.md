# Issue 070: Detalhe do produto com notas, foto, estoque útil, alterações e quem edita

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 12, 13, 14, 15 e 18). Item 18 decidido em 12/10: administrador e farmacêutico editam, o balconista só vê ("concordo").
**Status:** executada e validada.
**Depende de:** 069. Contrato v26 para o Pedro (notas, foto, alterações, 403 do balconista); até lá, dado simulado.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| Inventar (Fikri Studio, Behance, issue 030) | 524 curtidas | Aba "Notes" ao lado de visão geral e histórico; foto do produto no alto da coluna da direita; quantidade por depósito com aviso de "low"; registro de quem mudou o quê |
| Ecommerce Product Details (Behance, origem do item 13) | | Foto em 4 por 3 com troca e remoção logo abaixo |
| Primer, Saving e Forms | | Nota e foto gravam com "Salvando…", a recusa fica no lugar com o que foi feito, a confirmação aparece onde a pessoa está |

## Faz

- **Notas (12):** aba "Notas (N)" com a lista (quem, quando, o texto) e o campo "Nova nota", até 500 letras. Qualquer cargo escreve: o balconista é quem vê a caixa amassada. `GET` e `POST /products/:id/notes`
- **Foto (13):** cartão no alto da coluna da direita, em 4 por 3. Quem edita envia, troca e remove (JPG, PNG ou WebP até 2 MB, conferido antes de enviar). Sem foto, o balconista não vê o cartão. `POST` e `DELETE /products/:id/photo`, `Product.photoUrl`
- **Estoque útil por lote (14):** no cartão Estoque, quando o total passa do mínimo mas, tirando os lotes vencidos, fica abaixo: "Sem o lote vencido TS9126, ficam 8 un: abaixo do mínimo de 12." É o "low" do Inventar com o que importa no Valide: o vencido vai sair da prateleira e não conta para o mínimo
- **Alterações do cadastro (15):** na aba Histórico, embaixo das movimentações, "Alterações do cadastro": "Camila Duarte mudou o preço de venda de R$ 21,90 para R$ 23,40", com a data. `GET /products/:id/changes`
- **Quem edita (18):** administrador e farmacêutico. O balconista não vê "Editar produto", nem "Mover de pasta" no Estoque, e quem abrir `/editar` vê "sem permissão". O servidor recusa com 403
- `estoque/[id]/page.tsx` (214 linhas) dividido em visão geral e histórico

## Não faz

- Foto na tabela do Estoque: a linha fica mais alta e a tabela é para conferir validade
- Editar ou apagar nota: nota é registro, como a movimentação
- Aviso de lote com pouca quantidade só por ser pequeno: sem relação com o mínimo, todo lote no fim acenderia

## Critérios de aceite

- [x] Nota grava, aparece no topo da lista e recusa vazia ou longa
- [x] Foto: envio, troca e remoção para quem edita; tipo e tamanho conferidos antes de enviar
- [x] Aviso do estoque útil só quando os vencidos derrubam o produto para baixo do mínimo
- [x] Alterações com valores formatados (dinheiro, unidade, pasta)
- [x] Balconista (`?cargo=balconista`): sem editar, sem mover, sem enviar foto; `/editar` sem permissão
- [x] 360 e 1440, claro e escuro, teclado
