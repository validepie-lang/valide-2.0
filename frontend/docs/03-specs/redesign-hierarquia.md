# SPEC: Redesign de hierarquia, informação e padrão de dados

**PRD de origem:** nenhum. Origem: feedback de design recebido pelo Marcus em 08/10/2026 e a auditoria `docs/06-validations/auditoria-hierarquia.md`. É redesign de telas existentes, sem funcionalidade nova, então o problema e o escopo estão na auditoria.
**Autor:** Marcus Campos
**Data:** 08/10/2026
**Status:** aprovada pelo Marcus em 08/10/2026; executada de 08/10 a 09/10/2026, issues 006 a 016 (a 016, "hoje" no fuso da farmácia, entrou no meio). Pendente só o teste dos dois segundos com pessoas de fora (validação 015)
**Etapa da esteira:** SPEC (etapa 2 do redesign)

---

## 1. Resumo técnico

Reorganizar as telas do Valide em três níveis de leitura, com um único elemento de nível 1 e uma única ação primária por tela. Substituir as sete anatomias de indicador por uma, os formatos soltos de dado por uma tabela de formatos, e os gráficos por um padrão neutro com destaque pontual. Retirar a camada decorativa herdada da referência MT, mantendo a estrutura dela.

Não muda: stack, paleta Ardósia, regras de negócio, rotas, vocabulário de status, camada de serviços.

---

## 2. Princípios

Todo item desta SPEC deriva de um destes. Quando houver dúvida na execução, a resposta vem daqui.

| # | Princípio | Base |
| --- | --- | --- |
| 1 | **Uma pergunta e uma ação primária por tela.** Tudo que não serve à pergunta desce de nível ou sai | Hick-Hyman: o tempo de decisão cresce com o número de opções equivalentes |
| 2 | **Três níveis de leitura**, construídos com tamanho, peso, espaço e posição antes de cor | Hierarquia visual clássica; teste dos cinco segundos (aqui, dois) |
| 3 | **Proximidade agrupa, não o contêiner.** Espaço entre seções maior que dentro delas. Card só para o que é clicável ou precisa de separação real | Gestalt, lei da proximidade e da região comum |
| 4 | **Base neutra, destaque só onde o dado pede** | Tufte, razão dado-tinta; Stephen Few, *Information Dashboard Design* |
| 5 | **Cor por último**, e quase toda reservada a status | Regra 1 do `CLAUDE.md`; WCAG 1.4.1 (cor nunca sozinha) |
| 6 | **O sistema fala a língua do mundo real.** Data de validade no formato impresso na embalagem | Nielsen, heurística 2 (correspondência com o mundo real) |
| 7 | **Revelação progressiva.** O que é usado às vezes fica a um clique, não na tela | NN/g, *progressive disclosure* |

---

## 3. Decisões de base

As cinco perguntas abertas na auditoria, mais a revisão da linguagem MT. Registradas em `07-decisions/ux-decisions.md`, 08/10/2026.

### 3.1 Tipografia: Mona Sans para exibição, Inter para interface e dado

**Medição feita em 08/10** (arquivo da fonte e renderização lado a lado): ao ligar algarismos tabulares, a Mona Sans troca o zero por `zero.tf`, com ponto no meio (três contornos), e o "1" ganha base. É o desenho de fonte de código, e não existe recurso OpenType para desligar. A Inter alinha as colunas com o zero normal.

**Decisão:**

- **Mona Sans** só em exibição: título de página (`display`) e o número de nível 1 (`hero`). Em tamanho grande, algarismos proporcionais são o certo tipograficamente, e é onde o caráter da fonte rende.
- **Inter** em todo o resto: corpo, rótulo, tabela, chip, indicador de nível 2 e 3. Com `tabular-nums` em todo número.

**Por quê:** número que se compara em coluna ou que muda no lugar precisa de largura fixa, senão a coluna não alinha pela casa decimal e o contador pula a cada atualização. A própria GitHub, dona da Mona Sans, usa a fonte em marca e em página de apresentação, não em tabela de produto. Par de fonte de exibição com fonte de texto é prática comum, e as duas já passaram pelo projeto.

**Descartado:** algarismos proporcionais em tudo (as colunas de quantidade e dinheiro não alinham); tabular na Mona Sans (datas com cara de código); Inter em tudo (perde o pouco de identidade que a Mona Sans dá no título e no herói, sem ganho).

