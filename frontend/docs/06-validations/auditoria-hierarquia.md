# Auditoria de hierarquia, informação e padrão de dados

**Data:** 08/10/2026
**Etapa:** 1 de 3 do redesign de hierarquia (auditoria, sem código)
**Origem:** feedback recebido pelo Marcus: informação demais, nenhuma hierarquia, cara de front feito por IA, dado sem padrão.
**Telas:** Home, Estoque, Detalhe do produto, Validades pendentes, Importar (passo Origem, mais os componentes dos outros passos lidos no código), Configurações (Meu perfil).

Capturas do estado atual, tema claro, em `redesign-hierarquia/antes/`:

| Tela | 1440 | 360 |
| --- | --- | --- |
| Home | `home-1440.png` | `home-360.png` |
| Estoque | `estoque-1440.png` | `estoque-360.png` |
| Detalhe do produto (Dipirona, `p1`) | `produto-1440.png` | `produto-360.png` |
| Validades pendentes | `validades-pendentes-1440.png` | `validades-pendentes-360.png` |
| Importar, passo Origem | `importar-1440.png` | `importar-360.png` |
| Configurações, Meu perfil | `configuracoes-1440.png` | `configuracoes-360.png` |

O "N" preto no canto inferior esquerdo é o indicador do modo de desenvolvimento do Next, não faz parte da interface. Em 360 o gráfico de rosca aparece vazio por limitação da captura em iframe (Recharts), não é defeito.

**Legenda da classificação**

- **P1, essencial:** responde a pergunta da tela. Fica, com destaque.
- **P2, apoio:** ajuda a decidir ou agir. Fica, com peso menor.
- **P3, removível:** não precisa estar nesta tela. Sai, muda de rota, vira menu ou fica atrás de um clique.

---

## Resumo em seis achados

1. **A Home não passa no teste dos dois segundos.** O número de valor em risco é o maior, mas o bloco mais pesado da tela é a pilha de filas em vidro azul: é a área mais escura, a única com gradiente, sombra funda e botão claro. O olho vai para ela, não para o herói. Logo abaixo do herói há mais cinco números de 36px (quatro blocos e o "5" da fila) disputando o segundo lugar.
2. **A mesma informação aparece três vezes na primeira dobra da Home.** "5 vencidos" está no bloco Vencido, no selo da fila, no número grande da fila, e os cinco itens de "Próximos a vencer" são os mesmos cinco vencidos. "22 a vencer" e "18 sem validade" aparecem duas vezes cada. É a área que o Marcus circulou na captura.
3. **Existem sete anatomias de indicador numérico.** Cada tela inventou a sua (lista na seção de inconsistências). Rótulo em caixa alta de 11px em um lugar, 13px em outro, título de card em outro. Ícone em quadrado colorido, neutro ou nenhum.
4. **Cor de validade usada fora de validade em seis lugares.** Verde para "importação concluída" e "fila concluída", vermelho para "importação falhou" e erro de formulário, amarelo para "linhas com problema". Ensina o usuário que vermelho e verde não querem dizer validade, que é exatamente o que a regra 1 do `CLAUDE.md` existe para impedir.
5. **Três links prometem uma coisa e fazem outra.** "Ver produtos em risco" filtra só Vencido, mas o valor em risco soma Vencido e A vencer. "Próximos a vencer" lista só lotes já vencidos. "Registrar saída" dos atalhos abre sempre a Dipirona.
6. **O próprio design system de 07/10 pede os sinais que o feedback condena.** Vidro, gradiente, recorte de canto, ícone em quadrado em todo bloco, raio de 22px em tudo: tudo isso entrou pela referência MT. O redesign reverte parte dessa decisão (ver "Conflitos com decisões registradas").

---

## 1. Home (`/`)

**Pergunta da tela:** o que eu preciso resolver hoje.
**Ação primária hoje:** nenhuma clara. Há sete botões e links de peso parecido: "Ver produtos em risco", "Ver vencidos" (botão claro, o mais chamativo), o botão redondo de expandir, "Ver estoque", dois quadros de atalho e "Registrar saída" (botão escuro cheio, o segundo mais chamativo).
**Elemento dominante hoje:** disputado entre o herói e a pilha de filas. Nove blocos com borda, sombra e raio de 22px.

### Inventário

