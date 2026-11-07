# design-system.md: Valide

Tradução da paleta Ardósia em tokens utilizáveis, mais as decisões de layout vindas da referência visual escolhida pela equipe.

> **Desde 11/10/2026 a paleta é Cobalto sobre papel (seção 17) e a fonte é Instrument Sans (seção 16).** Os valores de cor das seções 1, 3, 12 e 15.5 e a tipografia da 14.1 ficam como histórico; a fonte da verdade dos valores é `src/app/globals.css`.

---

## 1. Rampa primária (Ardósia)

| Tom | Hex |
| --- | --- |
| 50 | `#F1F3F5` |
| 100 | `#DCE1E6` |
| 300 | `#9FAEB8` |
| 500 | `#5C6F7C` |
| 700 | `#354451` |
| 900 | `#1C262E` |

Azul-acinzentado escuro, escolhido por ser neutro: não é a cor padrão de nenhum segmento, então não compete com a marca do cliente que usar a plataforma.

---

## 2. Cores de status (fixas nos dois temas)

| Status | Sólido | Fundo do chip | Texto do chip |
| --- | --- | --- | --- |
| Vencido | `#D64545` | `#FBE7E7` | `#B23A3A` |
| A vencer | `#E0A020` | `#FCEEDB` | `#8A610D` |
| No prazo | `#3C9D53` | `#E7F5EA` | `#2F7D46` |

Não mudam com o tema, não mudam com a marca do cliente, não são usadas para nada além de validade.

**Regra do tom sólido:** o sólido é preenchimento, ponto e barra de gráfico. Nunca texto. `#E0A020` sobre branco dá 2,28:1, muito abaixo de AA. Texto de status usa sempre o par `-bg` mais `-fg`.

### O quarto estado: sem validade informada

Com a importação de catálogo (ver `01-references/import-strategy.md`), existe um quarto estado: produto que entrou no sistema sem nenhum lote, e portanto sem validade conhecida.

| Estado | Sólido | Fundo do chip | Texto do chip |
| --- | --- | --- | --- |
| Sem validade | `#9FAEB8` | `#F1F3F5` | `#5C6F7C` |

Três regras sobre ele:

1. **Neutro, nunca verde.** Confundir "não sei a validade" com "está no prazo" é o erro mais perigoso que esta interface pode cometer. Dá ao usuário a sensação de segurança que ele não tem.
2. **Não entra na contagem de "No prazo".** Tem contador próprio no dashboard.
3. **Não é um status de validade, é ausência de dado.** Por isso usa neutro e não uma quarta cor semântica. Isso não fere a regra de que Ardósia nunca vira status: aqui o neutro comunica justamente que não há status.

O chip sempre traz ícone e o rótulo "Sem validade", e sempre é clicável, levando para o preenchimento daquele produto.

---

## 3. CSS variables

```css
:root {
  /* superficies */
  --bg-page: #F1F3F5;
  --bg-surface: #FFFFFF;
  --bg-surface-raised: #FFFFFF;
  --border: #DCE1E6;

  /* texto */
  --fg: #1C262E;
  --fg-muted: #5C6F7C;
  --fg-disabled: #9FAEB8;

  /* acao primaria */
  --primary: #354451;
  --primary-hover: #26323C;
  --primary-pressed: #1C262E;
  --primary-fg: #FFFFFF;

  /* status: o tom solido e identico nos dois temas */
  --status-expired: #D64545;
  --status-expired-bg: #FBE7E7;
  --status-expired-fg: #B23A3A;

  --status-soon: #E0A020;
  --status-soon-bg: #FCEEDB;
  --status-soon-fg: #8A610D;

  --status-ok: #3C9D53;
  --status-ok-bg: #E7F5EA;
  --status-ok-fg: #2F7D46;

  /* ausencia de dado, nao e status de validade */
  --status-unknown: #9FAEB8;
  --status-unknown-bg: #F1F3F5;
  --status-unknown-fg: #5C6F7C;

  /* foco e elevacao */
  --focus-ring: #354451;
  --shadow-card: 0 1px 2px rgba(28, 38, 46, 0.06), 0 4px 12px rgba(28, 38, 46, 0.04);

  /* forma */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
}

.dark {
  --bg-page: #141A1F;
  --bg-surface: #1E262C;
  --bg-surface-raised: #263037;
  --border: #3A444C;

  --fg: #EDEFF0;
  --fg-muted: #8AA0AC;
  --fg-disabled: #4A5560;

  --primary: #8AA0AC;
  --primary-hover: #9FAEB8;
  --primary-pressed: #DCE1E6;
  --primary-fg: #141A1F;

  /* o solido nao muda. O que muda e o fundo e o texto do chip */
  --status-expired-bg: #552E32;
  --status-expired-fg: #F5B4B4;

  --status-soon-bg: #513F20;
  --status-soon-fg: #F4D28C;

  --status-ok-bg: #2A4733;
  --status-ok-fg: #9BDAAE;

  --status-unknown: #5C6F7C;
  --status-unknown-bg: #39464F;
  --status-unknown-fg: #B4C4CE;

  --focus-ring: #9FAEB8;
  --shadow-card: none;
}
```

### Por que o tema escuro redefine o fundo dos chips

No tema claro o fundo do chip e um pastel do tom solido. Se esse pastel continuasse valendo no escuro, cada chip viraria uma mancha clara na tela. Entao o escuro troca fundo e texto por um par proprio: fundo escuro tingido, texto claro do mesmo matiz.

O tom solido nao muda em tema nenhum, porque ele identifica o status em ponto, barra e preenchimento.

### Contraste verificado

