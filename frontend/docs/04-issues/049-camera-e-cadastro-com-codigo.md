# Issue 049: Ler o código pela câmera e cadastrar com o código já preenchido

**Origem:** itens 20 e 82 de `ficou-de-fora.md`, liberados pelo Marcus em 10/10.
**Status:** executada e validada

## Referências

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), "Scan Product Barcode" | 524 curtidas, 15.571 visualizações | A imagem da câmera com a moldura no meio, o resto escurecido e "Scanning…" em cima |
| [Mobile App For Inventory](https://www.behance.net/gallery/192255499/Mobile-App-For-Inventory-UIUX), "Scan QR" | 769 curtidas, 10.786 visualizações | Ler e buscar são o mesmo passo: leu, abre o item |

## Faz

- "Ler pela câmera" ao lado de "Buscar produto" na entrada geral. Abre a janela com a câmera de trás, a moldura branca (verde é cor de validade) e "Lendo o código…"; leu, fecha e abre o produto como se tivesse bipado
- Usa o leitor do próprio navegador (`BarcodeDetector`), sem biblioteca nova. Onde ele não existe (Safari, Firefox) o botão não aparece; câmera negada explica como liberar
- "Digitar o número" fecha a janela e volta ao campo
- Sem resultado para um número de código de barras: "Cadastrar produto" abre o cadastro com o número já no campo (`/estoque/novo?codigo=`). Texto no lugar do número é ignorado

## Não faz

Item 94: câmera no iPhone e no Firefox (precisaria de biblioteca).