**Custo:** um arquivo de fonte a mais, servido pelo próprio Next (`next/font`), só com o subconjunto latino.

### 3.2 Cor de erro: o mesmo vermelho, só para o que impede continuar

**Decisão:** vermelho passa a significar **"problema que exige ação"**, e só dois casos se encaixam: lote Vencido e erro que impede o usuário de continuar (campo inválido, login recusado, linha da importação que não entra). O erro usa um token próprio, `--error`, que aponta para os mesmos valores do `--status-expired`. Não existe segundo vermelho.

Aviso e sucesso ficam **neutros**, com ícone e texto. Verde de "importação concluída", amarelo de "linhas com aviso" e vermelho de "importação falhou" no histórico saem.

**Por quê:** mensagem de erro em vermelho perto do campo é convenção quase universal (NN/g, *Error-Message Guidelines*; Carbon, Polaris e Material têm o papel de erro). Tirar a cor do erro faria o balconista apressado não notar que o produto não foi salvo, e esse é um erro mais caro do que diluir o vermelho. O motivo de 16/09 para descartar `--danger` continua valendo: dois vermelhos enfraquecem a regra. Por isso é o **mesmo** vermelho, com o mesmo sentido. Aviso e sucesso não impedem nada, então não ganham cor: isso tira três cores da tela de importação sem perder informação.

**Continua valendo:** botão destrutivo em neutro (16/09). Botão não é erro, é intenção.

**Muda o `CLAUDE.md`**, regra 1 da seção 5. A nova redação entra na issue de tokens.

### 3.3 "Próximos a vencer" mostra só A vencer

**Decisão:** a lista da Home mostra os cinco lotes **A vencer** que vencem primeiro. Título: "Vencem nos próximos 30 dias" (o número segue a janela da conta).

**Por quê:** os vencidos já têm a contagem e o caminho deles na faixa de resumo, e o que se faz com eles é igual para todos (retirar e descartar, em lote). Com o A vencer a decisão é item a item: trazer para a frente da prateleira, oferecer no balcão, devolver ao fornecedor. É aí que o nome do produto ajuda. Hoje a lista mostra cinco vencidos sob um título que diz o contrário, e os vencidos ocupariam a lista para sempre numa farmácia que acumula vencido.

**Muda o contrato:** `expiringSoon` em `GET /dashboard` passa a trazer só lotes com `status = soon`.

### 3.4 Custo parado sai das colunas padrão do estoque

**Decisão:** colunas padrão: Produto, Validade, Situação, Quantidade. Custo parado, Pasta, Lote, Código interno e Estoque mínimo ficam no seletor de colunas. Custo parado continua no detalhe do produto.

**Por quê:** a pergunta da tela é "o que eu tenho e o que vence". Quem mais abre o estoque é o balconista, que não decide nada com o custo. O dono que quer o custo tem o valor em risco na Home e a coluna a um clique.

### 3.5 Dinheiro em indicador: reais inteiros, sem "mil"

**Decisão:** em indicador (nível 1 e 2), o valor aparece em reais inteiros: **R$ 8.573**. Em tabela, detalhe e formulário, com centavos: **R$ 8.572,67**. O valor completo vai para leitor de tela e para a dica ao passar o mouse.

**Por quê:** precisão que não muda a decisão é ruído (Few). Ninguém age diferente por causa de 67 centavos, mas "R$ 8,6 mil" troca a sensação de valor exato por estimativa, e o número é o argumento de venda. Abreviação com "mil" também muda de forma conforme a grandeza (R$ 860 contra R$ 8,6 mil), o que fere a regra de formato único.

**Consequência:** o componente `<Money>`, com centavos esmaecidos, sai. Era um elemento da referência MT.

### 3.6 Data de validade no formato da embalagem

**Decisão:** data de validade sempre como **05/10/2026**, em lista, tabela, detalhe e formulário. Mês abreviado só onde a data marca tempo e não validade: eixo de gráfico ("20 out") e registro de evento ("9 out, 14:22").

**Por quê:** o balconista confere a tela com a caixa na mão, e a embalagem imprime a validade em números. Reconhecer é mais rápido que converter (Nielsen, heurística 2 e 6). A leitura humana já existe ao lado da data: "vence em 12 dias".

**Diverge do exemplo do feedback** ("12 out 2026" em lista). O feedback pedia um formato único e documentado, e o exemplo era ilustrativo. A divergência está registrada para o revisor ver.

### 3.7 Linguagem MT: fica a estrutura, sai a decoração

