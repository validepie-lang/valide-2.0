# Issue 075: Importar com vários arquivos, progresso, rascunho, colunas reais, revisão com filtro e cancelar

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 25, 35, 37, 38, 106, 107, 108 e 109). Em 13/10 ele mandou seguir **sem o item 26** (limite de linhas, regra de duplicata e reimportação), que fica pendente até a equipe decidir.
**Status:** executada e validada.
**Depende de:** 074. Contrato v29 para o Pedro (envio em partes, cancelar, desmarcar linhas, filtro da prévia); até lá, dado simulado.

## Referências

| Fonte | Avaliação | O que veio dela |
| --- | --- | --- |
| File Upload UI e Upload Files Design (Behance, issues 032 e 056) | | A área de arrastar "um ou mais arquivos" e cada arquivo numa linha com nome, tamanho e a barra do envio |
| Inventar (Fikri Studio, Behance) | 524 curtidas | "Save as Draft" no meio do cadastro em etapas |
| Data Table UX/UI (Behance, issue 035) | 576 curtidas | Filtros em botões com a contagem e a caixa de marcar em cada linha |
| SaaS Data Table (Behance, issue 029) | 897 curtidas | "Export" de uma lista |
| Primer, Saving e Forms | | Cancelar e descartar dizem o que acontece com o que já foi feito; o que a pessoa escolheu fica guardado |

## A regra que muda (item 106)

Ler o arquivo e reconhecer as colunas continua sendo do servidor (`CLAUDE.md` seção 3). **Só no modo de demonstração**, sem a API ligada, o navegador lê o cabeçalho, as cinco primeiras linhas e a contagem de cada coluna, para o Mapear mostrar as colunas do arquivo de verdade. Com a API ligada, o navegador não lê nada: só envia. Fica escrito em `import-strategy.md`.

## Faz

- **Vários arquivos (37):** até 5 planilhas de uma vez (uma por loja, por exemplo), numa importação só. Precisam ter as mesmas colunas: se não tiverem, a tela diz qual arquivo difere. O que fazer com produto repetido entre elas é a regra do item 26, do servidor
- **Progresso por arquivo (35):** cada arquivo numa linha com nome, tamanho e a barra, que anda conforme as partes chegam ao servidor
- **Acima de 4 MB (109):** o envio vai em partes de 1 MB, então cabe até 20 MB no total. Sem cookie entre domínios: passa pelo servidor do Next como hoje
- **Colunas reais no modo de demonstração (106):** CSV (com ponto e vírgula, vírgula ou tabulação, em UTF-8 ou no formato do Excel antigo) e XLSX, sem biblioteca nova. O Mapear sugere o campo pelo nome da coluna. Arquivo que o navegador não consegue ler segue com a importação de exemplo e diz isso
- **Revisão com filtro e desmarcar (25):** "Todas", "Com aviso", "Com erro" e "Desmarcadas", com a contagem; caixa de marcar em cada linha que pode entrar (linha com erro já fica de fora). O botão final conta só as marcadas. Fica guardado no servidor, então vale para o rascunho
- **Salvar rascunho (38):** no Mapear e na Revisão. A importação fica parada onde estava, e a primeira tela mostra "Importação não terminada" com Continuar e Descartar
- **Baixar as linhas com problema (107):** planilha com linha, produto, código e o problema, na Revisão e no Resultado
- **Cancelar (108):** durante o envio (para e descarta), no Mapear e na Revisão ("Descartar importação", com confirmação), e enquanto importa ("Cancelar importação": o servidor desfaz, nada entra). O Resultado diz "Importação cancelada"

## Não faz

- **Item 26** (limite de linhas, regra de duplicata, reimportação): pendente com a equipe. A revisão continua mostrando a decisão "Criar" ou "Atualizar" que o servidor tomar; no modo de demonstração com arquivo de verdade, toda linha aparece como nova, e a tela diz que a regra está em decisão
- Ler o arquivo no navegador com a API ligada

## Critérios de aceite

- [x] Dois CSV com as mesmas colunas sobem juntos, cada um com a sua barra; colunas diferentes são recusadas dizendo qual
- [x] Arquivo de 6 MB sobe em partes; acima de 20 MB, recusado antes de enviar
- [x] No modo de demonstração, o Mapear mostra as colunas e as linhas do arquivo enviado (CSV e XLSX)
- [x] Filtros e desmarcar na revisão, com o botão contando as marcadas; desmarcadas continuam depois de recarregar
- [x] Rascunho: sair e voltar pela primeira tela continua de onde parou; descartar some com ele
- [x] A planilha das linhas com problema baixa com acentos certos
- [x] Cancelar no envio, no rascunho e durante a importação
- [x] 360 e 1440, claro e escuro, teclado
