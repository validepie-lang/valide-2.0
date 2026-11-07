# Validation: Issue 004 - Acabamento visual e responsividade

**Issue:** `docs/04-issues/004-acabamento-visual-e-mobile.md`
**Plano:** `docs/05-plans/plan-004-acabamento-visual-e-mobile.md`
**Data:** 07/10/2026
**Etapa da esteira:** 8 de 12

---

## Como foi auditado

As 13 rotas fotografadas em 1440 claro, 1440 escuro, 768 e 360, com os scripts que agora estão em `.claude/skills/design-valide/scripts/`. As rotas corrigidas foram fotografadas de novo depois de cada rodada.

## Inventário

| # | Resultado | Observação |
| --- | --- | --- |
| G1 Ações do cabeçalho no celular | passou | primeira tentativa (lado a lado, largura dividida) cortava "Adicionar produto" em 360. Ficou uma embaixo da outra, largura inteira |
| G2 Busca duplicada e decorativa | passou | busca do topo pesquisa no estoque; some em `/estoque`. Placeholder deixou de prometer busca por lote, que o serviço não faz |
| G3 Subtítulo das configurações | passou | |
| E1 Chips do estoque | passou | duas linhas rotuladas dentro do card; cabem inteiras em 1440 e rolam no próprio trilho em 360 |
| E2 Selo "no mínimo" | passou | |
| P1 Produto desequilibrado | passou | faixa de quatro indicadores, ficha única. As duas colunas terminam juntas |
| V1 Fila de validades centralizada | passou | |
| I1 Etapas da importação no celular | passou | |
| I2 Coluna direita da importação | passou | card "Como funciona" com as quatro etapas |
| F1 Pastas no celular | passou | ícones com `aria-label` e alvo de 44px |
| C1 Escolha de tema | passou | botões com `aria-pressed`, acompanha o botão do trilho pelo evento `valide-theme-change` |

## Verificações gerais

| Item | Resultado |
| --- | --- |
| Rolagem horizontal da página em 360 | nenhuma nas rotas corrigidas |
| `tsc`, lint, testes | sem erro, sem warning, 28 de 28 |
| Hex fora de `globals.css` | nenhum |

## Também nesta issue

- Skill nova `design-valide`, com a linguagem, as regras de grade e o procedimento de auditoria
- Skill `componente-valide` atualizada: citava componentes apagados na 003 e a paleta antiga do escuro
- `design-system.md` ganhou a seção 13
