# Issue 011: Detalhe do produto

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seção 5.3
**Status:** executada e validada
**Depende de:** 008
**Etapa da esteira:** 5 de 12

---

## Objetivo

A pergunta da tela é "este produto tem algo para resolver, e em qual lote". Hoje ela abre com quatro blocos do mesmo peso, e nenhum responde isso sozinho. O selo Vencido aparece três vezes, e o bloco "Vence primeiro" mostra uma data que já passou.

## Escopo

### Faz

- **Nível 1: a situação do lote que vence primeiro**, numa frase com o chip: "Lote L2291 venceu há 12 dias (26/09/2026). São 14 un nesse lote." O verbo acompanha o estado: vence, venceu, venceu hoje. Produto sem lote diz isso e leva a informar a validade
- **Três indicadores em linha, sem card** (`Metric`): Em estoque, Custo parado, Lotes
- **Tabela de lotes**: lote (fabricação embaixo), validade (distância embaixo), quantidade, situação. "Vence primeiro" marcado no primeiro quando há mais de um. No celular, lista de duas linhas
- **Histórico** sob título de seção, sem subtítulo
- **Ficha do produto** como lista de definições em colunas, sem card
- **Pasta vira link no metadado** do cabeçalho, no lugar do link em azul de acento no fim da ficha
- **Saem**: os quatro blocos com ícone em quadrado, o chip repetido no cabeçalho dos lotes, os subtítulos explicativos, `StatTile` e `Money` (este era o último uso dos dois)
- Esqueleto de carregamento com a forma nova

### Não faz

- Não muda as ações (Registrar saída primária, Editar secundária)
- Não cria ação de descarte direto daqui (fora da SPEC)

## Critérios de aceite

- [ ] O primeiro conteúdo depois do título responde se há algo a resolver, e em qual lote
- [ ] O selo de situação do produto aparece uma vez no topo; na tabela, um por lote
- [ ] Nenhum card com ícone em quadrado; nenhum `StatTile` ou `Money` no código
- [ ] Custo parado em reais inteiros; ficha com centavos
- [ ] Produto sem lote: frase diz que a validade não foi informada, com o caminho para informar
- [ ] Claro e escuro, 1440, 1366, 768, 360, sem rolagem horizontal
- [ ] `npm test`, `tsc`, lint
