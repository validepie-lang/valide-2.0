# Issue 037: Avisos e estoque abaixo do mínimo

**Origem:** levantamento de telas que faltam (09/10). Os avisos só existiam no sino, e o estoque mínimo (regra 7) só aparecia produto a produto.
**Status:** executada e validada

## Referências

Behance, buscas "notification center dashboard", "notification ui", "notifications design", "notifications page web app" e "low stock alert", por apreciações, todos os tempos. Os termos de aviso trazem toasts, popups e apps de outro assunto; a página de avisos e o estoque baixo estão em painéis:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [HR Management Dashboard](https://www.behance.net/gallery/185372253/HR-Management-Dashboard-Project), tela "Notification" | 1.074 curtidas, 13.775 visualizações | Título com "Mark all as read" à direita; cada aviso com título, texto, tempo e o ponto de não lido; a ação logo abaixo do texto |
| Gyle, tabela "Stock Alert" (issue 027) | 690 curtidas | A lista dos produtos em falta, com o nome, a quantidade e o mínimo |

## Faz

- Rota `/avisos`: todos os avisos à esquerda, "Abaixo do mínimo" à direita (no celular, um depois do outro)
- Avisos: "Marcar todos como lidos", fundo leve e ponto nos não lidos, "Abrir" quando o aviso tem destino
- Abaixo do mínimo: do mais em falta ao menos, com quantidade, mínimo e "faltam N", sem cor de status
- Sino: "Ver todos os avisos" no rodapé do painel
- Avisos simulados tirados do catálogo: o texto não contradiz mais o estoque
- Contrato v13: `GET /products?belowMin=true`, proposto (ponto 15)

## Não faz

Itens 56 a 61 em `08-project/ficou-de-fora.md`.
