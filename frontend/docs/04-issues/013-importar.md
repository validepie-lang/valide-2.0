# Issue 013: Importar

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seção 5.5
**Status:** executada e validada
**Depende de:** 006, 007, 008
**Etapa da esteira:** 5 de 12

---

## Objetivo

A importação é a porta de entrada do produto: é por ela que o cliente traz o catálogo que já tem. Hoje cada passo tem dois ou três cards disputando atenção, a etapa atual usa a mesma pílula escura do chip de filtro, o passo Origem tem "Escolher arquivo" como botão secundário (a única ação do passo) e um card "Como funciona" que repete as etapas logo acima dele, e a revisão e o resultado usam amarelo e verde fora de validade.

## Escopo

### Faz

- **Etapas** com número e texto (seção 4.6): a atual em negrito com sublinhado de 2px, a concluída com ✓. Só as concluídas são links: pular para uma etapa futura levava a uma tela com dado que o usuário ainda não enviou. No celular continua "Etapa 1 de 4" com barra
- **Origem** em uma coluna: título, área de arrastar com **"Escolher arquivo" primário**, "Onde encontrar essa lista no seu sistema" como texto sem caixa, e "Prefere cadastrar um produto de cada vez?" como link abaixo. **Sai** o card "Como funciona" e o card "Cadastrar manualmente" vira esse link. Sai o ícone em quadrado
- **Mapear** sem mudança de estrutura: números do resumo com algarismos tabulares
- **Revisar**: três `Metric` em linha, sem card, número nunca colorido. Linha com erro: ícone e texto em `--error`, **sem fundo na linha**. Linha com aviso: ícone e texto neutros. "Ignorar" sem risco e sem `fg-disabled`. Estoque com unidade. **No celular a tabela vira lista** (hoje rola de lado e esconde a coluna Ação)
- **Resultado**: "Importação concluída" com ícone neutro, sem quadrado verde; linhas que ficaram de fora com ícone neutro; "Agora informe as validades" sem degradê e sem sombra, como seção com título, texto e botão primário; "Importações anteriores" como lista simples, sem card, com "Falhou" em texto neutro com ícone
- Rodapé de botões no celular: primário primeiro, os dois na largura inteira
- Esqueleto de carregamento novo

### Corrige texto que prometia o que não existe

- "Desmarque qualquer linha que não deva entrar": a revisão não tem caixa de marcar. Sai a frase. Excluir linha antes de importar depende do contrato (a prévia teria de aceitar a lista de linhas)
- "Até 5.000 linhas por envio": o limite ainda não foi decidido (pauta 2.3). Sai o número; volta quando o backend fixar
- "Não entram até você resolver": não há como resolver nesta tela. Vira "Ficam de fora desta importação"
- A barra de progresso do resultado sai: numa importação que terminou, uma barra em 98% parece travada. O "800 de 814" continua no texto

### Não faz

- Não muda o fluxo, os passos nem o mapeamento
- Não decide limite de linhas, regra de duplicata nem reimportação (pauta 2.1 a 2.3)

## Critérios de aceite

- [ ] Uma ação primária por passo: Escolher arquivo, Continuar para a revisão, Importar N produtos, Começar a informar validades
- [ ] Nenhum amarelo ou verde na importação; vermelho só na linha que não entra
- [ ] Nenhuma linha com fundo colorido; nenhum texto com informação em `fg-disabled`
- [ ] Etapa atual com sublinhado, distinta do chip de filtro e da aba
- [ ] Revisão em 360 sem rolagem horizontal, com a ação de cada linha visível
- [ ] Claro e escuro, 1440, 1366, 768, 360
- [ ] `npm test`, `tsc`, lint
