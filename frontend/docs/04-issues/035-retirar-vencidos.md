# Issue 035: Retirar vencidos em lote

**Origem:** levantamento de telas que faltam (09/10). A Home manda "retirar da prateleira", e a baixa era produto a produto.
**Status:** executada e validada

## Referências

Behance, buscas "bulk actions table", "table selection ui" e "batch action dashboard": os termos trazem ações de Photoshop e móveis. O padrão está no estudo de caso sobre tabelas:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Data Table UX/UI](https://www.behance.net/gallery/77856047/Data-Table-UXUI), Sangwook Park | 576 curtidas, 18.718 visualizações | Caixa de seleção em cada linha; "selecionar todos" no cabeçalho; a barra do topo recebe as "ações contextuais" quando há linha marcada |
| [SaaS Data Table](https://www.behance.net/gallery/147041225/SaaS-Data-Table) | 897 curtidas, 40.229 visualizações | Caixa de seleção por linha e ação perigosa ("Delete row") separada e confirmada |

## Faz

- Rota `/estoque/retirar-vencidos`: todos os lotes vencidos, um por linha, do que venceu há mais tempo ao mais recente
- Começam todos marcados (o normal é tirar tudo); "Marcar todos" ou "Desmarcar todos", com o estado parcial no cabeçalho
- Barra do topo: "4 lotes de 5 marcados · 40 unidades · R$ 460 a preço de custo" e "Registrar descarte de 4"; a confirmação aparece na própria barra ("Tirar 4 lotes do estoque? Não dá para desfazer.")
- Balconista: a lista para retirar da prateleira, sem caixas nem descarte, com o aviso de quem registra (regra do banco de 07/10)
- Home: "Retirar da prateleira" leva aqui ("Retirar os 5")
- Contrato: ponto aberto 13, descarte em lote

## Não faz

Itens 46 a 49 em `08-project/ficou-de-fora.md`.