| # | Elemento | O que mostra | Classe | Destino proposto |
| --- | --- | --- | --- | --- |
| 1 | Busca no topo | busca no estoque | P2 | Fica no shell, sem mudança |
| 2 | Sino com contador azul | 3 avisos não lidos | P2 | Fica, e passa a abrir um menu com os avisos |
| 3 | Rótulo "VALOR EM RISCO" | caixa alta 11px | P1 | Fica, no padrão de rótulo (13px, sem caixa alta) |
| 4 | Número herói R$ 8.572,67 | 48px, centavos esmaecidos | **P1** | Fica. É o nível 1 da tela |
| 5 | Texto de contexto do herói | duas linhas explicando o cálculo | P2 | Encurta para uma linha ("vencidos e a vencer em 30 dias") |
| 6 | Link "Ver produtos em risco" | link discreto, à direita | P1 | Vira o botão primário da tela. **Corrigir o filtro**, hoje leva só aos vencidos |
| 7 | Quatro blocos de estado | ícone em quadrado colorido, rótulo, número 36px, barra de proporção, "% dos produtos" | P2 | Viram uma faixa única de resumo, com Vencido e A vencer mais pesados que No prazo e Sem validade |
| 8 | Barra de proporção e "% dos produtos" | 6%, 28%, 44%, 23% | P3 | Sai. A porcentagem não ajuda a decidir nada hoje |
| 9 | Seta diagonal nos blocos | só em 2xl | P3 | Sai. O bloco inteiro já é link |
| 10 | Pilha "Filas de hoje", aba Retirar | 5 vencidos, texto, "Ver vencidos" | P3 | Sai. Repete o bloco Vencido. A ação "ver vencidos" é o clique no próprio número |
| 11 | Pilha, aba Vender primeiro | 22 a vencer | P3 | Sai, mesmo motivo |
| 12 | Pilha, aba Informar validade | 18 sem validade, R$ parado neles | P2 | A ação "Informar validades" e o valor parado passam para a contagem Sem validade da faixa de resumo |
| 13 | Rótulo "FILAS DE HOJE" | caixa alta | P3 | Sai com a pilha |
| 14 | Próximos a vencer | 5 lotes, ícone de caixa em círculo, nome, lote, unidade, data, chip, distância | P2 | Fica, com lista mais limpa, sem ícone em círculo. Precisa decidir o conteúdo (ver nota abaixo) |
| 15 | Botão redondo de expandir no recorte de canto | leva para `/estoque` | P3 | Sai. Vira link de texto "Ver todos" |
| 16 | Subtítulo "Lotes em ordem de vencimento" | repete o título | P3 | Sai |
| 17 | Rosca "Onde está o risco" | 27 produtos por pasta, 6 tons, legenda | P3 | Sai da Home. Se a equipe quiser, vira barra horizontal no Estoque |
| 18 | Avisos | 4 avisos, ícone em círculo, ponto azul de não lido, selo "3 novos" | P3 | Sai da Home, vai para o menu do sino |
| 19 | Movimentações recentes | 5 linhas | P3 | Sai da Home. Já existe no detalhe do produto |
| 20 | Gráfico "Vencimentos por semana" | 8 semanas, pico em tom escuro | P2 | Fica como nível 3, no padrão novo de gráfico, com título que diz a conclusão |
| 21 | Atalhos: Adicionar produto, Importar planilha | dois quadros com ícone | P3 | Sai. Os dois já são botões no cabeçalho do Estoque |
| 22 | Atalho Registrar saída | botão escuro largo | P3 | Sai. A saída começa sempre de um produto, e o link hoje abre fixo a Dipirona |

**Nota sobre "Próximos a vencer".** Com os dados de demonstração os cinco primeiros lotes já venceram, então a lista mostra cinco selos Vencido, e o título diz o contrário. Opções para a SPEC: (a) a lista mostra só A vencer, porque os vencidos já estão no número da faixa; (b) o título muda para "O que vence primeiro". Recomendo (a): os vencidos já têm o seu caminho, e a lista vira o que dá para salvar.

**Resultado:** de 22 elementos, 2 ficam como P1, 5 como P2 e 15 saem ou mudam de lugar. Dos nove blocos, ficam três (herói com faixa de resumo, próximos a vencer, gráfico).

### Mobile (360)