| Par | Claro | Escuro |
| --- | --- | --- |
| Chip Vencido, texto sobre fundo | 4,97:1 | 6,62:1 |
| Chip A vencer, texto sobre fundo | 4,84:1 | 6,94:1 |
| Chip No prazo, texto sobre fundo | 4,50:1 | 6,37:1 |
| Chip Sem validade, texto sobre fundo | 4,70:1 | 5,42:1 |
| Texto de apoio sobre superficie | 5,22:1 | 5,63:1 |
| Botao primario, texto sobre fundo | 10,01:1 | 6,44:1 |

Todos passam em AA para corpo de texto. O `--status-soon-fg` era `#8A610D`, que dava 4,41:1 e reprovava. Corrigido para `#8A610D` em 16/09.

---

## 4. Tailwind

O projeto usa **Tailwind v4**, que nao tem `tailwind.config.ts`. Os tokens sao expostos ao Tailwind pelo bloco `@theme inline`, dentro do proprio `globals.css`, apontando para as CSS variables acima.

```css
@theme inline {
  --color-page:    var(--bg-page);
  --color-surface: var(--bg-surface);
  --color-raised:  var(--bg-surface-raised);
  --color-line:    var(--border);

  --color-fg:          var(--fg);
  --color-fg-muted:    var(--fg-muted);
  --color-fg-disabled: var(--fg-disabled);

  --color-primary:         var(--primary);
  --color-primary-hover:   var(--primary-hover);
  --color-primary-pressed: var(--primary-pressed);
  --color-primary-fg:      var(--primary-fg);

  --color-status-expired:    var(--status-expired);
  --color-status-expired-bg: var(--status-expired-bg);
  --color-status-expired-fg: var(--status-expired-fg);

  --color-status-soon:    var(--status-soon);
  --color-status-soon-bg: var(--status-soon-bg);
  --color-status-soon-fg: var(--status-soon-fg);

  --color-status-ok:    var(--status-ok);
  --color-status-ok-bg: var(--status-ok-bg);
  --color-status-ok-fg: var(--status-ok-fg);

  --color-status-unknown:    var(--status-unknown);
  --color-status-unknown-bg: var(--status-unknown-bg);
  --color-status-unknown-fg: var(--status-unknown-fg);
}
```

Isso gera as classes `bg-surface`, `text-fg-muted`, `bg-status-expired-bg`, `text-status-expired-fg`, `border-line` e assim por diante.

**Nota de nome:** o token de borda se chama `line` e nao `border`, porque `border` ja e o nome de uma familia de utilitarios do Tailwind e a colisao produz classe ambigua.

---

## 5. Tipografia

Duas famílias desde 08/10/2026: **Mona Sans** para exibição (título de página e número herói) e **Inter** para interface e dado, com algarismos tabulares. Escala, famílias e motivo na seção 14.1.

---

## 6. O que herdamos da primeira referência visual

> **Substituída em 07/10/2026 pela referência MT, seção 12.** Mantida como histórico. A pill de navegação no topo, o herói Ardósia e o layout da seção 7 não valem mais.

A referência é um dashboard financeiro escuro, com cartões grandes, cantos muito arredondados e navegação em pill. O que aproveitamos e o que descartamos:

**Aproveitar:**

- Navegação principal em **pill flutuante** no topo, com o item ativo em cápsula preenchida
- Cantos generosos: `--radius-lg` e `--radius-xl` nos cards grandes
- Um **card herói** grande, dominando a coluna esquerda no topo
- Cards de métrica secundários empilhados à direita do herói
- **Painel lateral direito** dedicado a um bloco de informação de acompanhamento
- Gráfico de barras e gráfico de rosca lado a lado, cada um em seu card
- Lista compacta com ícone, rótulo, valor e menu de três pontos na base da página
- Busca, sino de notificação e avatar agrupados no canto superior direito

**Descartar:**

- Gradientes neon e vidro fosco. O Valide é ferramenta de trabalho de balcão, usada oito horas por dia, não landing page.
- **O card herói verde da referência.** Verde é status de "no prazo" no Valide. O herói usa Ardósia.
- Logos de marcas de terceiros na interface.

---

## 7. Adaptação do layout para a Home do Valide

> **Substituída em 08/10/2026.** A Home tem quatro blocos em uma coluna principal, sem painel lateral. Estrutura em `03-specs/redesign-hierarquia.md`, seção 5.1, e regras na seção 14. O desenho abaixo é histórico.

```
┌─────────────────────────────────────────────────────────────┐
│  logo   [ Home  Estoque  Configurações ]      🔍  🔔  avatar │
├──────────────────────────────────┬──────────────────────────┤
│  Painel de validade              │  Central de notificações │
│  ┌────────────────┐ ┌──────────┐ │  ┌────────────────────┐  │
│  │ HERÓI          │ │ Vencido  │ │  │ estoque mínimo     │  │
│  │ Valor parado   │ │   12     │ │  │ alteração de outro │  │
│  │ em risco       │ ├──────────┤ │  │ usuário            │  │
│  │ R$ 4.280,00    │ │ A vencer │ │  │ aviso do sistema   │  │
│  │ [Ver produtos] │ │   37     │ │  └────────────────────┘  │
│  └────────────────┘ └──────────┘ │                          │
│  ┌──────────────┐ ┌────────────┐ │  Ações rápidas           │
│  │ Vencimentos  │ │ Divisão    │ │  [+ Adicionar produto]   │
│  │ por semana   │ │ por pasta  │ │  [→ Registrar saída]     │
│  │ (barras)     │ │ (rosca)    │ │                          │
│  └──────────────┘ └────────────┘ │  Próximos a vencer       │
│                                  │  lista compacta          │
│  Movimentações recentes                                     │
│  tabela compacta                                            │
└─────────────────────────────────────────────────────────────┘
```

