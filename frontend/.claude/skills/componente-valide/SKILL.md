---
name: componente-valide
description: Cria ou revisa um componente do design system do Valide com todas as variantes, tamanhos e estados de interação. Use ao construir botão, input, card, chip, tabela, modal ou qualquer componente de domínio como StatusChip, Metric e StatusSummary.
---

# Criar um componente do design system do Valide

Componente do Valide nasce completo. Um botão sem estado de foco ou um input sem estado de erro volta como retrabalho na revisão.

## Antes de começar

Leia `docs/01-references/design-system.md`, principalmente a seção 14 (hierarquia e padrão de dados, 08/10). Para decisão de layout e conferência visual, use a skill `design-valide`. Confira se o componente já existe em `src/components/ui/` ou nos componentes de domínio antes de criar outro.

## O que todo componente precisa ter

### Estados de interação

Todo componente interativo implementa os cinco:

| Estado | Como se comporta |
| --- | --- |
| Normal | `--primary` |
| Hover | `--primary-hover` |
| Pressed | `--primary-pressed` |
| Focus | Anel de foco visível, 2px, com 2px de deslocamento. Nunca remova o outline sem substituir |
| Disabled | `--fg-disabled`, cursor `not-allowed`, sem hover |

Input tem ainda: **erro** (borda `border-error` mais mensagem com ícone em `text-error-fg` abaixo) e **preenchido**.

### Os dois temas

Teste em claro e escuro. No tema escuro a ação primária é céu pálido (`--primary`, `#CDE4FD`) com texto escuro, e a separação vem de superfície, não de sombra. Card é `bg-surface` liso, raio de 14px, borda, sem sombra nos dois temas.

### Acessibilidade

- Alvo de toque com no mínimo 44px de altura em mobile
- Input sempre com `<label>` associado, nunca só placeholder
- Estado comunicado além da cor
- `aria-label` em botão que só tem ícone
- Componente interativo alcançável por Tab, em ordem lógica

### API do componente

- Props tipadas, sem `any`
- Variantes por prop (`variant`, `size`), nunca por classe passada de fora
- `className` aceito para ajuste pontual, mesclado com `cn()`
- Encaminha `ref` quando envolve elemento nativo

## Componentes de domínio do Valide

Estes carregam a regra de negócio do produto. Construa com cuidado extra.

**`StatusChip`**
Recebe `status: 'expired' | 'soon' | 'ok' | 'unknown'`. Renderiza cor de fundo, cor de texto, ícone e rótulo em português (Vencido, A vencer, No prazo, Sem validade). Nunca recebe cor por prop, a cor vem do status.

O estado `unknown` é obrigatório e não pode ser esquecido: é o produto importado sem lote. Usa o neutro `--status-unknown`, nunca verde.

**`Metric`** (em `ui/metric.tsx`, issue 008)
A anatomia única de indicador: rótulo 13px `fg-muted`, número (`hero`, `metric` ou `body`, tabular), contexto 13px. Sem ícone decorativo, sem fundo. Indicador de status leva o ícone do status no rótulo. Substitui o `StatTile`, o `StatusTile` e o `<Money>`.

**`StatusSummary`** (em `dashboard/status-summary.tsx`, issue 008)
Os quatro estados numa faixa, ordem fixa, Vencido e A vencer mais pesados. Cada segmento é link. Sem validade traz o valor parado e "Informar validades". Substitui os blocos de estado e a pilha de filas da Home.

**Saíram:** `StatusTile` e `WorkQueueStack` (com o `.glass`) na 009; `StatTile` e `Money` na 011. Indicador é sempre `Metric`.

**`LotBadge`**
Código do lote mais data de validade, com o chip de status ao lado.

**`EmptyState`**
Ícone, título, uma frase de explicação e o botão da ação que resolve. Nunca um estado vazio mudo.

## Regras duras

- Nenhum hex no componente. Só token.
- Vermelho, amarelo e verde só em componente de status de validade. Única exceção: erro que impede continuar, pelo token `--error` (mesmo vermelho).
- `.tnum` em número, nunca em código com hífen (lote, SKU, CNPJ).
- Rótulo em português, nome do componente e das props em inglês.
- **Sem travessão (em-dash)** em nenhum texto.
- Mais de 200 linhas significa que são dois componentes.

## Ao terminar

Liste as variantes e estados implementados, e diga se criou algum token novo no design system.