| Fica | Sai |
| --- | --- |
| Um matiz azul-ardósia, status como única cor saturada | Pilha de abas em vidro (`.glass`, `.glass-tab`) |
| Trilho lateral escuro | Recorte de canto com botão redondo (`.notch-tr`) |
| Mona Sans no título e no herói | Degradê no card escuro (`.surface-card`) |
| Número herói no topo da Home | Ícone em quadrado em todo bloco |
| | Rótulo em caixa alta de 11px (`text-eyebrow`) |
| | Raio de 22px nos cards, sombra em todo card |
| | Centavos esmaecidos (`<Money>`) |

**Por quê:** a referência é um estudo de caso de portfólio, feito para ser visto uma vez em apresentação. O Valide é ferramenta usada oito horas por dia num computador de caixa. O que a referência tinha de estrutura (um matiz, navegação lateral, número que domina) serve à hierarquia e fica. O que era vitrine compete com o dado e sai.

---

## 4. Sistema visual

Entra em `design-system.md` antes de qualquer componente.

### 4.1 Escala tipográfica

Sete tamanhos, contra nove hoje. Saem `eyebrow` (11px) e `card` (16px); `metric` desce de 36 para 28; `section` desce de 20 para 18.

| Token | Tamanho | Peso | Família | Uso |
| --- | --- | --- | --- | --- |
| `hero` | 48/52 | 600 | Mona Sans | Número de nível 1. **Só um por tela, e só na Home** |
| `display` | 32/38 | 600 | Mona Sans | Título de página (`h1`). 24px abaixo de `md` |
| `metric` | 28/32 | 600 | Inter, tabular | Número de nível 2 |
| `section` | 18/24 | 600 | Inter | Título de seção e nome do produto em foco |
| `body` | 14/20 | 400 e 500 | Inter | Texto, célula de tabela |
| `label` | 13/18 | 500 | Inter | Rótulo de indicador, rótulo de campo, cabeçalho de tabela |
| `micro` | 12/16 | 400 | Inter | Metadado em segunda linha. Nunca informação que decide |

### 4.2 Anatomia única de indicador (`Metric`)

```
Rótulo     label, 500, fg-muted       "Valor em risco"
Número     hero | metric | body 600, fg, tabular
Contexto   label, fg-muted            "vencidos e a vencer em 30 dias"
```

- Sem ícone decorativo, sem fundo, sem borda própria.
- Quando o indicador é um status, o rótulo leva o ícone do status na cor sólida dele (14px) antes do texto. Assim o status continua com cor, ícone e rótulo (regra 5) sem quadrado colorido.
- Número sempre em `fg`, nunca colorido.
- Alinhado à esquerda.

### 4.3 Faixa de resumo de status (`StatusSummary`)

Os quatro estados num contêiner só, em quatro segmentos separados por linha fina, na ordem fixa: Vencido, A vencer, No prazo, Sem validade.

- Vencido e A vencer: número em `metric`. No prazo e Sem validade: número em `section`. O peso segue a urgência.
- Contagem zero: o segmento fica em `fg-muted`, sem ícone colorido.
- Cada segmento é um link para o estoque filtrado. Sem validade leva para a fila de validades e traz, embaixo do número, o valor parado e a ação "Informar validades". Isso substitui o card de validades pendentes da Home.
- Sem barra de proporção e sem porcentagem.
- 1440 e 768: quatro segmentos lado a lado. 360: grade 2 por 2.

### 4.4 Formatos de dado

| Dado | Formato | Função |
| --- | --- | --- |
| Dinheiro em indicador | R$ 8.573 | `formatMoneyWhole` (renomeia `formatMoneyShort`, que não é usada) |
| Dinheiro em tabela, detalhe e formulário | R$ 8.572,67 | `formatMoney` |
| Data de validade | 05/10/2026 | `formatDate` |
| Distância até a validade | vence em 12 dias, venceu há 3 dias | `formatExpiryDistance` |
| Evento (movimentação, aviso, importação) | 9 out, 14:22. Com ano se não for o ano corrente: 9 out 2025, 14:22 | `formatEventTime` (substitui `formatDateTime`) |
| Eixo de gráfico | 20 out | `formatAxisDay` (substitui `formatMonthDay`) |
| Quantidade | 14 un, 2,5 kg. Sempre com unidade | `formatQuantity` |
| Movimentação | +24 un, −6 un (sinal de menos tipográfico, U+2212) | `formatQuantity` com sinal |
| Separador de metadado | ponto médio: "MED-1040 · Neo Química" | |