A ordem já está por importância, mas a tela tem cerca de 2.400px de altura antes das movimentações. Os quatro blocos ocupam duas linhas inteiras, a pilha de filas mais uma tela. "Próximos a vencer" trunca o nome do produto em 13 caracteres ("Torsilax, 30 comp...") e a data ("05/...") porque divide a linha com o chip e com "venceu há 34 dias".

---

## 2. Estoque (`/estoque`)

**Pergunta da tela:** o que eu tenho, e o que está perto de vencer.
**Ação primária hoje:** "Adicionar produto" (botão escuro). "Importar produtos" é secundário. O mapa de telas e a estratégia de importação dizem o contrário: importar é o caminho principal.
**Elemento dominante hoje:** a tabela, corretamente. O problema aqui é densidade, não hierarquia.

### Inventário

| # | Elemento | Classe | Destino proposto |
| --- | --- | --- | --- |
| 1 | Título "Estoque" | P1 | Fica |
| 2 | Descrição "O que você tem... Ordenado pelo que vence primeiro." | P3 | Sai ou encurta. Repete o rodapé "O que vence primeiro fica no topo" |
| 3 | Botão "Adicionar produto" (primário) | P2 | Vira secundário |
| 4 | Botão "Importar produtos" (secundário) | P1 | Vira primário |
| 5 | Busca dentro do card | P1 | Fica |
| 6 | Linha de chips Situação, com ponto colorido e contagem | P1 | Fica, como filtro principal |
| 7 | Linha de chips Pasta, com contagem | P2 | Vai para "Mais filtros", junto de fornecedor, marca e origem |
| 8 | Contagem "80 produtos" | P2 | Fica |
| 9 | Texto "O que vence primeiro fica no topo" | P3 | Sai, vira o indicador de ordenação no cabeçalho da coluna Validade |
| 10 | Coluna Produto, com SKU e marca embaixo | P1 | Fica. SKU e marca podem sair da segunda linha |
| 11 | Coluna Pasta | P3 | Seletor de colunas |
| 12 | Coluna Lote, com "+1" em cinza claro | P3 | Seletor de colunas. O "+1" hoje tem contraste reprovado |
| 13 | Coluna Validade | P1 | Fica |
| 14 | Coluna Situação (chip) | P1 | Fica |
| 15 | Coluna Estoque | P1 | Fica |
| 16 | Selo "no mínimo" ao lado da quantidade | P3 | Sai da lista. Aparece em 13 de 20 linhas visíveis, é ruído e fala de reposição, não de validade. Fica no detalhe |
| 17 | Coluna Custo parado | P2 | Decidir na SPEC. Não está na lista do feedback, mas é o dado que liga a tabela ao valor em risco da Home. Proposta: seletor de colunas |
| 18 | Ícone de saída em cada linha | P2 | Fica, discreto |
| 19 | Botão "Informar" na validade de produto sem lote | P1 | Fica (decisão de 16/09) |

### Mobile (360)

Os dois botões do cabeçalho ocupam 90px antes do conteúdo. A linha de chips de Situação corta "A vencer" na borda, o que é intencional (rola), mas a de Pasta repete o efeito e o card de filtro inteiro ocupa mais de um terço da primeira tela. Cada card de produto tem três colunas de dado mais o selo "no mínimo" numa quarta linha, com cerca de 165px de altura: cabem quatro produtos por tela.

---

## 3. Detalhe do produto (`/estoque/[id]`)

**Pergunta da tela** (não está escrita no mapa de telas; proposta): este produto tem algo para resolver, e em qual lote.
**Ação primária hoje:** "Registrar saída", correta.
**Elemento dominante hoje:** nenhum. Quatro blocos de mesmo tamanho e peso, cada um com ícone em quadrado.

### Inventário

