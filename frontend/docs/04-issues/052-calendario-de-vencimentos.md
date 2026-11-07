# Issue 052: Calendário de vencimentos

**Origem:** levantamento de telas que faltam (10/10, item F), liberado pelo Marcus em 10/10 ("O calendário de vencimentos (F): pode fazer"). Eu tinha recomendado esperar; ele decidiu fazer.
**Status:** executada e validada. **Depende do Pedro:** a lista de lotes por data não existe no contrato; a tela usa os lotes simulados e o endpoint vai como proposta (v17).

## Referências

Behance, buscas "calendar dashboard", "schedule calendar ui" e "calendar web app", por apreciações, todos os tempos. O Restaurant Inventory, que motivou a ideia no levantamento, olhado de perto não tem calendário: tem a lista de lotes com a data e "5 days". Os calendários bem avaliados são de agenda:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Kalee, Appointment Scheduling Platform](https://www.behance.net/gallery/162720875/Kalee-Appointment-Scheduling-Platform-UXUI-Design) | 2.177 curtidas, 23.539 visualizações | O mês em grade à esquerda, com o seletor do mês em cima e o dia escolhido destacado; a agenda do dia escolhido ao lado; dias de fora do mês apagados |
| [Restaurant Inventory Management Software (Ronas IT)](https://www.behance.net/gallery/225924859/Restaurant-Inventory-Management-Software-Ronas-IT) | 293 curtidas, 3.467 visualizações | Cada lote numa linha com a data e a distância ("5 days") |

## Faz

- Terceira aba do Estoque, "Calendário" (`/estoque/calendario`), ao lado de Produtos e Movimentações
- O mês em grade, de domingo a sábado (como o calendário brasileiro). Em cada dia, quantos lotes vencem, com a barrinha do estado: vermelho para Vencido, âmbar para A vencer, cinza para No prazo. Status com cor, número e o nome no leitor de tela, nunca só cor
- Mês anterior e seguinte no cabeçalho, com "Hoje" para voltar; o mês e o dia moram no endereço (`?mes=2026-10&dia=2026-10-14`)
- Ao lado, os lotes do dia escolhido: produto, lote, quantidade e o selo; cada um leva ao produto. Dia sem lote diz isso
- No celular, a grade fica compacta (só o ponto) e a lista do dia vem embaixo
- Contrato v17, proposto: `GET /lots?expiresFrom=&expiresTo=`

## Não faz

Itens 95 a 97 em `08-project/ficou-de-fora.md`.