Em tabela, toda coluna numérica alinha à direita, com `tabular-nums`.

### 4.5 Padrão de gráfico

| Regra | Valor |
| --- | --- |
| Base | Barras em `--chart-base` (token novo, Ardósia clara neutra) |
| Destaque | `--chart-focus` (token novo, Ardósia escura) na semana ou categoria que pede atenção. Uma por gráfico, duas no máximo se houver empate |
| Cor de status | Só quando a barra representa aquele status. Nunca para destacar |
| Rótulo | Valor escrito em cima de cada barra. Com rótulo direto, sem eixo Y e sem grade |
| Eixo X | `label`, `fg-muted`, sem linha |
| Barra | raio de 4px só no topo, largura máxima de 32px |
| Contêiner | nenhum. O gráfico fica na página, sob o título da seção |
| Título | diz a conclusão, calculada do dado: "A semana de 20 out concentra 6 lotes". O tipo de dado vai no contexto, embaixo |
| Rosca e pizza | não se usam. Distribuição por categoria é barra horizontal ordenada do maior para o menor |
| Acessibilidade | `role="img"` com resumo em texto, lista oculta com os valores (já é assim) |

### 4.6 Forma, contêiner e elevação

| Elemento | Antes | Depois |
| --- | --- | --- |
| Card | raio 22px, borda, sombra, degradê no escuro | raio `--radius-md` (14px), borda 1px `line`, **sem sombra**, fundo liso |
| Sombra | em todo card | só em camada flutuante: menu, popover, dica |
| Botão e chip | pílula | continuam pílula |
| Aba de seção (configurações) | pílula escura cheia, igual ao chip ativo | aba com sublinhado de 2px na ativa |
| Etapa do assistente | pílula escura cheia | número e texto; atual em negrito com sublinhado, concluída com ✓ |
| Indicador, gráfico | dentro de card | direto na página, sob título de seção |
| Tabela, lista clicável, formulário | card | card (precisam de superfície) |

Três controles com o mesmo desenho e funções diferentes (aba, chip ativo, etapa atual) passam a ter desenhos diferentes.

### 4.7 Espaço

| Onde | Valor |
| --- | --- |
| Entre seções da página | 48px desktop, 32px celular |
| Entre título de seção e conteúdo | 12px |
| Dentro de card | 24px desktop, 16px celular |
| Entre itens de uma lista | 0, separados por linha |

---

## 5. Telas

Para cada tela: a pergunta, o nível 1, a ação primária, e a ordem do que fica. O que sai diz para onde foi.

### 5.1 Home (`/`)

**Pergunta:** o que eu preciso resolver hoje.
**Nível 1:** valor em risco. **Ação primária:** "Ver produtos em risco".

```
1440
┌ trilho ┬────────────────────────────────────────────────────────────┐
│        │ busca                                          sino  conta │
│        │                                                            │
│        │ Valor em risco                                             │
│        │ R$ 8.573                              [Ver produtos em risco]│
│        │ vencidos e a vencer em 30 dias                             │
│        │                                                            │
│        │ ┌ Vencido ──┬ A vencer ─┬ No prazo ─┬ Sem validade ──────┐ │
│        │ │ 5         │ 22        │ 35        │ 18                 │ │
│        │ │           │           │           │ R$ 10.060 parados  │ │
│        │ │           │           │           │ Informar validades │ │
│        │ └───────────┴───────────┴───────────┴────────────────────┘ │
│        │                                                            │
│        │ Vencem nos próximos 30 dias  Ver todos │ A semana de 20 out │
│        │ ┌────────────────────────────────────┐ │ concentra 6 lotes  │
│        │ │ Cataflam Pro Emulgel 30g  A vencer │ │  2  5  6  3  2  1  │
│        │ │ Amoxil BD 875mg           A vencer │ │  ▂  ▅  █  ▃  ▂  ▁  │
│        │ │ ... cinco linhas                   │ │                    │
│        │ └────────────────────────────────────┘ │                    │
│        │          7 de 12 colunas               │   5 de 12 colunas  │
└────────┴────────────────────────────────────────────────────────────┘
```