**Decisão de conteúdo do herói:** em vez de "saldo total", o herói mostra **valor financeiro parado em produtos vencidos e a vencer**. Isso é o que prova o valor do produto em uma demonstração: o dono da farmácia vê, em reais, quanto está prestes a perder. É o número que faz o pitch do Eduardo funcionar.

O card do herói usa Ardósia 700 como fundo com texto claro. O número grande, o rótulo acima e um botão de ação abaixo.

---

## 8. Componentes de domínio

> **Revista em 08/10/2026.** Saem `ExpiryIndicatorCard`, `HeroValueCard`, `QuickAction`, `NotificationItem` como painel, `PendingExpiryCard` e o `StatTile`. Entram, na issue 008:
>
> | Componente | Arquivo | O que faz |
> | --- | --- | --- |
> | `Metric` | `ui/metric.tsx` | Anatomia única de indicador: rótulo, número (`hero`, `metric`, `section`), contexto. Status opcional põe o ícone no rótulo. `fullValue` leva o valor completo ao `title` e ao leitor de tela quando o exibido é arredondado |
> | `StatusSummary` | `dashboard/status-summary.tsx` | Faixa dos quatro estados, cada segmento um link. Vencido e A vencer em `metric`, os outros em `section`, alinhados pela base |
> | `ExpiryWeekChart` | `dashboard/expiry-week-chart.tsx` | Padrão de gráfico da 14.5. A conclusão do título vem de `expiryWeekHeadline` (`dashboard/expiry-week-headline.ts`) |
> | `TabsNav` | `ui/tabs-nav.tsx` | Abas com sublinhado, uma rota por aba |
>
> `StatTile` e `Money` saíram na issue 011, com o detalhe do produto, que era o último uso. A frase de situação do detalhe é `LotSituation` e a tabela de lotes é `LotsTable` (`products/`).
>
> A tabela abaixo é o registro anterior.

| Componente | O que faz |
| --- | --- |
| `StatusChip` | Chip de validade com cor mais ícone mais rótulo. Recebe `status: 'expired' \| 'soon' \| 'ok' \| 'unknown'` |
| `ExpiryIndicatorCard` | Card de contagem de um status, clicável, leva para a listagem filtrada |
| `HeroValueCard` | Card herói com valor em risco |
| `ProductRow` | Linha de produto na tabela, com lote, validade e chip de status |
| `LotBadge` | Identificação de lote com data de validade |
| `QuickAction` | Botão de atalho do painel lateral |
| `NotificationItem` | Item da central de notificações |
| `EmptyState` | Estado vazio padronizado, com ícone, frase e ação |
| `PendingExpiryCard` | Card do dashboard com a contagem de produtos sem validade e a ação de preencher |
| `ImportSourcePicker` | Escolha entre arquivo, integração e cadastro manual |
| `ColumnMapper` | Mapeamento de colunas do arquivo para os campos do Valide |
| `ImportPreviewTable` | Revisão do que vai entrar, com marcação de linha problemática |
| `QuickFillForm` | Formulário enxuto da fila de validades: lote, validade, quantidade, próximo |

---

## 9. Função de status

Regra única, em um lugar só, usada por toda a aplicação:

```ts
// src/lib/utils/expiry.ts
export type ExpiryStatus = 'expired' | 'soon' | 'ok' | 'unknown'

export const DEFAULT_SOON_THRESHOLD_DAYS = 30 // fechado pela equipe em 16/09

export function getExpiryStatus(
  expiryDate: Date | null | undefined,
  soonThresholdDays = DEFAULT_SOON_THRESHOLD_DAYS,
  today = new Date()
): ExpiryStatus {
  if (!expiryDate) return 'unknown'
  const days = differenceInCalendarDays(expiryDate, today)
  if (days <= 0) return 'expired'   // o dia do vencimento já é Vencido, desde 08/10
  if (days <= soonThresholdDays) return 'soon'
  return 'ok'
}
```

O `null` precisa entrar na assinatura, não ser tratado fora. Produto importado sem lote é o caso comum depois da importação, não uma exceção. Se a checagem ficar espalhada pelas telas, uma delas vai esquecer e mostrar verde onde não há dado.

Nunca duplicar essa lógica dentro de um componente. Se a equipe mudar a janela de dias, muda em um arquivo só.

---

## 10. Espaçamento e grade

- Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48
- Padding interno de card: 24px no desktop, 16px no mobile
- Espaço entre cards: 16px
- Largura máxima de conteúdo: 1440px, centralizado
- Grade da Home: 12 colunas, sem painel lateral desde 08/10/2026. Lista com 7, gráfico com 5
- Espaço entre seções e dentro delas: seção 14.7

---

## 11. Sombra e elevação

> **Botão principal (11/10/2026, issue 066, item 32):** o primário tem a sombra curta `shadow-button` (`--elevation-button`): `0 1px 2px` com o matiz da tinta no claro (16%) e preta a 40% no escuro. Nenhum outro botão tem sombra.

> **Revista de novo em 09/10/2026 (direção A).** Todo `Card` volta a ter sombra curta, `shadow-card`, nos dois temas. Os valores abaixo são de antes de 08/10 e não valem mais: os atuais estão na seção 15. Entre 08/10 e 09/10, card não tinha sombra.

Tema claro usa sombra suave. Tema escuro usa diferença de superfície, não sombra.

```css
--shadow-card: 0 1px 2px rgba(28, 38, 46, 0.06), 0 4px 12px rgba(28, 38, 46, 0.04);
```

