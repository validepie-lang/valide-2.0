# Validação: Issue 009 - Home em uma coluna e menu de avisos

**Issue:** `docs/04-issues/009-home-e-menu-de-avisos.md`
**Plano:** `docs/05-plans/plan-009-home-e-menu-de-avisos.md`
**Data:** 08/10/2026
**Resultado:** passou

## Antes e depois

| | Antes | Depois |
| --- | --- | --- |
| 1440 | `redesign-hierarquia/antes/home-1440.png` | `redesign-hierarquia/depois/home-1440.png` |
| 360 | `redesign-hierarquia/antes/home-360.png` | `redesign-hierarquia/depois/home-360.png` |
| Escuro | | `redesign-hierarquia/depois/home-1440-escuro.png` |
| 1366 × 768 (computador de caixa) | | `redesign-hierarquia/depois/home-1366x768.png` |
| Menu de avisos | | `redesign-hierarquia/depois/menu-de-avisos-1440.png` |

De nove blocos com borda, sombra e o mesmo peso para quatro, em três níveis. Em 1366 × 768 a tela inteira cabe sem rolar, menos a última linha da lista.

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Quatro blocos, sem painel lateral | passou | Capturas |
| Um único botão cheio | passou | "Ver produtos em risco". O "Ver vencidos" da pilha saiu com ela |
| Lista só A vencer, cinco, com unidade | passou | Mock e captura: "Lote CF3345 · 5 un" |
| Sino abre o menu em qualquer tela; teclado | passou | Teste automatizado no Chrome, na tela do produto: Enter abre (`aria-expanded="true"`, painel com 6 avisos), Esc fecha e o foco volta para "Avisos, 3 não lidos" |
| Nenhum `.glass`, `.notch-tr`, `chart-1..6` | passou | Busca em `src/`: zero |
| Tudo que saiu tem caminho | passou | Tabela "O que sai e para onde vai" da SPEC 5.1 conferida: estados na faixa; avisos no sino; adicionar e importar no cabeçalho do estoque; saída na linha do estoque e no produto; movimentações no produto; contagem por pasta no filtro do estoque e em `/estoque/pastas` |
| Claro e escuro, 1440, 1366, 768, 360 | passou | Capturas |
| `npm test`, `tsc`, lint | passou | 53 testes, zero erro, zero aviso |

## Corrigido durante a validação

**Semana sem lote sumia do gráfico.** Sem barra e sem número, "27 nov" parecia dado faltando. Agora tem um traço de 2px com o "0" em cima.

## Decisão tomada na execução

A linha da lista não repete o chip "A vencer": a lista só tem esse estado, e o título leva o ícone. Justificativa completa na issue.

## Contrato

v9: `expiringSoon` só A vencer, cinco, com `unit`; `expiryByWeek` começa amanhã; `byFolder` e `recentMovements` sem uso na Home. Marcado "a avisar o Pedro".

## Security Review

Sem dado sensível, permissão ou credencial. Aviso sem link vira texto, não link para `#`.

## UX Review

- [x] Teste dos dois segundos: o valor em risco é o maior elemento e está no topo à esquerda
- [x] Uma ação primária
- [x] Espaço entre seções (48px) maior que dentro delas
- [x] Gráfico sem card, título com a conclusão
- [x] Estado vazio da lista e do gráfico com frase
- [x] Status com cor, ícone e rótulo
- [x] Sem travessão
