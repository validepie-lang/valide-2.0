# Issue 074: Entrada geral com a lista do conferido, abertura direta, bip e câmera em todo navegador

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 81, 83, 84 e 94). Em 13/10 ele mandou seguir ("pode seguir").
**Status:** executada e validada.
**Depende de:** 073 (`to` no `GET /movements`). Nada novo do Pedro.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| [Point of Sale App](https://www.behance.net/gallery/121326943/Point-of-Sale-App-UIUX-Design) (Ronas IT, Behance) | 2,7 mil curtidas, 54,3 mil visualizações | A coluna do pedido ao lado do catálogo: o que já foi pego fica à vista enquanto se busca o próximo |
| [Zapper QR Code Scanner](https://www.behance.net/gallery/20101193/Zapper-QR-Code-Scanner) (Behance) | 653 curtidas, 11 mil visualizações | O histórico das leituras, com o código e a hora |
| Inventar e Mobile App For Inventory (Behance, issue 049) | 524 curtidas | A tela de leitura com a moldura, que continua a mesma |
| O leitor de código do caixa | | O bip: um agudo quando leu e achou, dois graves quando não achou. O Behance não mostra som; a convenção é a do aparelho que a farmácia já usa |

## Faz

- **Conferido hoje (81):** ao lado da busca, as entradas de hoje feitas por quem está usando, da mais recente: produto, lote, hora e quantidade, com o total e "Ver em Movimentações". Vem do histórico (`GET /movements?type=in&userId=&from=&to=`), então continua depois de recarregar e em outro computador. No celular, embaixo da busca
- **Abrir com um resultado só (83):** a busca pelo nome que acha um produto só abre a entrada dele, como o código exato já fazia. A tela do produto diz "Único produto para “omeprazol”" e tem "Trocar produto"
- **Bip e vibração (84):** achou o produto pelo código, pelo nome ou pela câmera: um bip agudo e uma vibração curta; não achou: dois bips graves. "Bip ao ler: ligado/desligado" embaixo da busca, guardado neste aparelho. O som é gerado pelo navegador, sem arquivo, e só toca depois de um gesto nesta aba (o navegador exige). Para isso a busca troca de tela sem recarregar a página
- **Câmera em todo navegador (94):** onde o navegador não lê código sozinho (Safari no iPhone, Firefox), a câmera usa o ZXing (`@zxing/browser`, o leitor só de códigos lineares), carregado só quando a câmera abre. O botão aparece em todo navegador com câmera

## Não faz

- Bip na saída geral: a saída lida pelo código já abre a tela do produto; fica para quando pedirem
- Desfazer pela lista do conferido: a entrada se corrige em Movimentações (issue 073)
- Ler QR Code ou Data Matrix: a farmácia bipa o código de barras da caixa

## Critérios de aceite

- [x] Conferido hoje mostra as entradas de quem usa, depois de recarregar também
- [x] Nome com um resultado abre a entrada e diz que foi o único; com vários, a lista
- [x] Bip e vibração ao achar e ao não achar, e nenhum ao recarregar; desligar vale neste aparelho
- [x] Câmera lê um código pelo ZXing num navegador sem leitor próprio, e a biblioteca só carrega ao abrir a câmera
- [x] 360 e 1440, claro e escuro, teclado
