# Issue 007: Formatos de dado

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seção 4.4 (design system 14.4)
**Status:** executada e validada
**Depende de:** 006
**Etapa da esteira:** 5 de 12

---

## Objetivo

Um formato só para cada tipo de dado, em funções testadas, para as telas das issues seguintes não inventarem o seu.

## Escopo

### Faz

- `formatMoneyWhole`: R$ 8.573, para indicador. Substitui `formatMoneyShort`, que não era usada
- `formatEventTime`: 9 out, 14:22; com o ano quando não é o ano corrente. Substitui `formatDateTime`
- `formatAxisDay`: 20 out, para eixo de gráfico. Substitui `formatMonthDay`
- `formatQuantity` com sinal opcional: +24 un, −6 un, com o sinal de menos tipográfico (U+2212)
- Sai `formatDateLong`, que não era usada
- **Fuso horário de evento.** `formatEventTime` mostra a hora no fuso da farmácia, não em UTC. Hoje a tela mostra a hora em UTC, e os dados de demonstração gravam a hora local como se fosse UTC, então parece certo. Com a API real, que manda UTC de verdade (contrato, convenções), toda movimentação apareceria 3 horas adiantada. Os dados de demonstração passam a gravar o instante UTC correto
- **Unidade na movimentação.** `Movement` ganha `unit`. Sem isso a tela não tem como mostrar "2,5 kg" e escreveria "un" para tudo. Entra no contrato (v8)
- Os usos das funções renomeadas passam para as novas: tabela de movimentação, gráfico por semana, histórico de importação, e os dois painéis da Home que saem na 009
- Testes de todas as funções de formato

### Não faz

- Não aplica os formatos nas telas que serão redesenhadas (valor em risco, tabela do estoque, produto). Cada uma usa as funções na sua issue
- Não lê o fuso da conta (`Company.timezone`) ainda: o padrão é `America/Sao_Paulo`, e a função aceita outro fuso. Ligar ao fuso da conta precisa passar a sessão até componentes que hoje não a recebem; fica registrado no contrato

## Critérios de aceite

- [ ] Cada formato da tabela 14.4 tem função e teste
- [ ] Nenhum uso de `formatDateTime`, `formatMonthDay`, `formatDateLong`, `formatMoneyShort`
- [ ] Movimentação de 14:22 no horário de Brasília aparece como 14:22, com o dado em UTC (17:22Z)
- [ ] Saída aparece com sinal de menos tipográfico e unidade
- [ ] `npm test`, `tsc`, lint
