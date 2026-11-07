# SPEC: Direção visual A, "Painel de controle"

**Status:** direção escolhida pelo Marcus em 09/10/2026 no canvas https://claude.ai/artifact/RLXcrJF58R4R5ih9H2qR49. Aplicada a todas as telas nas issues 017 a 025
**Depende de:** `redesign-hierarquia.md` (a hierarquia continua valendo; esta SPEC muda a força visual, não a estrutura)

---

## 1. Por que

Depois do redesign de 08/10, o Marcus achou o visual "péssimo, muito fraco" e marcou os quatro incômodos: sem cor e sem vida, parece inacabado, sem identidade, tipografia fraca. O diagnóstico:

- **Planos sem contraste.** Fundo da página e card quase da mesma cor, borda fina, sem sombra
- **Cor de status sem presença.** Ícone de 14px e chip miúdo. "5 vencidos" pesava o mesmo que "35 no prazo"
- **Escala tipográfica achatada.** Fora o número herói, tudo entre 13 e 18px, peso médio, cinza
- **Tela que termina no meio**, com gráfico e listas soltos no fundo

O redesign de 08/10 tirou os sinais de interface gerada e passou do ponto: tirou também a força. A direção A devolve a força sem devolver vidro, degradê, recorte ou ícone em quadrado.

## 2. As cinco regras da direção A

1. **Dois planos nítidos.** Fundo `page` e conteúdo em `Card` com borda e `shadow-card` (sombra curta). Tabela, lista, formulário, gráfico e indicador principal ficam em card. Camada flutuante continua com `shadow-pop`
2. **Status com presença, sempre semântica.** A cor de status aparece em três formas, e só nelas:
   - **faixa no topo** (5px) do cartão de um estado;
   - **barra à esquerda** (4px) de cada linha de lista ou tabela, com a cor do estado daquela linha;
   - **fundo tingido** (`status-*-tint`) só nos cartões de Vencido e A vencer com contagem acima de zero.

   O texto de distância ("venceu há 13 dias", "vence em 2 dias") vai na cor de texto do estado. O número continua em `fg`. Cor, ícone e rótulo juntos, como sempre
3. **Tipografia com escala.** Mona Sans (`font-display`) em negrito no título de página, no título de card e no número grande. Inter no resto. Nome de produto em semibold. Número de cartão de estado em 36 a 44px
4. **Cabeçalho que situa.** Toda tela abre com o título em `font-display` e uma linha de contexto (a data e a farmácia na Home; a contagem no Estoque)
5. **Gráfico pinta pelo estado quando o dado é de estado.** A semana dentro da janela de A vencer é âmbar, porque os lotes dela são A vencer; fora dela, a base neutra. Gráfico que não fala de validade continua neutro com destaque no pico

**Não muda:** paleta Ardósia, as quatro cores de status, o vocabulário fixo, a regra de erro em vermelho, "um nível 1 e uma ação primária por tela", formatos de dado, e a proibição de vidro, degradê e ícone em quadrado decorativo.

## 3. Tokens (já em `globals.css` desde a 017)

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--elevation-card` / `shadow-card` | `0 1px 3px rgb(16 24 40 / .08), 0 1px 2px rgb(16 24 40 / .04)` | `0 1px 2px rgb(0 0 0 / .30)` | Todo `Card` |
| `--status-expired-tint` | `#fff6f6` | `#2e2328` | Fundo do cartão de Vencido |
| `--status-soon-tint` | `#fffbf3` | `#2d2820` | Fundo do cartão de A vencer |
| `--chart-soon` | `--status-soon` | idem | Semana dentro da janela |
| `--chart-soon-focus` | `#b97f0c` | `#f0bf55` | Pico dentro da janela |
| `--text-hero` | 60px | idem | Valor em risco |

## 4. Padrões que se repetem

| Padrão | Onde está | Onde entra |
| --- | --- | --- |
| Cartão de estado (faixa no topo, tinta nos urgentes) | `StatusSummary` | Home; Estoque como faixa de filtro |
| Lista de lotes com barra à esquerda | `LotList` | Home; Detalhe do produto (lotes); Fila (a seguir) |
| Linha de tabela com barra de estado | `ProductTable`, `LotsTable` (018, 019) | Estoque, Detalhe (lotes), Revisão da importação não (não é validade) |
| Card com cabeçalho (título em `font-display`, ação à direita, fio embaixo) | `LotList` | Toda tabela e lista em card |

## 5. Issues

Uma por vez, com captura antes e depois. **Publicar em produção só com o Marcus por perto**: ele apresenta o projeto ao vivo.

| Nº | Tela |
| --- | --- |
| 017 | Home (feita) |
| 018 | Estoque: cabeçalho, filtros de estado como cartões compactos, tabela em card com barra de estado e distância na cor do estado |
| 019 | Detalhe do produto: situação em cartão de estado, lotes com barra |
| 020 | Validades pendentes |
| 021 | Importar |
| 022 | Configurações |
| 023 | Login e cadastro de empresa |
| 024 | Cadastro de produto, baixa e pastas |
| 025 | Esqueletos de carregamento e `design-system.md` (11, 14.1, 14.3, 14.5, 14.6 e seção 15) (feita) |

Depois, as telas que faltam (levantamento de 09/10): registrar entrada, editar produto, perdas, retirar vencidos, avisos.

## 6. Critérios de aceite de cada issue

- [ ] As cinco regras da seção 2 aplicadas
- [ ] Cor de status só nas três formas da regra 2
- [ ] Texto com informação a 4,5:1 nos dois temas
- [ ] Claro e escuro, 1440, 1366, 768, 360, sem rolagem horizontal
- [ ] `npm test`, `tsc`, lint