No tema escuro, `--shadow-card: none` e a separação vem de `--bg-surface-raised`.


---

## 12. Linguagem visual MT (07/10/2026)

> **Revista em 08/10/2026.** Continuam valendo: um matiz só, trilho lateral, o acento nunca como status, os contrastes conferidos. **Deixam de valer:** vidro azul, pilha de abas, recorte de canto, lista em faixa com ícone em círculo, caixa alta de 11px, raio de 22px, centavos esmaecidos e a regra de algarismos proporcionais. Motivo e substitutos na seção 14.

Referência e estudo completos em `visual-ref/README.md`. Aqui ficam as regras que saíram dela.

### Um matiz só

A interface inteira é azul-ardósia, do quase preto (`#111923`) ao céu (`#81BDFA`). **Nenhuma outra cor aparece, a não ser as de validade.** Com isso, vermelho, amarelo e verde são as únicas cores saturadas da tela e chamam atenção sem precisar de tamanho.

| Papel | Token | Claro | Escuro |
| --- | --- | --- | --- |
| Fundo da página | `--bg-page` | `#EDF1F5` | `#18212D` |
| Card | `--bg-surface` | `#FFFFFF` | `#212D3D`, com degradê sutil até `#1F2A39` |
| Texto | `--fg` | `#142030` | `#EEF3F8` |
| Texto de apoio | `--fg-muted` | `#536980` | `#9CB0C4` |
| Ação principal | `--primary` | navy `#22344B`, texto branco | céu pálido `#CDE4FD`, texto escuro |
| Acento | `--accent` | `#2B67A8` | `#81BDFA` |
| Trilho | `--rail` | `#17212D` | `#111923` |
| Vidro azul | `--glass-from` / `--glass-to` | `#46668A` para `#2B3D54` | igual |

O acento marca item ativo, link, foco e aviso não lido. **Nunca status.**

### Elementos de assinatura

| Elemento | Onde | Regra |
| --- | --- | --- |
| Trilho lateral | shell, desktop | escuro nos dois temas. Ícone com rótulo embaixo, nunca só ícone. Desde a 066: oito destinos (Início, Estoque, Validades, Movimentos, Calendário, Avisos, Perdas, Ajustes), Ajuda e tema embaixo; cabe em 800px de altura e rola abaixo disso. No celular, barra de baixo com seis (Início, Estoque, Validades, Perdas, Ajustes, Ajuda) |
| Número herói | topo da Home | rótulo em caixa alta (`text-eyebrow`, 11px), número com centavos esmaecidos (`<Money>`) |
| Pilha de abas em vidro | Home, filas de hoje | só ela usa `.glass`. Uma aba aberta por vez, acordeão com `aria-expanded` |
| Recorte de canto | Home, próximos a vencer | `.notch-tr`. **No máximo um por tela.** O botão fica fora do elemento recortado |
| Lista em faixa | listas da Home | ícone em círculo, duas linhas, valor à direita, faixa clara no hover |

### Números

`.tnum` não usa mais algarismos tabulares. Na Mona Sans eles têm desenho de fonte monoespaçada, com zero pontilhado, e data de validade parecia código. Ficam proporcionais alinhados na base.

### Contraste conferido

| Par | Contraste |
| --- | --- |
| Texto de apoio sobre card, claro | 5,68:1 |
| Texto de apoio sobre card, escuro | 6,25:1 |
| Texto branco sobre o lado claro do vidro | 5,95:1 |
| Texto de apoio sobre o lado claro do vidro | 4,79:1 |
| Rótulo inativo do trilho | 6,12:1 |
| Rótulo ativo do trilho | 7,42:1 |
| Botão claro sobre o vidro | 12,49:1 |
| Barras do gráfico (`chart-3`) contra o card | acima de 3:1 nos dois temas |

### Forma

Raio do card subiu para 22px (`--radius-lg`). Escala tipográfica ganhou `text-eyebrow` (11px, caixa alta, espaçamento 0,08em) e o herói foi para 48px.

---

## 13. Grade, simetria e responsividade (07/10/2026)

Saídas da auditoria visual da issue 004. O procedimento de auditoria e o checklist completo estão na skill `design-valide`.

1. **Tudo começa na margem do título.** Nada centralizado com largura máxima dentro da área logada, exceto estado vazio.
2. **Coluna curta não termina antes da metade da longa.** Junte cards soltos numa ficha só, ou suba um resumo para uma faixa de indicadores (`StatTile`) no topo.
3. **Linha de chips nunca quebra.** Rola na horizontal dentro do próprio trilho. No estoque, os filtros ficam em duas linhas rotuladas, Situação e Pasta, dentro do card da tabela.
4. **Rótulo de indicador nunca é truncado.** No celular, o ícone sobe para cima dele.
5. **Abaixo de `sm`**, ações do cabeçalho de página ocupam a largura inteira, ações de linha viram ícone com nome acessível, e assistente vira "Etapa 1 de 4" com barra.
6. **Controle que parece clicável funciona.** A escolha de tema do perfil passou a funcionar e acompanha o botão do trilho.
7. **Uma busca por tela.** A busca do topo pesquisa no estoque e some na própria tela de estoque.

---

## 14. Hierarquia e padrão de dados (08/10/2026)

Saída da auditoria `06-validations/auditoria-hierarquia.md`. SPEC completa, com a estrutura de cada tela, em `03-specs/redesign-hierarquia.md`. Decisão em `07-decisions/ux-decisions.md`, 08/10/2026.

### 14.0 Três níveis de leitura

Toda tela tem leitura em três camadas. Teste: olhar a tela por dois segundos, desviar, e saber dizer qual é o número ou o item mais importante.