| # | Elemento | Classe | Destino proposto |
| --- | --- | --- | --- |
| 1 | Nome do produto como título | P1 | Fica |
| 2 | SKU, marca, pasta embaixo do título | P2 | Fica |
| 3 | Botões Editar (secundário) e Registrar saída (primário) | P1 | Ficam |
| 4 | Bloco "Em estoque 76 un, mínimo de 20" | P2 | Entra numa linha de indicadores de mesmo peso, menor |
| 5 | Bloco "Custo parado R$ 563,92" | P2 | Idem |
| 6 | Bloco "Vence primeiro 27/09/2026", chip, distância | **P1** | Vira o nível 1: situação e data do lote que vence primeiro. Hoje diz "vence primeiro" para uma data que já passou |
| 7 | Bloco "Lotes 2, próximo: lote L2291" | P3 | Sai. A lista de lotes logo abaixo já mostra |
| 8 | Card Lotes, com subtítulo de duas linhas explicando a regra | P1 | Fica. O subtítulo sai |
| 9 | Chip de situação no cabeçalho do card Lotes | P3 | Sai. O mesmo selo Vencido aparece três vezes na tela |
| 10 | Selo "vence primeiro" no primeiro lote | P2 | Fica |
| 11 | Data de fabricação em cada lote | P3 | Fica, em segundo plano, ou atrás de um clique |
| 12 | Histórico de movimentação, com subtítulo | P2 | Fica. O subtítulo sai |
| 13 | Ficha do produto (estoque, valores, identificação) | P2 | Fica, sem card próprio, como lista de definições |
| 14 | Link "Ver tudo em Medicamentos" em azul de acento | P3 | Sai ou vira link comum |

### Mobile (360)

Os quatro blocos ocupam duas linhas e 300px. O cabeçalho do card Lotes repete o chip Vencido numa linha só para ele.

---

## 4. Validades pendentes (`/estoque/validades-pendentes`)

**Pergunta da tela:** tenho 18 produtos sem validade, por onde começo.
**Ação primária hoje:** "Salvar e ir para o próximo", correta, com teclado.
**Elemento dominante hoje:** o número "0 de 18" do painel lateral, em 36px, maior que o nome do produto que está sendo preenchido (20px). O que é nível 3 (progresso) ganha do nível 1 (o produto e os três campos).

### Inventário

| # | Elemento | Classe | Destino proposto |
| --- | --- | --- | --- |
| 1 | Título e descrição com o total e o valor parado | P2 | Descrição encurta, o valor vira contexto do progresso |
| 2 | Produto em foco: SKU, pasta, nome, marca, estoque, valor parado | **P1** | Fica, o nome maior que tudo na tela |
| 3 | Chip "Sem validade" no canto do produto | P3 | Sai. Todo produto desta fila é Sem validade por definição |
| 4 | Três campos: lote, validade, quantidade | **P1** | Ficam |
| 5 | Faixa de prévia da situação | P1 | Fica |
| 6 | Salvar e próximo, Pular este | P1 | Ficam |
| 7 | Dica de teclado (Tab, Enter) | P2 | Fica |
| 8 | Card "Progresso da fila" com número de 36px e barra | P2 | Fica, menor, e sobe para perto do título, como contexto |
| 9 | Texto "A fila começa pelos de maior valor" | P3 | Sai. Repete a descrição da página |
| 10 | Card "A seguir na fila", 5 itens com valor | P2 | Fica, sem card, com contraste corrigido |
| 11 | Link "Ver a fila em formato de tabela" | P2 | Fica |

**Defeitos vistos na captura:**

- O card "A seguir na fila" usa `Card` com `p-0`, mas o `md:p-6` do componente continua valendo. Resultado: a lista aparece recuada, com as linhas divisórias sem encostar na borda e um vão de 24px em cima do título.
- Os valores em reais da lista usam `text-fg-disabled` (`#93A5B7` sobre branco, cerca de 2,4:1). Reprova AA, e é informação, não texto desabilitado.

---

## 5. Importar (`/estoque/importar`)

**Pergunta da tela:** como trago tudo que já tenho, sem digitar.
**Ação primária hoje (passo Origem):** "Escolher arquivo", **estilizado como secundário** (contorno). A única ação que importa no passo não é o botão mais forte da tela.
**Elemento dominante hoje:** a área de arrastar, corretamente.

### Inventário do passo Origem

| # | Elemento | Classe | Destino proposto |
| --- | --- | --- | --- |
| 1 | Título e descrição por passo | P1 | Ficam |
| 2 | Etapas em pílulas (1 Origem, 2 Mapear, 3 Revisar, 4 Resultado) | P2 | Ficam |
| 3 | Card "Enviar uma planilha" com área de arrastar | **P1** | Fica. Botão vira primário |
| 4 | "Onde encontrar essa lista no seu sistema" em caixa com borda | P2 | Fica, sem caixa |
| 5 | Card "Cadastrar manualmente" com ícone em quadrado | P2 | Vira link de texto abaixo da área de arrastar, como já é no estado vazio do Estoque |
| 6 | Card "Como funciona" com os 4 passos | P3 | Sai. Repete as pílulas de etapa logo acima, com frases a mais |

