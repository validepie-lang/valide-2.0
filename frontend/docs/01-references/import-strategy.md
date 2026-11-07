# import-strategy.md: Estratégia de Entrada de Dados

**Decisão da equipe (16/09/2026):** o Valide entra no cliente puxando o catálogo do sistema que a farmácia já usa, em vez de exigir cadastro manual produto a produto. O cadastro manual continua existindo, mas deixa de ser o caminho principal.

> **Atualização de 17/09/2026.** Na reunião a equipe concluiu que a integração por API com o sistema da farmácia é inviável para o piloto: depender de acesso de fornecedor não cabe no prazo. **O piloto entra com duas origens, planilha e cadastro manual.** A integração vira projeto futuro, para depois do piloto se provar.
>
> Isso não foi uma virada de escopo, foi o **plano de retorno da seção 7 sendo acionado**, exatamente como este documento previu na seção 4. Nenhuma tela precisou ser refeita. O que saiu foi a tela de integrações e o terceiro card das telas de origem.

Este documento registra a decisão, o que ela muda no frontend, e os riscos que ela cria.

---

## 1. Por que a decisão é boa

Cadastrar 800 produtos à mão é o motivo número um de um sistema de estoque ser abandonado na primeira semana. Se o cliente precisa trabalhar dois dias antes de ver valor, ele não chega lá. Puxar o catálogo pronto resolve isso e vira argumento de venda direto: o Eduardo pode dizer "seu estoque aparece no Valide em minutos, sem digitar nada".

---

## 2. O ponto que muda o desenho do produto

Aqui está a parte que a equipe precisa enxergar antes de construir.

O sistema que a farmácia já usa tem **produto**: nome, código de barras, preço, quantidade. Mas é muito provável que **não tenha lote nem data de validade** por item.

A razão é simples e vem do próprio diagnóstico do projeto: a farmácia controla validade em papel. Se o sistema dela já controlasse validade por lote, o problema que o Valide resolve não existiria. O controle está no papel exatamente porque o sistema não faz isso.

**Consequência:** a importação traz o catálogo, não a validade. Depois de importar, o cliente ainda precisa informar lote e validade. A diferença é que informar validade de um produto que já existe é rápido, enquanto cadastrar o produto inteiro do zero é o que ninguém faz.

Isso não enfraquece a ideia. Pelo contrário, define com clareza o que o Valide é: **a camada de validade em cima do estoque que a farmácia já tem.**

E gera o momento mais importante da experiência do produto, descrito na seção 5.

---

## 3. Origens, um fluxo só

O frontend não pode ficar refém de qual é a origem. Construímos **uma tela de importação** que aceita mais de uma e converge para o mesmo fluxo de revisão:

| Origem | O que é | Situação |
| --- | --- | --- |
| **Arquivo** | Planilha CSV ou Excel exportada do sistema atual | **No piloto.** Funciona sempre, não depende de ninguém |
| **Manual** | Cadastro produto a produto | **No piloto.** Sempre disponível, para item avulso |
| **Integração** | API do sistema da farmácia | **Projeto futuro**, fora do piloto desde 17/09 |

O fluxo de revisão é idêntico para qualquer origem: escolher origem, mapear campos, revisar o que vai entrar, confirmar. Foi desenhado assim justamente para a integração poder entrar depois sem refazer tela.

**Por que arquivo primeiro:** todo sistema de farmácia exporta relatório em Excel. Isso não depende de contrato com fornecedor, não depende de documentação de API, e está pronto para a demonstração de 14/11. Quando a integração por API chegar, ela pluga no mesmo fluxo, sem refazer tela.

Se a equipe fechar a integração com um fornecedor antes disso, ótimo, entra na mesma tela como uma segunda origem.

---

## 4. Riscos que precisam de resposta

| Risco | Por que importa | Resposta sugerida |
| --- | --- | --- |
| ~~Sistemas de farmácia no Brasil raramente expõem API pública~~ | **Confirmado em 17/09.** A equipe concluiu que a integração é inviável para o piloto | Aconteceu o previsto. A importação por arquivo já estava pronta e independente, então o escopo encolheu sem retrabalho |
| ~~Depender do fornecedor trava o cronograma acadêmico~~ | **Confirmado em 17/09.** A integração saiu do escopo | Virou projeto futuro, como este documento já sugeria |
| O dado de validade provavelmente não vem na importação | Sem validade não existe dashboard, que é o produto inteiro | Desenhar o fluxo de preenchimento de validade como parte da experiência, não como tarefa chata (seção 5) |
| Dados de terceiros podem ter formato imprevisível | Coluna faltando, encoding errado, preço com vírgula | Passo de mapeamento de colunas e passo de revisão antes de gravar |

Nenhum desses riscos invalida a decisão. Todos têm resposta desde que a importação por arquivo exista.

---

## 5. O quarto estado: produto sem validade informada

Esta é a mudança mais importante no design.

Hoje o produto tem três estados: vencido, a vencer, no prazo. Depois da importação vai existir um quarto: **produto que entrou no sistema sem nenhum lote**, e portanto sem validade conhecida.

