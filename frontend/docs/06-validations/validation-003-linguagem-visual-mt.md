# Validation: Issue 003 - Linguagem visual a partir da referência MT

**Issue:** `docs/04-issues/003-linguagem-visual-mt.md`
**Plano:** `docs/05-plans/plan-003-linguagem-visual-mt.md`
**Data:** 07/10/2026
**Etapa da esteira:** 8 de 12

---

## Critérios de aceite

| Critério | Resultado | Como foi verificado |
| --- | --- | --- |
| Nenhum hex fora de `globals.css` | passou | `grep` em `src/`, só a exceção documentada de `themeColor` |
| Verde, amarelo e vermelho só para validade | passou | blocos de estado, selos da pilha e chips. Movimentação, gráficos e acento usam o matiz azul |
| Sem validade neutro e fora de No prazo | passou | bloco e selo próprios, em neutro |
| Texto sobre o vidro passa AA | passou | pior caso 4,79:1, tabela em `design-system.md` seção 12 |
| Home em 360, 768 e 1440, claro e escuro | passou | Chrome headless; 360 via iframe, 800 direto |
| Pilha navegável por teclado | passou | botões com `aria-expanded` e `aria-controls`, região nomeada, foco claro sobre o vidro |
| Outras telas não quebram | passou | estoque, produto, validades pendentes, importação e login fotografados |
| `tsc`, lint e testes | passou | sem erro, sem warning, 28 de 28 |

## Problemas encontrados e corrigidos na validação

1. **Zeros pontilhados nas datas.** A `.tnum` ligava os algarismos tabulares, que na Mona Sans são de desenho monoespaçado. Data de validade parecia código. Trocado por algarismos proporcionais.
2. **A página estourava 360px.** Os blocos da Home viram itens flex no celular e não encolhiam abaixo do texto que não quebra. Resolvido com `min-w-0`.
3. **Dica cortada nos blocos de estado** ("Tirar da prat..."). A dica saiu: a ação de cada estado já está na pilha de filas.
4. **Datas do gráfico de barras encostando.** Passou a mostrar uma semana sim, outra não; todas continuam na lista para leitor de tela.
5. **Barras comuns abaixo de 3:1 no tema claro.** Trocadas de `chart-4` para `chart-3`.
6. **Legenda da rosca espremida em 768.** Container query: duas colunas só quando o card tem largura.

## Observações

- O `button.tsx` estava na lista do plano e não precisou mudar: os tokens novos bastaram.
- Os gráficos não desenham dentro do iframe da captura em 360. Desenham direto na janela. É limitação da captura, não da tela.

## Fica para a próxima issue

Acabamento fino das telas além da Home (estoque, produto, fila de validades, importação, configurações e login), já com os tokens novos.
