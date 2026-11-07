# Issue 071: O modo de demonstração guarda o que foi gravado

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 99 e 103). Em 12/10 ele aprovou o caminho recomendado ("pode seguir"): um registro das últimas ações num cookie do navegador, aplicado aos dados de demonstração.
**Status:** executada e validada.
**Depende de:** 070. Nada do Pedro: com a API ligada, o registro não é lido nem escrito.

## Referências

Não há tela nova nem referência do Behance: é comportamento. Base: o padrão do próprio projeto (camada de serviço que responde como o servidor, issue 053) e o Primer, Saving (o que a tela diz que salvou tem de aparecer salvo).

## Por que um cookie

O dado de demonstração é montado no servidor do Next a cada pedido, e na Vercel cada pedido pode cair numa máquina diferente: guardar na memória do servidor perderia o que foi feito. O cookie vai junto em todo pedido, então o servidor monta a tela já com as ações aplicadas. Fica só neste navegador, como o item 99 pede, e não cria backend (`CLAUDE.md` seção 3).

Limite: um cookie cabe uns 4 KB. O registro guarda as ações mais recentes e descarta as mais antigas quando passa de 3,5 KB (umas 15 a 25 ações, conforme o tamanho).

## Faz

- **Registro (99):** cadastrar e editar produto, informar lote (fila e entrada), registrar saída, retirar vencidos em lote, mover de pasta e escrever nota passam a ficar. Estoque, produto, Início, calendário, movimentações e notas leem o catálogo com o registro aplicado
- **Abrir o produto cadastrado (103):** depois de cadastrar, a tela abre a página do produto novo, com "Produto cadastrado. Cadastrar outro"
- **Apagar:** em Configurações > Meu perfil, a seção "Demonstração" diz quantas ações estão guardadas e tem "Apagar o que a demonstração guardou". Só aparece com a API desligada
- Regra mudada no `ficou-de-fora` (item 99): vale só no modo de demonstração; com a API ligada, quem guarda é o servidor

## Não faz

- Pastas, pessoas, configurações e avisos lidos: continuam respondendo sem guardar. O que mais se mostra numa demonstração é o estoque
- Perdas e avisos do sino recalculados com o registro: são montados de outra base de exemplo
- Foto do produto: não cabe num cookie

## Critérios de aceite

- [x] Cadastrar produto abre a página dele, e ele aparece no Estoque e no Início depois de recarregar
- [x] Lote informado, saída, retirada em lote, mudança de pasta e nota continuam depois de recarregar
- [x] Ação antiga sai quando o registro passa do limite, sem quebrar a tela
- [x] Cookie adulterado é ignorado
- [x] "Apagar o que a demonstração guardou" volta tudo ao exemplo original