| Ordem | Bloco | Nível | Componente |
| --- | --- | --- | --- |
| 1 | Valor em risco, com contexto em uma linha e o botão primário à direita (embaixo, em largura inteira, no celular) | 1 | `Metric` nível `hero` + `LinkButton` |
| 2 | Faixa de resumo de status | 2 | `StatusSummary` |
| 3 | Vencem nos próximos 30 dias: cinco lotes A vencer, cada linha com produto, lote, validade, chip e distância. Link "Ver todos" | 2 | `ExpiringSoonList` (reescrita do `ExpiringSoonCard`) |
| 4 | Gráfico de vencimentos por semana, no padrão da seção 4.5 | 3 | `ExpiryWeekChart` |

O botão primário leva para `/estoque?status=expired,soon` (hoje leva só aos vencidos).

**O que sai e para onde vai:**

| Sai | Vai para |
| --- | --- |
| Pilha de filas | Retirar e Vender primeiro: segmentos Vencido e A vencer da faixa. Informar validade: segmento Sem validade |
| Rosca por pasta | Contagem por pasta continua no filtro de pasta do estoque e em `/estoque/pastas`. A rosca deixa de existir |
| Avisos | Menu do sino, no cabeçalho, em todas as telas |
| Movimentações recentes | Detalhe do produto, que já tem o histórico. Rota própria de histórico fica para depois, se fizer falta |
| Atalho Adicionar produto | Cabeçalho do estoque (já existe) |
| Atalho Importar planilha | Cabeçalho do estoque, como ação primária |
| Atalho Registrar saída | Cada linha do estoque e o detalhe do produto (já existem). O atalho abria sempre o mesmo produto |

**Celular (360):** mesma ordem, uma coluna. Botão primário em largura inteira sob o número. Faixa 2 por 2. Gráfico abaixo da lista.

### 5.2 Estoque (`/estoque`)

**Pergunta:** o que eu tenho, e o que está perto de vencer.
**Nível 1:** a tabela. **Ação primária:** "Importar produtos". "Adicionar produto" vira secundária.

| Ordem | Bloco |
| --- | --- |
| 1 | Título "Estoque", sem descrição. Ações à direita |
| 2 | Busca e os chips de Situação (com contagem), numa faixa. Botão "Mais filtros" ao lado, com contador de filtros ativos |
| 3 | "Mais filtros" abre um painel com Pasta, Fornecedor, Marca e Origem. Fecha com Esc |
| 4 | Linha de contagem: "80 produtos, do que vence primeiro ao último". À direita, o seletor de colunas |
| 5 | Tabela: Produto, Validade (data e distância embaixo, em `micro`), Situação, Quantidade (à direita), ação de saída |

**Seletor de colunas:** Código interno, Pasta, Lote, Estoque mínimo, Custo parado. Desligadas por padrão. A escolha fica no navegador (`localStorage`, com `try/catch`, e a tela funciona sem ela).

**Sai da linha:** a segunda linha com código e marca (código vira coluna opcional) e o selo "no mínimo", que aparecia em 13 de 20 linhas e fala de reposição, não de validade. Estoque mínimo vira coluna opcional e continua no detalhe.

**Celular:** card com produto e chip na primeira linha; validade (com distância) à esquerda e quantidade à direita na segunda. Sem lote e sem selo. As ações do cabeçalho ficam numa linha: "Importar" e um botão de ícone "Adicionar produto" com nome acessível.

**Muda o contrato:** `GET /products` aceita `status` com mais de um valor (`status=expired,soon`) e ganha `supplier`, `brand` e `source`. O front já envia `source` sem estar no contrato.

### 5.3 Detalhe do produto (`/estoque/[id]`)

**Pergunta:** este produto tem algo para resolver, e em qual lote.
**Nível 1:** a situação do lote que vence primeiro. **Ação primária:** "Registrar saída".

| Ordem | Bloco | Nível |
| --- | --- | --- |
| 1 | Nome, metadado (código · marca · pasta), ações | título |
| 2 | Linha de situação: chip do lote que vence primeiro e a frase "Lote L2291 venceu em 27/09/2026, há 12 dias. 14 un." | 1 |
| 3 | Três indicadores em linha, sem card: Em estoque (76 un, mínimo de 20), Custo parado (R$ 564), Lotes (2) | 2 |
| 4 | Tabela de lotes: lote, validade, quantidade, situação. Fabricação em `micro` sob o lote | 2 |
| 5 | Histórico de movimentação | 3 |
| 6 | Ficha do produto: lista de definições em duas colunas, sem card | 3 |

