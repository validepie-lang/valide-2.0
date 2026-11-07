# Validação: Issue 006 - Tokens, tipografia em duas famílias, forma e cor de erro

**Issue:** `docs/04-issues/006-tokens-e-tipografia.md`
**Plano:** `docs/05-plans/plan-006-tokens-e-tipografia.md`
**Data:** 08/10/2026
**Resultado:** passou

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Título de página e valor em risco em Mona Sans; o resto em Inter | passou | Capturas de Home, Estoque, Produto, Fila, Importar, Configurações, Baixa e Login |
| Quantidade e custo alinham pela casa, zero sem ponto | passou | `006/estoque-1440.png`: coluna Custo parado alinha vírgula com vírgula |
| Nenhum `text-eyebrow`, `text-card`, `rounded-lg`, `shadow-card`, `surface-card` | passou | Busca no `src/`: zero ocorrências |
| Card estático sem sombra, dois temas | passou | `006/produto-1440-escuro.png` e capturas claras |
| Erro de campo, login e quantidade em `error` | passou | `006/login-erro-1440.png`; busca: `status-expired` só em componentes de status e nos de importação que mudam na 013 |
| Todas as telas abrem sem quebra em 1440 e 360 | passou | Capturas de nove rotas em 1440 claro, 1440 escuro, 768 e 360 |
| `npm test`, `tsc`, lint | passou | 29 testes, zero erro de tipo, zero aviso |

## Achado durante a execução, e corrigido

**O tabular da Inter também alarga o hífen.** Com `.tnum` em todo número, "MED-1040" virou "MED - 1040" e os códigos de lote ficaram espaçados. Medido no arquivo da fonte: a Inter tem versão tabular de hífen, vírgula, ponto, dois-pontos e parênteses (o espaço não muda). Em coluna de número isso é o que se quer, porque alinha a casa decimal. Em código, abre buraco.

Correção: `.tnum` saiu de todo identificador (código interno, lote, código de barras, CNPJ, CEP, telefone, nome de arquivo) em 9 arquivos. A regra entrou no design system (14.1), no `CLAUDE.md`, na skill `componente-valide` e no agente `design-reviewer`.

**Barra de base do gráfico apagada demais.** O tom planejado dava 1,53:1 contra o fundo. Ajustado para 2,18:1 no claro e 2,51:1 no escuro, ainda bem abaixo do destaque (11:1 e 12:1). Conta no design system, seção 14.5.1.

## Fora do plano

Nenhum arquivo fora da lista. As trocas mecânicas atingiram exatamente os arquivos listados por busca no plano. Os ajustes de `.tnum` estão dentro de "usos de token", que o plano cobre.

## O que fica para as próximas issues

- `.glass`, `.glass-tab`, `.notch-tr`, `chart-1` a `chart-6`: saem na 009
- Verde e amarelo da importação e da fila concluída: 012 e 013
- O herói ainda mostra centavos esmaecidos (`<Money>`): sai na 009, com `formatMoneyWhole` da 007
- Login e cadastro ainda têm o fundo com degradê escuro: 015

## Security Review

Sem dado, permissão ou credencial envolvidos. Nenhuma fonte de terceiro em tempo de execução: o `next/font` serve as duas do próprio domínio.

## UX Review

- [x] Contraste: texto de erro 4,97:1 sobre o fundo de erro, 5,90:1 sobre branco
- [x] Status com cor, ícone e rótulo: sem mudança
- [x] Erro com ícone e texto, não só cor
- [x] Sem travessão
- [x] Zero hex fora do `globals.css`