### Outros passos (lidos no código)

| Passo | Achado |
| --- | --- |
| Revisar | Três cards de resumo com o número em 36px. "Linhas com problema" em amarelo de validade. Linha com erro em fundo vermelho de validade, aviso em texto amarelo de validade |
| Resultado | Ícone de sucesso em quadrado verde de validade. Bloco "Agora informe as validades" em gradiente azul com sombra funda (o segundo gradiente do produto). Histórico com selo "Falhou" em vermelho de validade |

---

## 6. Configurações (`/configuracoes`)

**Pergunta da tela:** como mudo meus dados e minha senha.
**Ação primária hoje:** "Salvar alterações". "Trocar senha" é secundário, correto.
**Elemento dominante hoje:** o card Seus dados, correto. É a tela mais limpa das seis.

### Inventário

| # | Elemento | Classe | Destino proposto |
| --- | --- | --- | --- |
| 1 | Título e descrição da seção | P2 | Ficam |
| 2 | Abas Meu perfil, Empresa, Usuários (pílula cheia na ativa) | P1 | Ficam, com estilo diferente do chip de filtro (hoje são iguais) |
| 3 | Card Seus dados: avatar, nome, usuário | **P1** | Fica |
| 4 | Botão "Enviar uma foto" | P3 | **Não faz nada.** Sai até existir, ou fica desabilitado com o motivo |
| 5 | Card Senha | P2 | Fica |
| 6 | Card Sua conta (empresa, cargo) | P3 | Vira duas linhas dentro de Seus dados. Hoje é um card para dois dados |
| 7 | Card Aparência (claro, escuro, automático) | P2 | Fica, sem card próprio |

---

## Inconsistências de exibição de dados

### Anatomia de indicador: sete versões

| Onde | Rótulo | Número | Contexto | Ícone |
| --- | --- | --- | --- | --- |
| Herói da Home | 11px, caixa alta | 48px, centavos esmaecidos | 13px, duas linhas | nenhum |
| Blocos de estado da Home | 14px, 600, cor de texto | 36px | 12px "% dos produtos" + barra | quadrado com fundo de status |
| Fila aberta da Home | título de aba 16px | 36px + unidade ao lado | 13px | quadrado escuro |
| `StatTile` (produto) | 13px, 500, muted | 20 a 36px | 12px | quadrado neutro |
| Progresso da fila | 13px, muted | 36px + "de 18" em 20px | 13px | nenhum |
| Resumo da revisão (importar) | 13px, muted | 36px, às vezes amarelo | 13px | nenhum |
| Centro da rosca | nenhum | 20px | 12px "produtos" | nenhum |

### Dinheiro

| Onde | Formato |
| --- | --- |
| Herói, custo parado do produto, fila Informar validade | `<Money>`: R$ 8.572,67 com centavos menores e esmaecidos |
| Tabela do estoque, ficha do produto, revisão | `formatMoney`: R$ 563,92, tudo no mesmo tamanho |
| Lista "A seguir na fila" | `formatMoney` em cinza de texto desabilitado |
| Descrição de Validades pendentes | R$ 10.060,17 no meio de uma frase |

`formatMoneyShort` (sem centavos) existe e não é usado em lugar nenhum. Não há formato abreviado ("R$ 8,6 mil").

### Data

| Formato | Onde |
| --- | --- |
| 05/09/2026 | tabela, lista da Home, lotes, bloco do produto |
| 09/10 às 14:22 (sem ano) | movimentações, avisos |
| 09/10 (dia e mês) | eixo do gráfico, que é o mesmo desenho de "9 de outubro" e de "setembro de 2010" |

`formatDateLong` ("12 out 2026") existe e não é usado. Nenhum formato está documentado no design system.

### Quantidade

| Onde | Formato |
| --- | --- |
| Lista da Home | "6 un" no meio da linha |
| Bloco do produto | "76 un" com unidade menor |
| Tabela do estoque | "6", sem unidade |
| Movimentações da Home | "-6 un" |
| Movimentações do produto | "-6" |
| Fila de validades | "14 em estoque" |

