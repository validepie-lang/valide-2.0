# Validação 074: Entrada geral com a lista do conferido, abertura direta, bip e câmera em todo navegador

**Data:** 13/10/2026
**Como:** Chrome headless por script (`cdp074.mjs`, um passo por vez), em 1440 e em 360 com tema escuro, começando sem cookies. Os tons tocados e as vibrações foram contados por um gancho no navegador, sem mexer no app. A câmera foi testada com um vídeo falso de um EAN-13 do catálogo (`7891000000007`, a Dipirona), gerado por script.
**Capturas:** `telas-novas/074/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Código exato | Digitado como o leitor do caixa (teclas e Enter): abre a Dipirona (`?produto=p1&lido=…`), um bip de 1.760 Hz e vibração de 40 ms |
| Nome com um resultado (83) | "omeprazol" abre o Omeprazol 20mg com "Único produto para “omeprazol”" e "Trocar produto"; bip |
| Não achou | "xyzqwk": a tela de nenhum produto, dois tons graves (330 e 247 Hz) e vibração em três toques |
| Vários resultados | "dipirona": lista com 2, nenhum som |
| Recarregar | Abrir de novo o endereço do produto lido não bipa |
| Bip desligado (84) | "Bip ao ler: desligado" fica guardado (`valide_bip=off`), a leitura não toca nem vibra, e continua desligado depois de recarregar |
| Conferido hoje (81) | Sem entradas: a frase de vazio. Duas entradas pela busca (CX101 na Dipirona, CX102 no Omeprazol): "2 entradas", do mais recente, com lote, hora e "+12 un"; continua igual depois de recarregar |
| Câmera com o leitor do Chrome | Leu o código e abriu a Dipirona |
| Câmera sem leitor, como no Safari (94) | Com o `BarcodeDetector` apagado da página: o botão aparece, o ZXing lê o mesmo código, abre a Dipirona e bipa (com clique de mouse; clique por script não libera som, como deve ser) |
| Biblioteca só ao abrir (94) | No build de produção: dos 13 scripts da tela, nenhum tem o ZXing (só o componente da câmera, 10 KB); ao abrir a câmera chega um de 479 KB (124 KB compactado) com ele |
| Celular | 360 escuro: largura 360; busca, câmera e "Bip ao ler" um embaixo do outro; o conferido embaixo da busca |
| `tsc`, lint, testes | Sem erro; 196 testes passam |

## Defeito achado no teste e corrigido

- O bip tocava duas vezes no modo de desenvolvimento (o React monta a tela duas vezes de propósito). A mesma leitura agora só toca uma vez, o que também protege contra a tela montar de novo em produção