| Nível | O que é | Como se diferencia |
| --- | --- | --- |
| 1 | A resposta da tela. **Um só por tela** | Maior tamanho, mais peso, topo à esquerda |
| 2 | O contexto para agir | Tamanho médio, logo abaixo |
| 3 | Detalhe e apoio | Texto menor, `fg-muted`, mais abaixo ou atrás de um clique |

A hierarquia se faz com tamanho, peso, espaço e posição. Cor é o último recurso e quase toda reservada a status. Cada tela tem **um** botão cheio (ação primária); o resto é secundário (contorno) ou terciário (link).

### 14.1 Tipografia

> **Ajustada em 09/10/2026 (direção A, seção 15):** `hero` passou a 60/60, e os títulos de página e de card, o número herói e o número dos cartões de estado vão em Mona Sans negrito (700 e 800). A tabela abaixo continua valendo para a Inter.

| Token | Tamanho | Peso | Família | Uso |
| --- | --- | --- | --- | --- |
| `hero` | 48/52 | 600 | Mona Sans | Número de nível 1. Só um por tela, e só na Home |
| `display` | 32/38 | 600 | Mona Sans | Título de página. 24px abaixo de `md` |
| `metric` | 28/32 | 600 | Inter, tabular | Número de nível 2 |
| `section` | 18/24 | 600 | Inter | Título de seção, nome do produto em foco |
| `body` | 14/20 | 400 e 500 | Inter | Texto, célula de tabela |
| `label` | 13/18 | 500 | Inter | Rótulo de indicador e de campo, cabeçalho de tabela |
| `micro` | 12/16 | 400 | Inter | Metadado em segunda linha. Nunca informação que decide |

Saem `eyebrow` (11px, caixa alta) e `card` (16px).

**Por que duas famílias.** Medido em 08/10/2026 no arquivo da fonte: com algarismos tabulares ligados, a Mona Sans usa um zero com ponto no meio (`zero.tf`, três contornos) e um "1" com base. É desenho de fonte de código e não há recurso OpenType para desligar. A Inter alinha as colunas com o zero normal. Então a Mona Sans fica onde o número é grande e sozinho (proporcional é o certo nesse tamanho), e a Inter fica onde o número se compara em coluna ou muda no lugar.

**Número em Inter usa `.tnum`** (algarismos tabulares): quantidade, dinheiro, data e hora, contagem. **Nunca em identificador** (código interno, lote, código de barras, CNPJ, CEP, telefone, nome de arquivo): na Inter, o tabular também alarga o hífen, e "MED-1040" vira "MED - 1040". Medido em 08/10. Dentro de `.font-display` os algarismos ficam proporcionais, mesmo com `.tnum`.

### 14.2 Anatomia única de indicador (`Metric`)

```
Rótulo     label, 500, fg-muted
Número     hero | metric | body, 600, fg, tabular
Contexto   label, fg-muted
```

- Sem ícone decorativo, sem fundo, sem borda própria. Alinhado à esquerda.
- Indicador de status: o rótulo leva o ícone do status (14px) na cor sólida dele. Cor, ícone e rótulo continuam juntos.
- O número nunca é colorido.

### 14.3 Faixa de resumo de status (`StatusSummary`)

> **Substituída em 09/10/2026 (direção A, seção 15.3):** a faixa virou quatro cartões de estado, 2 por 2, com faixa colorida no topo. O texto abaixo registra a versão de 08/10.

Os quatro estados num contêiner, em segmentos separados por linha fina, sempre na ordem Vencido, A vencer, No prazo, Sem validade.

- Vencido e A vencer com número em `metric`; No prazo e Sem validade em `section`. O peso segue a urgência.
- Contagem zero: segmento em `fg-muted`, ícone sem cor.
- Cada segmento é link para o estoque filtrado. Sem validade leva para a fila e mostra o valor parado com a ação "Informar validades".
- Sem barra de proporção, sem porcentagem.
- Quatro lado a lado a partir de `md`; 2 por 2 abaixo.

### 14.4 Formatos de dado

| Dado | Formato | Função em `format.ts` |
| --- | --- | --- |
| Dinheiro em indicador | R$ 8.573 (reais inteiros, nunca "mil") | `formatMoneyWhole` |
| Dinheiro em tabela, detalhe, formulário | R$ 8.572,67 | `formatMoney` |
| Data de validade | 05/10/2026, em toda a interface | `formatDate` |
| Distância até a validade | vence em 12 dias, venceu há 3 dias | `formatExpiryDistance` |
| Evento (movimentação, aviso, importação) | 9 out, 14:22; com ano se não for o corrente | `formatEventTime` |
| Eixo de gráfico | 20 out | `formatAxisDay` |
| Quantidade | 14 un, 2,5 kg. Sempre com unidade | `formatQuantity` |
| Movimentação | +24 un, −6 un (menos tipográfico, U+2212) | `formatQuantity` |
| Separador de metadado | ponto médio: MED-1040 · Neo Química | |

Data de validade fica em números porque é assim que vem impressa na embalagem, e o balconista compara uma com a outra. Em tabela, toda coluna numérica alinha à direita.

**Fuso.** Validade é data: lida em UTC, nunca muda de dia. Evento é instante: mostrado no fuso da farmácia. "Hoje", para contar dias até a validade, é o dia do calendário da farmácia (`calendarToday()`), não o dia em UTC. O fuso (`DEFAULT_TIME_ZONE`, `America/Sao_Paulo`) mora em `src/lib/utils/calendar.ts` até o fuso da conta chegar aos componentes. Testes em `format.test.ts`, `calendar.test.ts` e `expiry.test.ts`.