Separadores também variam: "MED-1040 · Neo Química" com ponto médio na tabela e no produto, "Lote TS9126, 6 un, 05/09/2026" com vírgula na Home.

### Números tabulares

O feedback pede `tabular-nums` em todo número. O design system de 07/10 desligou isso de propósito: na Mona Sans os algarismos tabulares têm desenho de fonte monoespaçada, com zero pontilhado, e as datas pareciam código. Hoje `.tnum` aplica algarismos proporcionais, então **as colunas de quantidade e dinheiro não alinham pelo dígito**. Isso precisa de uma decisão na SPEC (ver perguntas no fim).

### Gráficos

| Gráfico | Problema |
| --- | --- |
| Vencimentos por semana | Título descreve o tipo de dado, não a conclusão. Eixo Y com números em cinza de baixo contraste. Barras com raio total (cápsula). Duas semanas empatadas no pico ganham destaque, então são dois destaques em vez de um, sem dizer por quê. Sem rótulo direto no dado |
| Onde está o risco (rosca) | Seis tons do mesmo matiz que o olho não distingue entre si, só para diferenciar categorias. Legenda separada do dado. O número central (27) não aparece em nenhum outro lugar da tela |

### Status

O mesmo estado aparece em cinco desenhos diferentes:

| Desenho | Onde | Tem ícone e rótulo? |
| --- | --- | --- |
| `StatusChip` | tabela, listas, produto | sim |
| Bloco com quadrado colorido e barra | Home | sim |
| Selo de texto "5 vencidos" | pilha de filas | **não tem ícone** (fere a regra 5) |
| Ponto colorido no chip de filtro | estoque | ponto e rótulo |
| Barra de proporção colorida | Home | não, depende do bloco |

### Cor de validade fora de validade

| Arquivo | Uso | Cor |
| --- | --- | --- |
| `import/step-result.tsx:26` | ícone de "Importação concluída" | verde de No prazo |
| `products/quick-fill-form.tsx:91` | ícone de "Fila concluída" | verde de No prazo |
| `import/step-result.tsx:107` | selo "Falhou" no histórico | vermelho de Vencido |
| `import/step-review.tsx:86,97` | linha com erro no arquivo | vermelho de Vencido |
| `import/step-review.tsx:102,169` e `step-result.tsx:51` | aviso e "linhas com problema" | amarelo de A vencer |
| `ui/field.tsx:31`, `(auth)/login/page.tsx:38` | erro de formulário e de login | vermelho de Vencido |

Os dois últimos grupos têm uma justificativa (erro é convenção universal em vermelho), mas a regra do projeto hoje não abre exceção. Precisa de decisão (ver perguntas).

### Contraste

`--fg-disabled` (`#93A5B7` claro) é usado em texto que carrega informação: valores da lista "A seguir na fila", "+1" de lotes na tabela, eixo Y do gráfico, seta dos blocos. Cerca de 2,4:1 sobre branco.

---

## Sinais de front de IA encontrados

| Sinal (lista do feedback) | Onde aparece |
| --- | --- |
| Grade de cards do mesmo tamanho e peso | Quatro blocos de estado na Home; quatro `StatTile` no produto; três resumos na revisão de importação |
| Ícone dentro de círculo ou quadrado colorido em todo card | Blocos da Home, abas da fila, lista de próximos a vencer, movimentações, avisos, atalhos, `StatTile`, Cadastrar manualmente, Importação concluída. Nove componentes |
| Sombra, borda e raio grande em todo bloco | `Card` e `.surface-card` aplicam os três em tudo, raio de 22px. Inclusive em blocos que não são clicáveis nem precisam de separação (ficha do produto, Sua conta, Aparência) |
| Gradiente, vidro fosco, brilho | `.glass` na pilha de filas, `.surface-card` com degradê no escuro, bloco de próximo passo na importação, cabeçalho com `backdrop-blur` |
| Excesso de badges e pills | "no mínimo" em 13 linhas, "3 novos", três selos de fila, "vence primeiro", "% dos produtos", contagens em todo chip de filtro |
| Frases genéricas de boas-vindas | **Não encontrado.** |
| Ícones decorativos | Caixa genérica repetida em todo item de "Próximos a vencer" (mesmo ícone em todas as linhas, não identifica nada), ícone em cada bloco do produto, seta diagonal dos blocos |
| Tudo centralizado | Pouco. Estado vazio e área de arrastar, que têm motivo. Fila concluída também |
| Mesma quantidade de destaque em tudo | Home: herói, pilha em vidro, botão claro "Ver vencidos", botão escuro "Registrar saída", botão redondo do recorte, ponto azul de não lido, selos coloridos. Sete pontos de atenção |
| Texto de apoio que repete o título | "Lotes em ordem de vencimento", "O que a equipe registrou", "Cada saída registra quem fez, quando e por quê", "O que vence primeiro fica no topo" (que repete a descrição da página), "Como funciona" (que repete as etapas), "A fila começa pelos de maior valor" (que repete a descrição) |