Esse quarto estado **não é um status de validade**, é ausência de dado. Precisa ser visualmente distinto e nunca pode ser confundido com "no prazo", que é o erro mais perigoso possível: dar ao usuário a sensação de que está tudo certo quando na verdade o sistema não sabe.

**Regra de cor:** neutro (Ardósia 300 ou 500), nunca verde. Está em `design-system.md` como `--status-unknown`.

**Regra de contagem:** o card "No prazo" do dashboard conta apenas produtos com validade conhecida e dentro do prazo. Produtos sem validade têm contador próprio.

### O momento de onboarding

Logo depois de importar, o cliente tem 800 produtos e 800 validades em branco. Esse é o momento em que o Valide ganha ou perde o cliente.

Em vez de deixar ele sozinho com uma tabela vazia, o produto conduz:

- Um card no dashboard: "412 produtos ainda sem validade informada" com a ação "Informar validades"
- Uma fila de preenchimento rápido (`/estoque/validades-pendentes`): um produto por vez, só os campos de lote, validade e quantidade, com atalho para o próximo
- Ordem inteligente da fila: os produtos de maior valor primeiro, porque são os que dão mais prejuízo se vencerem
- Barra de progresso visível, para o trabalho ter fim à vista

Essa fila é a tela que transforma a importação em produto usável. Sem ela, a importação entrega um banco de dados bonito e inútil.

---

## 6. O que muda no frontend

**Telas novas**

| Rota | O que faz |
| --- | --- |
| `/estoque/importar` | Wizard de importação: origem, mapeamento, revisão, resultado |
| `/estoque/validades-pendentes` | Fila de preenchimento rápido de lote e validade |
| ~~`/configuracoes/integracoes`~~ | Removida em 17/09, junto com a integração |

**Telas que mudam**

- **Cadastro de empresa:** ganha um quarto passo com a pergunta "como quer trazer seus produtos?", com as origens do piloto
- **Estado vazio do estoque:** a ação primária vira "Importar produtos", e "Adicionar manualmente" fica como secundária
- **Dashboard:** ganha o contador de produtos sem validade e a ação de preencher
- **Listagem de estoque:** ganha filtro por origem (importado ou manual) e a coluna de status passa a exibir o chip neutro

**Tipos novos**

`ImportSource`, `ImportJob`, `ImportPreviewRow`. Estão em `api-contract.md`.

`Integration` foi removido em 17/09. `ImportSource` **mantém** o valor `integration`: ele faz parte do contrato já acordado com o Pedro, e um produto vindo da integração precisa ter como se identificar quando ela voltar. O que saiu foi a interface para conectar, não a possibilidade de o dado existir.

**Quem lê o arquivo (13/10/2026, issue 075, item 106).** Ler a planilha, reconhecer as colunas e decidir criar ou atualizar cada linha é do servidor. A única exceção é o **modo de demonstração** (sem a API ligada): o navegador lê o cabeçalho, as cinco primeiras linhas e quantas células de cada coluna vieram vazias ou sem número, só para o Mapear e a Revisão mostrarem o arquivo de verdade. Com a API ligada, o navegador só envia o arquivo, em partes de 1 MB, e não lê nada. Na demonstração, toda linha aparece como nova, porque a regra de produto repetido (item 26) ainda está com a equipe.

---

## 7. Plano de retorno, acionado em 17/09

Era assim que estava escrito em 16/09:

> Se a integração por API não se provar viável, o produto não perde nada: a importação por arquivo continua sendo o caminho principal, e o cadastro manual continua existindo para item avulso. Nenhuma tela precisa ser refeita, porque as três origens compartilham o mesmo fluxo de revisão.

Foi exatamente o que aconteceu, um dia depois. O que a decisão custou:

| O que | Custo |
| --- | --- |
| Tela de integrações | Removida. Era uma tela, não um fluxo |
| Terceiro card em três telas | Removido do wizard, do cadastro de empresa e do estado vazio do estoque |
| Wizard de importação | **Zero.** Continua igual, e aceita uma origem nova sem mudar os passos |
| Fila de validades | **Zero.** O trabalho dela começa depois que o produto entrou, não importa por onde |
| Dashboard, estoque, baixa, cadastro | **Zero** |

**Essa é a razão de desenhar assim desde o começo.** Vale registrar porque é o tipo de decisão de arquitetura que só paga quando o plano muda, e normalmente ninguém percebe que pagou.

## 8. O que o piloto precisa da equipe

A integração ter saído **não tira** as perguntas que já estavam na pauta para o Gabriel e o Eduardo. Elas ficam ainda mais importantes, porque a planilha virou o único caminho automático:

- Qual sistema a farmácia parceira usa
- **Se esse sistema exporta a lista de produtos em Excel ou CSV.** Se a resposta for não, o piloto entra 100% por cadastro manual, e isso muda a conversa com o cliente
- Um arquivo de exemplo, mesmo com poucos itens, para testar o mapeamento de colunas com dado real
