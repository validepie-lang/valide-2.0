# Validation: Issue 001 - Testes do cálculo de validade

**Issue:** `docs/04-issues/001-testes-do-calculo-de-validade.md`
**Plano:** `docs/05-plans/plan-001-testes-do-calculo-de-validade.md`
**Data:** 17/09/2026
**Etapas da esteira:** 8, 9 e 10 de 12

---

## Resultado

**PASSOU**

28 testes rodando em `npm test`, com zero dependência nova, cobrindo os quatro status, os dois limites da janela de 30 dias e a Regra 2 da cor. `expiry.ts` não foi modificado.

---

## 1. Critérios de aceite

| Critério | Passou | Observação |
| --- | --- | --- |
| `npm test` roda e passa, sem dependência nova | sim | 28 testes, 6 suítes, 95ms. `package.json` sem nenhum pacote a mais |
| Produto sem lote devolve `unknown` e nunca `ok` | sim | Suíte "produto sem validade informada". Seis entradas: `null`, `undefined`, string vazia, `"amanhã"`, `"31/02/2026"` e `Date` inválido. Cada uma testada duas vezes: é `unknown`, e não é `ok` |
| Teste para cada um dos quatro status | sim | Vencido, A vencer, No prazo e Sem validade |
| Os dois limites da janela | sim | 30 dias é `soon`, 31 dias é `ok` |
| Rótulos exatos | sim | `deepEqual` contra Vencido, A vencer, No prazo, Sem validade. Mais um teste que rejeita travessão em qualquer rótulo |
| Quebra se um status novo entrar sem rótulo ou sem ordem | sim | Compara as chaves de `STATUS_LABEL` com o conteúdo de `STATUS_ORDER` e checa duplicata |
| Nenhum teste depende da data de execução | sim | `TODAY` fixo em 17/09/2026, injetado em toda chamada. Datas relativas via `inDays()` |
| `npx tsc --noEmit` sem erro e lint sem warning | sim | Ambos limpos. `npm run build` também, 14 rotas |
| `expiry.ts` não foi modificado | sim | `git diff` do arquivo veio vazio |

---

## 2. Aderência ao plano (etapa 8)

| Verificação | Resultado |
| --- | --- |
| Cumpriu o que o plano previa | sim |
| Nenhum arquivo fora da lista foi tocado | sim |
| Nenhum código duplicado | sim. O helper `inDays()` existe justamente para não repetir aritmética de data em 28 testes |
| Componentes reutilizáveis foram de fato reutilizados | não se aplica, issue sem interface |
| Nenhuma funcionalidade extra inventada | sim. Nada de CI, hook de commit ou teste de outro arquivo |

**Arquivos realmente alterados:**

```
A  src/lib/utils/expiry.test.ts
M  package.json
M  tsconfig.json
A  docs/04-issues/001-testes-do-calculo-de-validade.md
A  docs/05-plans/plan-001-testes-do-calculo-de-validade.md
A  docs/06-validations/validation-001-testes-do-calculo-de-validade.md
```

**Diferença em relação ao plano:** uma, no conteúdo do script, não na lista de arquivos. O plano previa `"test": "node --test src"`. No Node 26, passar um diretório faz o runner tentar executar `src` como se fosse um arquivo, e ele falha com `MODULE_NOT_FOUND`. O script final é `"test": "node --test \"src/**/*.test.ts\""`, com o glob entre aspas para o Node resolver, não o shell. Mesma linha, mesmo arquivo, efeito pretendido.

---

## 3. Qualidade técnica

- [x] `npx tsc --noEmit` sem erro
- [x] Lint sem warning
- [x] Nenhum `console.log` esquecido
- [x] Nenhum `any`
- [x] Nenhum componente com mais de 200 linhas. O arquivo de teste tem exatamente 200, e a regra vale para componente, não para suíte de teste
- [x] Server Component por padrão. Não se aplica, nenhum componente aqui

---

## 4. Estados da tela

Não se aplica. Esta issue não tem tela: testa uma função pura. Os estados de carregando, vazio, erro e sem permissão continuam sendo obrigação de cada tela que consome `expiry.ts`, e foram verificados na validação da fase 1.

O equivalente aqui é o estado "sem validade informada", que é justamente o mais testado do arquivo.

---

## 5. Security Review (etapa 9)

Issue sem dado de cliente, sem credencial e sem permissão. O checklist é curto de propósito.

- [x] Nenhuma chave, token ou credencial no código do front
- [x] Nenhuma credencial em `localStorage` ou em estado do cliente
- [x] Nenhuma regra crítica de negócio no cliente. O teste reforça o contrário: documenta que o cálculo local existe só para feedback no formulário, e que a verdade vem do backend
- [x] Nenhum dado real de farmácia nos testes. Só datas sintéticas em 2026, 2027 e 2028
- [x] Nenhuma dependência nova sem justificativa. Nenhuma dependência nova, ponto

**Achados:**

| Gravidade | O que | Onde | Corrigido? |
| --- | --- | --- | --- |
| nenhum | | | |

**Observação para o Pedro:** o teste "vence hoje é A vencer, não Vencido" trava o comportamento do front. Se o backend classificar o dia do vencimento como Vencido, a tela de cadastro vai mostrar um status e a listagem outro, no mesmo produto. Item para a pauta.

---

## 6. UX Review (etapa 10)

A issue não renderiza nada, mas toca no vocabulário e na regra de cor, então estes itens valem:

- [x] Vocabulário fixo travado em teste: Vencido, A vencer, No prazo, Sem validade
- [x] Produto sem validade nunca aparece como verde. É o teste mais explícito do arquivo
- [x] Sem travessão. Vale para os rótulos, verificado em teste, e para este documento
- [x] Zero hex solto. Nenhuma cor citada no arquivo

**Achados:**

| O que | Onde | Corrigido? |
| --- | --- | --- |
| nenhum | | |

---

## 7. Visual

Não se aplica. Sem tela, sem largura, sem tema.

Screenshots capturados para o portfólio (backlog B76): não se aplica

---

## 8. Ajustes necessários

Nenhum.

---

## 9. Documentação a atualizar (etapa 12)

- [x] `07-decisions/technical-decisions.md`: registrar o runner de teste e a exigência de Node 22 ou superior
- [x] `08-project/pauta-reuniao.md`: levar ao Pedro como o backend classifica o produto que vence hoje
- [ ] Os demais documentos não mudam. Sem endpoint novo, sem token novo, sem tela nova

---

## 10. Commit (etapa 11)

```
chore: cover the expiry status rules with tests
```

Feito: sim
