# Issue 031: Validades pendentes a partir de referências do Behance

**Pedido do Marcus (09/10):** construir o sistema a partir de referências bem avaliadas do Behance.
**Status:** executada e validada

## Pesquisa

A fila é um fluxo de um item por vez: preencher ou pular, e o próximo. O Behance não tem projeto bem avaliado de fila de preenchimento: as buscas "stock count app", "inventory audit", "task queue dashboard", "content moderation dashboard", "data annotation tool" e "review queue" trazem marca, quadro de tarefas e visualização de dados.

O padrão de interação mais próximo, e bem avaliado, é o de app de quiz: uma pergunta por vez, o progresso no topo, responder ou pular, e um resultado no fim.

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Quizai, Quiz/Learning iOS Mobile App UI](https://www.behance.net/gallery/118469217/Quizai-QuizLearning-iOS-Mobile-App-UI) | 886 curtidas, 27.801 visualizações | (1) Progresso no topo da pergunta, com a posição. (2) Tela "Instant Result": a conclusão em uma frase e três números lado a lado (perguntas, certas, erradas), com a barra de progresso |
| [English Learning App redesign](https://www.behance.net/gallery/103934771/English-Learning-App-redesign) | 2.387 curtidas, 32.037 visualizações | Confirma o progresso em barra cheia no topo de cada exercício |

Continua de antes, porque já era o padrão: "A seguir" em card com "Ver a fila inteira" (como "Still Not Arrived" e "See All" do Vault, issue 027); Enter salva e avança; o foco volta ao primeiro campo.

## Faz

- Progresso dentro do cartão do produto, no topo: "Produto 6 de 18" à esquerda, "5 preenchidos · R$ 5.345 ainda parados" à direita, barra de largura inteira embaixo. Antes era uma linha solta sob o título da página
- Tela de fim: "Na fila", "Preenchidos" e "Para depois", lado a lado, com a barra de preenchidos. Sem cor de status: verde é No prazo, não "deu certo"
- Título da tela de fim em `font-display` (direção A)
- Esqueleto com o progresso dentro do cartão

## Não faz

- Placar, troféu, "Great job" e cor por acerto (Quizai): o vocabulário do Valide é sóbrio, e verde e vermelho são de validade
