# Issue 032: Importar a partir de referências do Behance

**Pedido do Marcus (09/10):** construir o sistema a partir de referências bem avaliadas do Behance.
**Status:** executada e validada

## Referências

Behance, buscas "file upload ui", "import data csv", "data import wizard", "column mapping" e "multi step form", por apreciações, todos os tempos. Importação e mapeamento de colunas não têm projeto (as buscas trazem visualização de dados e mapas). Etapas e envio de arquivo têm:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Multi-Step Form](https://www.behance.net/gallery/119278199/Multi-Step-Form) | 124 curtidas, 8.908 visualizações | Etapas na vertical, à esquerda, com número em círculo (a atual cheia); o formulário à direita; "Back" em texto e "Next Step" em botão, no fim |
| [Inventar](https://www.behance.net/gallery/186729165/Inventar-inventory-and-Warehouse-Management-system), cadastro de produto | 524 curtidas, 15.569 visualizações | O mesmo arranjo, com ✓ nas etapas feitas e a ação no rodapé |
| [File Upload UI](https://www.behance.net/gallery/79882483/File-Upload-UI) | 46 curtidas, 7.062 visualizações | Área tracejada com "arraste ou escolha" e os formatos aceitos embaixo |
| [Upload Files Design](https://www.behance.net/gallery/97389819/Upload-Files-Design-Freebie) | 46 curtidas, 4.666 visualizações | Depois de escolher, o arquivo numa linha: ícone, nome, tamanho |

## Faz

- Etapas na vertical à esquerda a partir de 1024 (círculo numerado, ✓ nas feitas, uma linha de apoio por etapa, fio ligando os círculos); abaixo disso, o texto e a barra de antes
- Mapear: o arquivo numa linha no topo (nome, linhas, colunas reconhecidas, "Trocar arquivo"), no lugar do card "Resumo do arquivo" à direita; o aviso de "sem lote nem validade" dentro do passo; "Voltar" em texto e "Continuar para a revisão" no fim
- Revisar: "Voltar" em texto, como no Mapear
- O campo de seleção do Mapear ocupa a linha inteira no celular (item 27 do que ficou de fora)
- Esqueleto na forma nova

## Não faz

Itens 35 a 38 em `08-project/ficou-de-fora.md`: progresso do envio, tamanho máximo escrito, vários arquivos de uma vez, salvar rascunho.
