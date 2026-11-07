# Validação: Issue 056 - Importação envia, mapeia e confirma

**Data:** 10/10/2026
**Resultado:** passou, com o servidor simulado

Conferido no Chrome por script, escolhendo arquivos de verdade no seletor (`DOM.setFileInputFiles`).

| Critério | Resultado |
| --- | --- |
| PDF: "Este arquivo não é CSV nem Excel (XLSX). No seu sistema, exporte a lista de produtos para Excel e tente de novo." | ok |
| CSV de 5,3 MB: "Este arquivo tem 5,3 MB, e o envio aceita até 4 MB. Divida a lista em duas planilhas…" | ok |
| CSV de 3 MB (acima do 1 MB padrão do Next): envia e vai ao Mapear | ok |
| CSV pequeno: vai a `?passo=mapeamento&importacao=imp_7fa2` | ok |
| Mapear sem a coluna do nome e com Custo de aquisição em duas colunas: "Escolha a coluna de nome do produto…" e, em VLR_VENDA, "Custo de aquisição já está na coluna VLR_CUSTO…", com o foco nela | ok |
| Uma coluna como Data de validade: o aviso "não traz lote nem validade" some | ok |
| Mapeamento certo: vai à revisão com a mesma importação | ok |
| "Importar 800 produtos": vai ao resultado, "Importação concluída" | ok |
| Celular (360): origem e mapeamento com erro sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (113) e `next build` | passam |

## Não conferido na tela

- "Importando…" e "A importação não terminou": o simulado não guarda a importação entre uma página e outra, então o resultado sempre chega pronto. Os dois estados dependem do `status` que o servidor do Pedro devolver
- As colunas do arquivo escolhido: no simulado, o Mapear mostra sempre as colunas da importação de demonstração (item 106)

Capturas em `telas-novas/056/`.
