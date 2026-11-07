# Issue 008: Componentes base: Metric, StatusSummary, padrão de gráfico, TabsNav

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seções 4.2, 4.3, 4.5 e 4.6
**Status:** executada e validada
**Depende de:** 006, 007
**Etapa da esteira:** 5 de 12

---

## Objetivo

Os quatro componentes de que as telas seguintes dependem. Cada um entra já em uso no lugar que substitui, para o commit ser conferido na tela e não deixar código morto:

| Componente | Entra em uso em |
| --- | --- |
| `Metric` | Valor em risco, no topo da Home |
| `StatusSummary` | Os quatro blocos de estado da Home |
| Padrão de gráfico | Gráfico de vencimentos por semana |
| `TabsNav` | Navegação de Configurações |

## Escopo

### Faz

- `Metric`: rótulo, número, contexto. Tamanhos `hero`, `metric`, `section`. Status opcional, que põe o ícone do status no rótulo. Valor completo em `title` e para leitor de tela quando o número exibido é arredondado
- `StatusSummary`: faixa com os quatro estados, Vencido e A vencer maiores, contagem zero apagada, cada segmento é link, Sem validade com valor parado e a chamada "Informar validades"
- Topo da Home: `Metric` no tamanho `hero` com `formatMoneyWhole`, uma linha de contexto, botão primário "Ver produtos em risco" para `/estoque?status=expired,soon`. Sai `risk-summary.tsx`
- Gráfico: base `chart-base`, semana de pico em `chart-focus`, valor escrito em cima de cada barra, sem eixo Y, sem grade, sem dica flutuante, raio só no topo. Função `expiryWeekHeadline` que escreve a conclusão ("A semana de 20 out concentra 6 lotes"), usada como título do card
- `TabsNav`: abas com sublinhado. Configurações passa a usar

### Não faz

- Não mexe no resto da Home (pilha de filas, rosca, avisos, atalhos, movimentações, layout). Isso é a 009. Até lá a pilha continua ao lado da faixa
- O filtro `status=expired,soon` no estoque é da 010. Até lá o botão abre o estoque inteiro, que já vem ordenado pela validade, com vencidos e a vencer no topo
- Não troca o passo a passo da importação (013)

## Critérios de aceite

- [ ] O valor em risco aparece como R$ 8.573, com R$ 8.572,67 no `title` e no leitor de tela
- [ ] A Home tem um único botão cheio no topo, "Ver produtos em risco"
- [ ] Faixa de status em 4 colunas a partir de 768 e 2 por 2 em 360; Vencido e A vencer maiores
- [ ] Cada segmento da faixa leva ao estoque filtrado; Sem validade leva à fila
- [ ] Gráfico com uma barra de destaque (duas se empatar), valor em cada barra, título com a conclusão
- [ ] Abas de Configurações com sublinhado, diferentes do chip de filtro
- [ ] Teclado: foco visível em cada segmento e em cada aba
- [ ] Claro e escuro, 1440, 768 e 360
- [ ] `npm test`, `tsc`, lint
