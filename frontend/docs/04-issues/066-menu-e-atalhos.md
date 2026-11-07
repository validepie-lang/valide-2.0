# Issue 066: Menu com Movimentações, Calendário e Avisos, Ajuda no celular, sombra do botão principal

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 80, 61, 97, 89 e 32), depois de ver o protótipo no localhost.
**Status:** executada e validada.
**Depende de:** nenhuma. Só front.

## Referências

| Projeto | Avaliação | O que veio dele |
| --- | --- | --- |
| [Core® – Dashboard Builder](https://www.behance.net/gallery/123745003/Core-Dashboard-Builder) | 2.111 curtidas, 37.677 visualizações (o mais bem avaliado em "sidebar navigation") | Menu de uma coluna com seis a oito destinos de trabalho no alto; "Help & getting started" e a escolha de tema separados embaixo. É a mesma divisão do nosso trilho |
| [Dashboard side bar components](https://www.behance.net/gallery/190370055/Dashboard-side-bar-components) | busca "sidebar navigation" | Versão estreita só com ícone e versão com ícone e rótulo embaixo. Com mais destinos, o item fica mais baixo (ícone menor e menos respiro), e não o trilho mais largo |
| Inventar (Fikri Studio, 524 curtidas, issue 041) | | Movimentações e calendário como abas do Estoque. As abas continuam; o menu passa a ser um atalho para elas |

## Faz

- **Trilho lateral (desktop):** Início, Estoque, Validades, Movimentos, Calendário, Avisos, Perdas, Ajustes ("Movimentos" porque "Movimentações" passa da largura do trilho; a aba e o título continuam "Movimentações"). O item mais específico acende (em `/estoque/movimentacoes` acende Movimentos, não Estoque)
- **Item mais baixo** para caberem oito destinos, a Ajuda e o tema em 800px de altura (notebook de 1440 por 900 com a barra do navegador). Abaixo disso, a lista rola dentro do trilho; Ajuda e tema ficam sempre visíveis
- **Barra de baixo do celular:** Início, Estoque, Validades, Perdas, Ajustes e Ajuda (seis itens; Movimentações e Calendário seguem nas abas do Estoque, Avisos no sino)
- **Sombra do botão principal (32):** a sombra curta do Tailwind (`shadow-xs`, preta e igual nos dois temas) vira o token `shadow-button`, com o matiz da tinta no claro e mais forte no escuro, como as outras sombras (design-system seção 11)

## Não faz

- Contador de não lidos no item Avisos: o Core tem número no item, mas o sino já mostra a contagem no topo da tela; dois contadores do mesmo dado brigariam
- Grupos com título no menu ("Statistics" no Dashboard side bar components): com oito itens curtos, o título ocupa a altura que falta
- Tirar Movimentações e Calendário das abas do Estoque: quem já está no Estoque continua trocando por aba

## Critérios de aceite

- [x] Oito itens no trilho, cada um com ícone e rótulo, e só um acende por tela
- [x] Em 1440 por 800 o trilho mostra tudo sem rolar; em 1440 por 640 a lista rola e Ajuda e tema continuam visíveis
- [x] Seis itens na barra do celular em 360, com alvo de toque de 44px ou mais e rótulo inteiro
- [x] Botão principal com `shadow-button` nos dois temas; o `shadow-xs` fica só na bolinha do interruptor, que não é botão
- [x] Teclado: Tab percorre o trilho na ordem visual, com o foco visível
