# Issue 006: Tokens, tipografia em duas famílias, forma e cor de erro

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seções 3.1, 3.2, 4.1, 4.6 e 4.8 do design system
**Status:** executada e validada
**Depende de:** SPEC aprovada (08/10/2026)
**Etapa da esteira:** 5 de 12

---

## Objetivo

Trocar a base visual antes de qualquer componente: as duas famílias de fonte, a escala tipográfica nova, card sem sombra e sem degradê com raio de 14px, e o token de erro. Cada issue seguinte constrói em cima disto.

## Escopo

### Faz

- **Fontes.** Inter vira a fonte da interface (`font-sans`). Mona Sans vira `font-display`, aplicada no título de página e no número herói
- **Números.** `.tnum` volta a ligar algarismos tabulares. Dentro de `font-display`, os algarismos ficam proporcionais (o tabular da Mona Sans tem zero com ponto)
- **Escala.** `metric` 36 para 28px, `section` 20 para 18px, entra `display-sm` (24px, título de página no celular). Saem `eyebrow` e `card`, com os usos trocados por `label` e `section`
- **Forma.** Raio de card 22px para 14px (`rounded-lg` vira `rounded-md` em todo o código). `--radius-lg` e `--radius-xl` são desligados no tema, para não voltarem com o valor padrão do Tailwind
- **Elevação.** Card estático sem sombra: sai `shadow-card` do tema e de todos os usos
- **Superfície.** `.surface-card` e o degradê do escuro saem; o card usa `bg-surface` liso
- **Erro.** Tokens `--error`, `--error-bg`, `--error-fg`, apontando para os valores de `--status-expired`. Campo inválido, erro de login e quantidade acima do lote (baixa) passam a usar `error`
- **Gráfico.** Tokens `--chart-base` e `--chart-focus` (usados a partir da issue 008)
- **Documentação.** Regra 1 do `CLAUDE.md` e decisões fechadas; `design-system.md` com contraste dos tokens novos; nota no `visual-ref/README.md`; skill `design-valide` com as regras novas

### Não faz

- Não tira `.glass`, `.glass-tab`, `.notch-tr` nem `chart-1` a `chart-6`. A Home atual ainda usa e ficaria quebrada (texto branco sobre fundo claro). Saem na issue 009, com os componentes que os usam
- Não muda a cor de aviso e sucesso da importação e da fila. Isso é das issues 012 e 013, que redesenham essas telas
- Não muda estrutura de nenhuma tela

## Critérios de aceite

- [ ] Título de página e valor em risco em Mona Sans; todo o resto em Inter
- [ ] Na tabela do estoque, quantidade e custo alinham pela casa (tabular) e o zero não tem ponto
- [ ] Nenhum `text-eyebrow`, `text-card`, `rounded-lg`, `shadow-card` ou `surface-card` no código
- [ ] Nenhum card estático com sombra, nos dois temas
- [ ] Erro de campo, de login e de quantidade usam `error`; vermelho de status só em status
- [ ] Todas as telas abrem sem quebra visual em 1440 e 360 (o redesenho de cada uma vem nas issues seguintes)
- [ ] `npm test`, `tsc` e lint passam