### 14.5 Padrão de gráfico

> **Mudou em 09/10/2026 (direção A):** no gráfico de vencimentos por semana, as semanas dentro da janela de A vencer são âmbar (`--chart-soon`), e o pico dentro dela, `--chart-soon-focus`. Fora da janela, a base neutra. É a linha "Cor de status só quando a barra representa aquele status" aplicada: os lotes dessas semanas são A vencer. E o gráfico passou a ficar em card, com título e legenda. Gráfico que não fala de validade continua como na tabela abaixo.

| Regra | Valor |
| --- | --- |
| Base | `--chart-base`, Ardósia clara neutra |
| Destaque | `--chart-focus`, Ardósia escura, só onde o dado pede. Um por gráfico, dois se houver empate |
| Cor de status | Só quando a barra representa aquele status |
| Rótulo | Valor em cima de cada barra. Com rótulo direto, sem eixo Y e sem grade |
| Eixo X | `label`, `fg-muted`, sem linha |
| Barra | raio de 4px só no topo, até 32px de largura |
| Contêiner | nenhum. O gráfico fica na página, sob o título da seção |
| Título | diz a conclusão, calculada do dado ("A semana de 20 out concentra 6 lotes"). O tipo de dado vai no contexto |
| Rosca e pizza | Pizza não se usa. **Rosca, desde 12/10 (issue 067, decisão do Marcus):** só para a parte de cada pasta nos produtos em risco, no Início. Até cinco fatias (quatro pastas e "Outras pastas"), da maior para a menor a partir do alto, em `--chart-share-1` a `4` (tons da tinta) e a última na base neutra; total no meio; legenda ao lado com número e porcentagem, que é o que se lê. Outra distribuição por categoria continua em barra horizontal |

### 14.5.1 Tokens de gráfico, contraste conferido

| Token | Claro | Escuro | Contra o fundo da página | Contra o destaque |
| --- | --- | --- | --- | --- |
| `--chart-base` | `#93A7BC` | `#4B6079` | 2,18:1 claro, 2,51:1 escuro | 5,11:1 claro, 4,96:1 escuro |
| `--chart-focus` | `#22344B` | `#CDE4FD` | 11,14:1 claro, 12,45:1 escuro | |

A base fica abaixo de 3:1 de propósito: com o valor escrito em cima de cada barra, a barra não é o único meio de ler o dado (WCAG 1.4.11 exige 3:1 só do que é necessário para entender). Ela precisa ser vista, não disputar com o destaque.

`chart-1` a `chart-6` (rampa antiga) saíram na issue 009, com a rosca.

### 14.6 Forma, contêiner e elevação

> **Mudou em 09/10/2026 (direção A, seção 15):** todo `Card` tem `shadow-card`, e tabela, lista, formulário, gráfico e o indicador principal ficam em card. A sombra flutuante continua `shadow-pop`. Os dois primeiros itens abaixo registram a regra de 08/10, que não vale mais.

- **Card:** raio `--radius-md` (14px), borda 1px `line`, sem sombra, fundo liso. Só para o que é clicável, tabela, lista e formulário. Indicador e gráfico ficam direto na página.
- **Sombra:** só em camada flutuante (menu, popover, dica).
- **Pílula:** botão, chip e selo. Aba de seção usa sublinhado; etapa de assistente usa número e texto. Três funções, três desenhos.
- **Saíram do CSS na issue 006:** `.surface-card` (o card usa `bg-surface`), `shadow-card`, `text-eyebrow`, `text-card`, raio de 22px. `--radius-lg` e `--radius-xl` estão desligados no tema (`initial`), para `rounded-lg` não voltar com o valor padrão do Tailwind.
- **Saíram na issue 009:** `.glass`, `.glass-tab`, `.notch-tr` e os tokens de vidro, com a pilha de filas e o card com recorte de canto, que eram os únicos usos.

### 14.7 Espaço

| Onde | Valor |
| --- | --- |
| Entre seções | 48px desktop, 32px celular |
| Título de seção até o conteúdo | 12px |
| Dentro de card | 24px desktop, 16px celular |
| Itens de lista | sem espaço, separados por linha |

Espaço entre seções maior que dentro delas: a proximidade mostra o que pertence a quê.

### 14.8 Cor de erro

`--error`, `--error-bg` e `--error-fg` apontam para os mesmos valores de `--status-expired`, `-bg` e `-fg`. Classes: `text-error-fg`, `bg-error-bg`, `border-error`. Contraste: texto de erro sobre o fundo de erro 4,97:1 claro e 6,62:1 escuro; sobre branco, 5,90:1. Não existe segundo vermelho (decisão de 16/09 mantida).

Vermelho significa **problema que exige ação**: lote Vencido, ou erro que impede continuar (campo inválido, login recusado, linha da importação que não entra). Sempre com ícone e texto, nunca só cor. Aviso e sucesso são neutros. Botão destrutivo continua neutro.

### 14.9 Sinais de interface gerada

> **Foto, desde 12/10/2026 (issue 067, decisão do Marcus):** uma foto por tela, num cartão de conteúdo que leva a algum lugar (no Início, a dica da Ajuda), com o texto numa faixa sólida da cor do trilho por cima. Nunca degradê sobre a foto, nunca foto só de enfeite ao lado de número. A variação semanal do valor em risco fica em pílula neutra; vermelho e verde continuam só de validade.

