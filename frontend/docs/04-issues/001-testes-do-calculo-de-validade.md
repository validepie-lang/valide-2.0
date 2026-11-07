# Issue 001: Testes do cálculo de validade

**SPEC de origem:** nenhuma. Tarefa de qualidade sobre código já existente (`src/lib/utils/expiry.ts`), fechado na fase 2.
**Status:** planejada
**Depende de:** nenhuma
**Etapa da esteira:** 5 de 12

---

## Objetivo

Travar em teste automatizado as regras de status de validade, para que nenhuma alteração futura em `expiry.ts` possa quebrá-las em silêncio.

## Escopo

### Faz

- Instala a infraestrutura mínima de teste do projeto: `node --test` nativo, script `npm test`, zero dependência nova
- Cobre `daysUntil`: dias de calendário, hora ignorada, virada de mês e de ano, ano bissexto
- Cobre `getExpiryStatus`: os quatro status, os limites da janela de 30 dias, janela configurável, entrada ausente e entrada inválida
- Cobre `STATUS_LABEL` e `STATUS_ORDER`: vocabulário fixo e cobertura de todos os status

### Não faz

- Não testa componente, tela ou serviço. Só a função pura
- Não altera nenhuma linha de `expiry.ts`. Se um teste falhar, isso é uma conversa, não um conserto silencioso
- Não instala Vitest, Testing Library, Jest ou runner de terceiro
- Não configura CI

## Arquivos previstos

| Caminho | Ação |
| --- | --- |
| `src/lib/utils/expiry.test.ts` | criar |
| `package.json` | modificar |
| `tsconfig.json` | modificar |

## Critérios de aceite

- [ ] `npm test` roda e passa, sem instalar dependência nova
- [ ] Existe teste que prova que produto sem lote devolve `unknown`, e nunca `ok`. Regra 2 da cor
- [ ] Existe teste para cada um dos quatro status
- [ ] Existe teste para os dois limites da janela: 30 dias ainda é `A vencer`, 31 dias já é `No prazo`
- [ ] Existe teste que prova que os rótulos são exatamente Vencido, A vencer, No prazo e Sem validade
- [ ] Existe teste que quebra se um status novo entrar em `ExpiryStatus` sem entrar em `STATUS_LABEL` e `STATUS_ORDER`
- [ ] Nenhum teste depende da data em que é executado. `today` sempre injetado
- [ ] `npx tsc --noEmit` sem erro e `npm run lint` sem warning
- [ ] `expiry.ts` não foi modificado

## Observações

O status de validade é calculado pelo backend do Pedro. Esta função existe para dar feedback imediato no formulário, antes de salvar. Testá-la protege duas coisas: a experiência de quem digita, e o acordo com o backend sobre o que cada status significa.

A função é consumida por dez arquivos: estoque, detalhe do produto, dashboard, chip de status, barra de filtros, formulário rápido, campos de lote, mocks e o próprio tipo do domínio. É o ponto de maior alcance do frontend.