Fora da lista, mas do mesmo tipo:

- **Recorte de canto com botão redondo de expandir.** Enfeite herdado do estudo de caso. O ícone de expandir não diz "ver todos".
- **Rótulo em caixa alta espaçada** ("VALOR EM RISCO", "FILAS DE HOJE", "SITUAÇÃO", "ESTOQUE"). Assinatura comum de painel gerado.
- **Controles com o mesmo desenho e funções diferentes.** Aba de configurações, chip de filtro ativo e etapa atual da importação são a mesma pílula escura cheia.

---

## Conflitos com decisões registradas

O redesign mexe em decisões que estão escritas. Antes da SPEC, o Marcus precisa confirmar que elas caem:

| Decisão atual | Onde está | O que o feedback pede |
| --- | --- | --- |
| Pilha de abas em vidro como elemento de assinatura | `design-system.md` seção 12, `ux-decisions.md` 07/10 | Sem vidro, sem gradiente. A pilha sai da Home |
| Recorte de canto, uma vez por tela | idem | Sai |
| Raio de 22px no card (`--radius-lg`) | seção 12 | Card grande no máximo `--radius-md` (14px) |
| Rótulo em caixa alta de 11px acima do número | seção 12 | Rótulo 13px, 500, `fg-muted` |
| Blocos de mesmo formato lado a lado com ícone em quadrado | seção 12 e `visual-ref/README.md` | Sem ícone em quadrado, faixa única de resumo |
| Algarismos proporcionais (`.tnum`) | seção 12 | `tabular-nums` |
| Home com painel lateral, rosca, avisos, ações rápidas | `screen-map.md` seção 3, `design-system.md` seção 7 | Uma coluna, quatro blocos |

**O que continua da referência MT:** um matiz azul-ardósia, as cores de validade como as únicas saturadas, o trilho lateral escuro, a Mona Sans, o número herói. É a parte da referência que já servia à hierarquia; o que sai é a parte decorativa.

---

## Perguntas para decidir antes da Etapa 2

1. **Algarismos tabulares.** Proposta: testar se a Mona Sans tem alternativa estilística de zero sem ponto. Se tiver, ligar `tabular-nums` em tabela e indicador. Se não tiver, tabular só nas colunas de tabela (onde o alinhamento importa mais que o desenho) e proporcional no resto.
2. **Cor de erro e de sucesso fora de validade.** Proposta: sucesso e falha de importação ficam neutros (ícone e texto, sem cor). Erro de formulário ganha um token próprio de erro, documentado como a única exceção à regra 1. A alternativa, erro de formulário neutro, prejudica quem preenche rápido.
3. **"Próximos a vencer" na Home.** Proposta: só A vencer, porque os vencidos já têm o número e o caminho deles na faixa de resumo.
4. **Custo parado na tabela do estoque.** Proposta: sai das colunas padrão, fica no seletor e no detalhe.
5. **Abreviação de dinheiro no nível 1.** Proposta: não abreviar o herói. "R$ 8,6 mil" tira a precisão de um número que é o argumento da apresentação, e o feedback deixa a abreviação como opcional.

---

## Fora desta auditoria

As outras sete telas (login, cadastro de empresa, cadastro de produto, baixa, pastas, empresa, usuários) não foram auditadas elemento a elemento nesta etapa. Usam os mesmos componentes (`Card`, `PageHeader`, `StatTile`, `Field`), então herdam a maior parte dos achados acima. Entram na SPEC com a mesma lógica.

Os esqueletos de carregamento (`loading.tsx`) desenham o layout atual de cada tela e precisam mudar junto.