> **Placar, desde 13/10/2026 (issue 072, decisão do Marcus em 12/10):** na fila de validades pendentes, "N seguidas" numa pílula `bg-primary-soft` com texto `accent-strong`, ao lado de "Produto X de Y"; a linha do salvo em `bg-primary-soft` com o ícone em `accent`; a cada 10 seguidas, troféu em `accent` e "Muito bem!". Cor da marca, nunca verde ou vermelho (são de validade), e sem animação: a fila é trabalho repetido. É a única tela com comemoração.

Não usar: grade de blocos do mesmo peso sem um dominante; ícone em círculo ou quadrado colorido em todo item; sombra, borda e raio grande em todo bloco; degradê, vidro, brilho; selo e pílula em excesso; frase de boas-vindas; ícone que se repete igual em toda linha; texto de apoio que repete o título; caixa alta espaçada como rótulo; controles de funções diferentes com o mesmo desenho.

### 14.10 Texto de exemplo nos campos (placeholder)

Revisto em 09/10/2026 (issue 015).

- **Cor `fg-muted`**: 5,68:1 sobre `surface` no claro e 6,25:1 no escuro. O WCAG trata placeholder como texto, e até 09/10 ele usava `fg-disabled`, com 2,53:1 e 2,66:1.
- **Placeholder nunca substitui rótulo nem dica.** O que a pessoa precisa saber para preencher vai no `hint` do `Field`, que não some ao digitar.
- **Exemplo de texto leva "Ex.:"** na frente ("Ex.: Neo Química"). Com o contraste certo, um exemplo sem prefixo parece campo já preenchido, e a pessoa pula o campo (NN/g, "Placeholders in Form Fields Are Harmful").
- **Número de exemplo não existe.** "20", "R$ 7,42" ou "0" dentro do campo se confundem com valor. O campo fica vazio, e a dica diz o que vale ("Estoque atual: 14 un").
- **Máscara de formato fica**: "00.000.000/0000-00", "00000-000", "(00) 0000-0000". Ninguém lê uma máscara como valor.
- **Senha sem "••••••••".** Leva `autoComplete` (`current-password` ou `new-password`) para o gerenciador de senhas.

---

## 15. Direção visual A, "Painel de controle" (09/10/2026)

Escolhida pelo Marcus no canvas https://claude.ai/artifact/RLXcrJF58R4R5ih9H2qR49, depois de achar o visual de 08/10 "muito fraco". SPEC completa em `03-specs/direcao-visual-a.md`; aplicada a todas as telas nas issues 017 a 025. Onde esta seção e a 14 discordam, vale esta.

A hierarquia da seção 14 continua: um nível 1 por tela, uma ação primária, o vocabulário fixo. O que muda é a força visual.

### 15.1 As cinco regras

1. **Dois planos nítidos.** Fundo `page`, conteúdo em `Card` com borda e `shadow-card`. Camada flutuante continua com `shadow-pop`
2. **Status com presença, em três formas e só nelas:** faixa de 5px no topo do cartão de um estado; barra de 4px a 5px à esquerda de cada linha de lista ou tabela; fundo tingido (`status-*-tint`) só nos cartões de Vencido e A vencer com contagem acima de zero. O texto de distância ("venceu há 13 dias") vai na cor de texto do estado; o número fica em `fg`
3. **Tipografia com escala.** Mona Sans (`font-display`) em negrito no título de página, no título de card (`CardTitle`), no número herói e no número dos cartões de estado (36 a 44px). Nome de produto em semibold. Inter no resto
4. **Cabeçalho que situa.** Título em `font-display` e uma linha de contexto (a data e a farmácia na Home; a contagem no Estoque)
5. **Gráfico pinta pelo estado quando o dado é de estado** (seção 14.5, nota de 09/10)

### 15.2 Tokens

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--elevation-card` / `shadow-card` | `0 1px 3px rgb(16 24 40 / .08), 0 1px 2px rgb(16 24 40 / .04)` | `0 1px 2px rgb(0 0 0 / .30)` | Todo `Card` |
| `--status-expired-tint` | `#fff6f6` | `#2e2328` | Fundo do cartão de Vencido |
| `--status-soon-tint` | `#fffbf3` | `#2d2820` | Fundo do cartão de A vencer |
| `--chart-soon` | `--status-soon` | idem | Semana dentro da janela de A vencer |
| `--chart-soon-focus` | `#b97f0c` | `#f0bf55` | Pico dentro da janela |
| `--text-hero` | 60/60 | idem | Valor em risco |

### 15.3 Padrões

| Padrão | Componente | Onde |
| --- | --- | --- |
| Cartão de estado (faixa no topo, tinta nos urgentes, link) | `StatusSummary` | Home |
| Cartão de situação (faixa no topo, tinta por estado, indicadores abaixo de um fio) | `LotSituation` | Detalhe do produto |
| Lista de lotes com barra à esquerda | `LotList` | Home |
| Tabela com barra de estado na primeira célula e distância na cor do estado | `ProductTable`, `LotsTable` | Estoque, Detalhe |
| Card com cabeçalho (título em `font-display`, ação à direita, fio embaixo) | `LotList`, `SettingsSection`, `CardHead` | Toda lista, tabela e seção |
| Esqueleto de lista em card | `ListCardSkeleton` | Carregamento da Home, do Detalhe e da Fila |

### 15.4 Cuidados que apareceram na execução

- **`twMerge` e a barra de estado.** Uma cor de borda nos quatro lados (`border-primary`, `border-line`) que vem depois na lista de classes apaga `border-l-status-*` ou `border-t-status-*`. A classe da barra vai por último (issue 024)
- **Esqueleto mostra a cor só quando ela não depende do dado.** A faixa dos cartões de estado e a barra das duas listas da Home têm cor fixa pela posição, então aparecem no carregamento. A tinta depende da contagem, e o estado do produto só vem com o dado: no esqueleto, ficam neutros (issue 025)
- **Não voltam:** vidro, degradê, recorte de canto, ícone em quadrado decorativo, caixa alta espaçada (seção 14.9)