**Sai:** o bloco "Lotes 2, próximo: lote L2291" (o número fica no indicador e o próximo lote está na tabela logo abaixo), o chip repetido no cabeçalho da tabela, os subtítulos explicativos, o link em cor de acento.

**Corrige:** "Vence primeiro" diante de uma data que já passou. A frase muda com o estado: "vence em", "venceu em".

### 5.4 Validades pendentes (`/estoque/validades-pendentes`)

**Pergunta:** tenho 18 produtos sem validade, por onde começo.
**Nível 1:** o produto em foco e os três campos. **Ação primária:** "Salvar e ir para o próximo".

| Ordem | Bloco | Nível |
| --- | --- | --- |
| 1 | Título. Embaixo, em uma linha: "0 de 18 preenchidos · R$ 10.060 parados", com barra fina | 3 |
| 2 | Card do produto: nome em `section`, metadado, os três campos, a prévia da situação, os botões e a dica de teclado | 1 |
| 3 | "A seguir": os próximos cinco, lista simples à direita no desktop e abaixo no celular, sem card | 3 |
| 4 | Link "Ver a fila em formato de tabela" | 3 |

**Sai:** o chip "Sem validade" do produto em foco (todo item da fila é Sem validade), o número de 36px do progresso, a frase que repete a descrição.

**Corrige:** o recuo da lista "A seguir" (o `md:p-6` do `Card` vencia o `p-0`) e o valor em `fg-disabled`, que reprova contraste.

### 5.5 Importar (`/estoque/importar`)

**Pergunta:** como trago tudo que já tenho, sem digitar.
**Ação primária por passo:** Escolher arquivo, Continuar, Importar N produtos, Começar a informar validades.

| Passo | O que muda |
| --- | --- |
| Etapas | Novo desenho (seção 4.6), sem pílula cheia |
| Origem | Área de arrastar com "Escolher arquivo" **primário**. "Onde encontrar essa lista" como texto sem caixa. "Prefere cadastrar um produto de cada vez?" como link abaixo. **Sai** o card "Como funciona", que repetia as etapas |
| Mapear | Sem mudança de estrutura. Aplica tipografia e forma |
| Revisar | Três indicadores em linha, sem card, no padrão `Metric`. Linha com erro: ícone e texto em `--error`, sem fundo colorido na linha. Linha com aviso: ícone e texto neutros |
| Resultado | "Importação concluída" com ícone neutro. O bloco "Agora informe as validades" perde o degradê e a sombra: vira seção com título, texto e botão primário. Histórico com "Falhou" em texto neutro com ícone |

### 5.6 Configurações (`/configuracoes`, `/empresa`, `/usuarios`)

**Pergunta (perfil):** como mudo meus dados e minha senha.
**Ação primária:** "Salvar alterações".

- Abas com sublinhado (seção 4.6).
- **Uma coluna**, alinhada à esquerda, até 720px. Formulário em coluna única é preenchido mais rápido e com menos erro do que em duas (Baymard; NN/g).
- Seções separadas por título e espaço, não por card: Seus dados (com empresa e cargo como linhas só de leitura, no lugar do card Sua conta), Senha, Aparência.
- **Sai** o botão "Enviar uma foto", que não faz nada. O avatar com iniciais fica. Volta quando o envio existir (contrato e tela).
- Empresa e Usuários seguem as mesmas regras.

### 5.7 Demais telas

Login, cadastro de empresa, cadastro de produto, baixa e pastas recebem a nova base (tipografia, forma, formatos, cor de erro) sem mudança de estrutura. Cada uma é conferida contra os critérios da seção 10 na issue dela.

### 5.8 Cabeçalho

- O sino abre um **menu de avisos** (popover, até cinco, com estado de não lido). Fecha com Esc e clique fora, devolve o foco ao sino, como o menu da conta já faz.
- Contador do sino em `fg` sobre `sunken`, não em azul de acento. O acento fica para foco e item ativo.

---

## 6. Arquivos

A lista final por issue sai no plano de cada uma (Etapa 3). Este é o mapa.

### A criar

| Caminho | O que é |
| --- | --- |
| `src/components/ui/metric.tsx` | Anatomia única de indicador |
| `src/components/dashboard/status-summary.tsx` | Faixa de resumo de status |
| `src/components/dashboard/expiring-soon-list.tsx` | Lista da Home, no lugar de `expiring-soon-card.tsx` |
| `src/components/layout/notifications-menu.tsx` | Menu do sino |
| `src/components/products/column-picker.tsx` | Seletor de colunas do estoque |
| `src/components/products/more-filters.tsx` | Painel "Mais filtros" |
| `src/components/ui/tabs-nav.tsx` | Aba com sublinhado, usada nas configurações |

