# Plan: Issue 001 - Testes do cálculo de validade

**Issue:** `docs/04-issues/001-testes-do-calculo-de-validade.md`
**Data:** 17/09/2026
**Status:** aguardando aprovação
**Etapa da esteira:** 6 de 12

---

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| runner de teste já configurado | nada. Sem `vitest.config`, sem `jest.config`, sem script `test` em `package.json` | não, vou criar o mínimo |
| algum arquivo `*.test.*` ou `*.spec.*` no repositório | nenhum. Este é o primeiro teste do projeto | não |
| a própria função a testar | `src/lib/utils/expiry.ts`, com `daysUntil`, `getExpiryStatus`, `STATUS_LABEL` e `STATUS_ORDER` | sim, é o alvo |
| quem consome a função | 10 arquivos: estoque, detalhe, dashboard, `status-chip`, `filter-bar`, `quick-fill-form`, `lot-fields`, `side-panels`, mocks de catálogo e de dashboard, e `lib/types/index.ts` | nenhum é tocado |
| como o resto do código monta data | sempre ISO com fuso explícito: `new Date(lot.expiresAt)` e `` `${expiry}T00:00:00Z` `` | sim, os testes seguem a mesma convenção UTC |
| data fixa usada nos mocks | `TODAY` em `src/lib/mocks/catalog.ts` | não importo, para o teste não depender do mock |
| biblioteca de data no projeto | nenhuma. `expiry.ts` diz "sem dependência externa" e cumpre | mantenho assim |

**Achado que muda o plano:** o Node deste ambiente é o 26 e roda arquivo `.ts` de teste nativamente. Confirmei rodando um teste de exemplo antes de escrever este plano. Ou seja, dá para ter teste no Valide com zero dependência nova, o que respeita a regra 4 da stack.

## 2. Arquivos a criar

| Caminho | O que é | Linhas estimadas |
| --- | --- | --- |
| `src/lib/utils/expiry.test.ts` | suíte de testes da função de validade, com `node:test` e `node:assert/strict` | 130 |

## 3. Arquivos a modificar

| Caminho | O que muda exatamente |
| --- | --- |
| `package.json` | uma linha em `scripts`: `"test": "node --test src"` |
| `tsconfig.json` | uma linha em `compilerOptions`: `"allowImportingTsExtensions": true`. Necessária porque o teste importa `./expiry.ts` com extensão, que é como o Node resolve. Só é aceita porque `noEmit` já é `true`, e não muda nada no build do Next |

**Nenhum arquivo fora destas duas listas é tocado.** Em especial, `src/lib/utils/expiry.ts` não é modificado: se um teste falhar, o resultado vira conversa com o Marcus, não conserto no meio da execução.

## 4. Componentes reutilizados

| Componente | De onde | Como será usado |
| --- | --- | --- |
| nenhum | | esta issue não renderiza nada. Testa função pura |

## 5. Tokens do design system

Não se aplica. Nenhuma cor, nenhum hex, nenhuma classe. O teste verifica os rótulos de `STATUS_LABEL`, que são texto, não cor.

## 6. Dados

### Serviços consumidos

| Função | Existe? |
| --- | --- |
| nenhuma. Os testes não chamam a camada de serviço | |

### Endpoints

| Método | Rota | No contrato? |
| --- | --- | --- |
| nenhum | | |

Nada muda em `docs/01-references/api-contract.md`.

## 7. Cenários de erro

A issue não tem tela, então a tabela lê como "entrada ruim na função" em vez de "erro na tela". Cada linha vira um teste.

| Cenário | O que a função faz, e o teste exige |
| --- | --- |
| Produto sem lote (`null`) | devolve `unknown`. O teste também afirma explicitamente que **não** é `ok` |
| Campo ausente (`undefined`) | devolve `unknown` |
| String vazia | devolve `unknown` |
| String que não é data (`"31/02/2026"`, `"amanhã"`) | devolve `unknown`, sem lançar erro |
| Data no limite exato da janela (30 dias) | devolve `soon` |
| Data um dia além da janela (31 dias) | devolve `ok` |
| Vence hoje (0 dias) | devolve `soon`. Comportamento atual do código, travado em teste |
| Janela configurada em 0 | hoje é `soon`, amanhã é `ok` |

## 8. Critérios de aceite

- [ ] `npm test` roda e passa, sem instalar dependência nova
- [ ] Existe teste que prova que produto sem lote devolve `unknown`, e nunca `ok`. Regra 2 da cor
- [ ] Existe teste para cada um dos quatro status
- [ ] Existe teste para os dois limites da janela: 30 dias ainda é `A vencer`, 31 dias já é `No prazo`
- [ ] Existe teste que prova que os rótulos são exatamente Vencido, A vencer, No prazo e Sem validade
- [ ] Existe teste que quebra se um status novo entrar em `ExpiryStatus` sem entrar em `STATUS_LABEL` e `STATUS_ORDER`
- [ ] Nenhum teste depende da data em que é executado. `today` sempre injetado
- [ ] `npx tsc --noEmit` sem erro e `npm run lint` sem warning
- [ ] `expiry.ts` não foi modificado

## 9. Riscos desta execução

| Risco | Resposta |
| --- | --- |
| `node --test src` varrer arquivo que não é teste, ou demorar | o padrão do Node só casa `*.test.ts`, e a pasta é pequena. Confirmo no primeiro `npm test` |
| `allowImportingTsExtensions` incomodar o build do Next | a flag só é válida com `noEmit: true`, que já é o caso. Rodo `npm run build` no final para provar que nada quebrou |
| O ESLint reclamar do arquivo de teste | rodo `npm run lint` e, se reclamar, o ajuste é no arquivo de teste, nunca afrouxando a regra do projeto |
| Um teste falhar de verdade, apontando bug em `expiry.ts` | paro a execução, registro o caso e levo ao Marcus. Não conserto a função nesta issue |
| A máquina de outra pessoa da equipe ter Node antigo, sem leitura nativa de `.ts` | registro na decisão técnica que o projeto exige Node 22 ou superior para rodar `npm test` |

## 10. O que NÃO será feito aqui

- Não instalo Vitest, Jest, Testing Library ou qualquer runner de terceiro
- Não testo componente, tela, serviço ou mock
- Não testo `format.ts` nem `cn.ts`. Viram issues próprias, se a equipe quiser
- Não configuro CI nem hook de pre-commit
- Não altero `expiry.ts`, nem para "melhorar" enquanto testo
- Não mexo em `CLAUDE.md` para incluir `npm test` na Definition of Done. Isso é decisão do Marcus, proposta no fim da execução

---

## Checklist antes de aprovar o plano

- [x] A base de código foi realmente pesquisada, não assumida
- [x] Toda oportunidade de reuso foi identificada
- [x] A lista de arquivos está completa e fechada
- [x] Nenhum token novo sem passar pelo design system
- [x] Cenários de erro mapeados
- [x] Nada aqui cria backend, banco ou autenticação real
- [x] O plano cabe em uma sessão de trabalho