### 15.5 Cartão principal da Home e referências do Behance (issue 027)

A partir de 09/10/2026, as telas novas e as reconstruídas partem de projetos bem avaliados do Behance, citados na issue de cada tela.

A Home segue o padrão que se repete no Gyle (690 curtidas), no Pharmly (356) e no Vault (221): o indicador principal num cartão cheio e escuro, os outros na mesma fileira em branco.

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--feature` / `bg-feature` | `#17212d` (a cor do trilho lateral) | `#30425a` | Fundo do cartão principal. No escuro fica um tom acima do card (`#212d3d`), porque um cartão mais escuro que os outros pareceria afundado |
| `--feature-fg` | `#e8eef5` (13,9:1) | `#eef3f8` (9,2:1) | Texto do cartão |
| `--feature-muted` | `#8da1b6` (6,1:1) | `#b4c6d9` (5,9:1) | Rótulo e apoio |
| `--feature-line` | `#2e3d50` | `#44597a` | Esqueleto dentro do cartão |

Botão `inverse` (`bg-feature-fg text-feature`): a ação primária dentro do cartão cheio, onde o primário comum desapareceria. Só um cartão cheio por tela, e só para o nível 1.

---

## 16. Identidade Petróleo (11/10/2026, issue 061)

Pesquisa, ranking e comparação em `docs/04-issues/061-identidade-petroleo.md`. Cores de status não mudaram.

### 16.1 Tokens

| Token | Claro | Escuro | Contraste |
| --- | --- | --- | --- |
| `--bg-page` | `#eff4f2` papel menta | `#0b1716` | |
| `--bg-surface` | `#ffffff` | `#112221` | |
| `--bg-sunken` | `#e4ece9` | `#081211` | |
| `--line` / `--line-strong` | `#d9e3df` / `#bfcdc8` | `#1f3533` / `#2c4a47` | |
| `--fg` | `#0f2423` | `#e8f2ef` | 14,6:1 no fundo / 16,0:1 |
| `--fg-muted` | `#4e6461` | `#9bb5b0` | 5,7:1 no fundo, 5,3:1 no afundado / 7,6:1 |
| `--primary` | `#0e3b3a` petróleo, texto branco | `#bfe6e8` água, texto `#0b2928` | 12,3:1 / 11,5:1 |
| `--accent` (link, foco) | `#11706a` | `#6fd3c0` | 5,3:1 no fundo / 9,2:1 |
| `--rail`, `--feature` | `#0b2928` | `#071211`, `#1b3836` | texto 13,4:1, apoio 6,2:1 |
| `--mint` / `--mint-fg` | `#a6ebd9` / `#0b2928` | iguais | 11:1 |

**Distância do verde de status:** o petróleo tem matiz ~178° e luminância baixa; o verde de No prazo, ~134° e médio. No escuro, o primário é água (183°), não menta, porque menta ficaria a 1,2:1 do texto do chip No prazo.

### 16.2 Regras

1. **Menta só sobre o escuro:** trilho (item ativo e logo), botão do cartão cheio (`inverse`), segunda metade do título do login. Nunca em fundo claro, nunca ao lado de chip de status
2. **Uma família:** Instrument Sans em tudo; hierarquia por peso (400, 500, 600, 700) e tamanho. `font-display` só marca título e número herói (número proporcional)
3. **Cartão de estado sem faixa no topo:** ícone e rótulo na cor do estado, fundo tingido só nos urgentes com contagem. Na Home, 2 por 2 ao lado do cartão cheio, com linhas de mesma altura (`auto-rows-fr`)
4. **Sombra com o matiz da marca:** `rgb(11 41 40 / …)` em vez do azul de antes

---

## 17. Cobalto sobre papel (11/10/2026, issue 064)

O petróleo da seção 16 durou um dia: o Marcus preferiu azul. Quatro azuis foram aplicados nas telas reais (Azul da Prússia, Cobalto sobre papel, Índigo e a Ardósia antiga) e ele escolheu o Cobalto. A tipografia e as regras 2 a 4 da seção 16 continuam; a regra 1 vale para a cor de assinatura no lugar da menta.

| Token | Claro | Escuro | Contraste |
| --- | --- | --- | --- |
| `--bg-page` | `#f5f4f0` papel | `#0f1220` | |
| `--bg-surface` | `#ffffff` | `#171b2c` | |
| `--bg-sunken` | `#ecebe5` | `#0b0e19` | |
| `--fg` | `#16181f` | `#eceef6` | 16,1:1 / 16,1:1 |
| `--fg-muted` | `#5a5e6b` | `#a3a9c2` | 5,9:1 no fundo, 5,4:1 no afundado / 7,3:1 no card |
| `--primary` | `#1a3a8f`, texto branco | `#c3d0ff`, texto `#121c3d` | 10,3:1 / 11,0:1 |
| `--accent` (link, foco) | `#2a55d0` | `#8fa8ff` | 5,8:1 / 7,5:1 |
| `--rail`, `--feature` | `#121c3d` | `#0b0e1a`, `#232a48` | texto 14,1:1 |
| `--signature` / `--signature-fg` | `#b7c8ff` / `#121c3d` | iguais | 10,1:1 |

O fundo de papel é levemente quente (matiz 51°) contra a tinta fria: é o que separa o Valide do cinza-azulado padrão de painel. O azul não é cor de status, então nada disputa com vermelho, âmbar e verde. Sombra com o matiz da tinta, `rgb(18 28 61 / …)`.