### A modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/globals.css` | Tokens novos (`--error`, `--chart-base`, `--chart-focus`, fonte de texto), escala tipográfica, raio, elevação; saem `.glass`, `.glass-tab`, `.notch-tr`, degradê do `.surface-card`, `text-eyebrow`, `text-card` |
| `src/app/layout.tsx` | Carrega Inter como fonte de texto e Mona Sans como fonte de exibição |
| `src/lib/utils/format.ts` e teste | `formatMoneyWhole`, `formatEventTime`, `formatAxisDay`, sinal de menos |
| `src/components/ui/card.tsx`, `button.tsx`, `field.tsx`, `status-chip.tsx`, `empty-state.tsx`, `error-state.tsx` | Forma, elevação, cor de erro |
| `src/app/(app)/page.tsx` e `loading.tsx` | Home nova |
| `src/components/dashboard/expiry-week-chart.tsx` | Padrão de gráfico |
| `src/app/(app)/estoque/page.tsx` e `loading.tsx`, `products/filter-bar.tsx`, `product-table.tsx` | Estoque |
| `src/app/(app)/estoque/[id]/page.tsx` e `loading.tsx`, `products/movements-table.tsx` | Detalhe |
| `src/app/(app)/estoque/validades-pendentes/page.tsx` e `loading.tsx`, `products/quick-fill-form.tsx`, `queue-progress-panel.tsx` | Fila |
| `src/app/(app)/estoque/importar/page.tsx`, `import/*.tsx` | Importar |
| `src/app/(app)/configuracoes/**`, `layout/settings-nav.tsx`, `layout/theme-choice.tsx` | Configurações |
| `src/components/layout/app-shell.tsx`, `header-actions.tsx`, `page-header.tsx` | Cabeçalho e menu de avisos |
| `src/lib/types/index.ts`, `src/lib/services/products.ts`, `src/lib/services/dashboard.ts`, mocks correspondentes | `status` múltiplo, `supplier`, `brand`; `expiringSoon` só A vencer |
| Demais telas da seção 5.7 | Nova base |

### A remover

| Caminho | Substituído por |
| --- | --- |
| `src/components/dashboard/risk-summary.tsx` | `Metric` + `StatusSummary` |
| `src/components/dashboard/work-queue-stack.tsx` | `StatusSummary` |
| `src/components/dashboard/folder-donut-chart.tsx` | nada (seção 5.1) |
| `src/components/dashboard/recent-movements.tsx` | histórico no detalhe |
| `src/components/dashboard/shortcuts-card.tsx` | ações do estoque |
| `src/components/dashboard/side-panels.tsx` | `notifications-menu.tsx` |
| `src/components/dashboard/expiring-soon-card.tsx` | `expiring-soon-list.tsx` |
| `src/components/ui/stat-tile.tsx` | `Metric` |
| `src/components/ui/money.tsx` | `formatMoneyWhole` |

### Documentação

`CLAUDE.md` (regra 1 da seção 5, decisões fechadas), `design-system.md`, `screen-map.md`, `api-contract.md`, `07-decisions/ux-decisions.md`, `visual-ref/README.md`, skill `design-valide`.

---

## 7. Dados

Nenhum endpoint novo. Três mudanças no contrato, registradas em `api-contract.md` na issue que as consome:

| Endpoint | Mudança |
| --- | --- |
| `GET /products` | `status` aceita lista separada por vírgula; novos filtros `supplier`, `brand`, `source` |
| `GET /dashboard` | `expiringSoon` traz só lotes com `status = soon`, os cinco que vencem primeiro. `byFolder` e `recentMovements` deixam de ser usados pela Home; ficam no contrato até o Pedro confirmar que pode tirar |
| `GET /notifications` | sem mudança, passa a ser consumido pelo cabeçalho |

O título do gráfico ("A semana de 20 out concentra 6 lotes") é calculado do `expiryByWeek` que já existe. É apresentação do dado, não regra de negócio.

---

## 8. Estados

Cada tela mantém os quatro estados que já tem. O que muda:

| Tela | Estado | Comportamento |
| --- | --- | --- |
| Home | Vazio (sem produto) | Valor em risco R$ 0, faixa zerada em `fg-muted`, e no lugar da lista o convite para importar |
| Home | Nada a vencer | Lista some, texto: "Nenhum lote vence nos próximos 30 dias." |
| Home | Avisos fora do ar | O sino some (já é assim). A Home não depende mais deles |
| Todas | Carregando | Esqueleto redesenhado com a forma nova de cada tela |

---

## 9. Permissões

Sem mudança. As ações que dependem de cargo (descarte, configurações da empresa, usuários) continuam escondidas na interface e bloqueadas no servidor.

---

## 10. Critérios de aceite

Além da Definition of Done do `CLAUDE.md`:

- [ ] Cada tela tem um único elemento de nível 1 e uma única ação primária (botão cheio)
- [ ] Teste dos dois segundos: numa captura de 1440, três pessoas apontam o mesmo número como o mais importante
- [ ] Todo indicador numérico usa `Metric`
- [ ] Todo gráfico segue a seção 4.5
- [ ] Nenhum `.glass`, `.notch-tr`, degradê, ícone em quadrado decorativo, `text-eyebrow` ou sombra em card estático
- [ ] Vermelho só em Vencido e em erro que impede continuar; amarelo e verde só em status
- [ ] Todo texto que carrega informação passa 4,5:1 (nada de `fg-disabled` em dado)
- [ ] Toda data de validade em dd/mm/aaaa; todo valor de indicador em reais inteiros; toda quantidade com unidade
- [ ] Colunas numéricas alinhadas à direita, com tabular, e alinhando pela casa
- [ ] Toda funcionalidade de antes continua acessível, pelo caminho da tabela "O que sai e para onde vai"
- [ ] Capturas antes e depois em 1440 e 360 em `docs/06-validations/redesign-hierarquia/`
- [ ] Conferido também em **1366 por 768**, a tela do computador de caixa descrito no público-alvo
- [ ] Tema claro e escuro

---

## 11. Riscos

| Risco | Resposta |
| --- | --- |
| A Home serve a dois públicos. O valor em risco é a pergunta do dono; o balconista quer saber o que tirar da prateleira | A faixa de status, logo abaixo, responde o balconista em um clique. Home por cargo fica para depois do piloto, se o uso mostrar que precisa |
| Tirar a pilha de filas tira o elemento que mais chamava atenção na demonstração | É a troca pedida pelo feedback. O valor em risco passa a ser o que chama atenção, e é o número do pitch |
| Duas fontes aumentam o carregamento | Subconjunto latino, servido pelo próprio domínio, com `display: swap` |
| O seletor de colunas guarda preferência no navegador | Só conveniência. Sem ela, valem as colunas padrão |
| A decisão 3.2 muda uma regra do `CLAUDE.md` | Aprovada pelo Marcus com a SPEC em 08/10. A regra muda na issue 006 |
| Os filtros de fornecedor e marca dependem do backend | Mock filtra; contrato registra; o Pedro confirma |

---

## 12. Fora desta SPEC

- Rota própria de histórico de movimentações
- Distribuição por pasta em barra horizontal (só se a equipe pedir)
- Home diferente por cargo
- Envio de foto de perfil
- Ordenação da tabela por clique no cabeçalho
- Marcar aviso como lido no servidor

---

## 13. Issues previstas (Etapa 3)

Uma issue, um commit, validação com o Marcus ao fim de cada uma.

| Nº | Issue |
| --- | --- |
| 006 | Tokens, tipografia em duas famílias, forma, elevação, cor de erro, regra do `CLAUDE.md` |
| 007 | Formatos de dado (`format.ts` e testes) |
| 008 | Componentes base: `Metric`, `StatusSummary`, padrão de gráfico, `TabsNav` |
| 009 | Home e menu de avisos |
| 010 | Estoque: colunas, mais filtros, seletor, ação primária |
| 011 | Detalhe do produto |
| 012 | Validades pendentes |
| 013 | Importar |
| 014 | Configurações |
| 015 | Demais telas e passada final de capturas |
| 016 | "Hoje" no fuso da farmácia (entrou na execução, antes da 008) |

---

## Checklist antes de quebrar em issues

- [x] Todo arquivo a criar, modificar e remover está listado
- [x] Componentes reutilizáveis foram procurados na base (`StatusChip`, `StatusIcon`, `LinkButton`, `EmptyState`, `Progress` ficam)
- [x] Mudanças de contrato listadas
- [x] Estados de tela especificados
- [x] Critérios de aceite verificáveis
- [x] Nada exige backend, banco ou autenticação real
