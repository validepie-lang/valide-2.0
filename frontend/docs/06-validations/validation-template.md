# Validation: Issue <número> - <título>

**Issue:** `docs/04-issues/<numero>-<slug>.md`
**Plano:** `docs/05-plans/plan-<numero>-<slug>.md`
**Data:** <dd/mm/aaaa>
**Etapas da esteira:** 8, 9 e 10 de 12

---

## Resultado

**PASSOU** | **FALHOU** | **PRECISA DE AJUSTE**

Uma linha justificando.

---

## 1. Critérios de aceite

| Critério | Passou | Observação |
| --- | --- | --- |
| | sim / não | |

---

## 2. Aderência ao plano (etapa 8)

| Verificação | Resultado |
| --- | --- |
| Cumpriu o que o plano previa | |
| Nenhum arquivo fora da lista foi tocado | |
| Nenhum código duplicado | |
| Componentes reutilizáveis foram de fato reutilizados | |
| Nenhuma funcionalidade extra inventada | |

**Arquivos realmente alterados:**

```

```

Se essa lista for diferente da do plano, explicar cada diferença.

---

## 3. Qualidade técnica

- [ ] `npx tsc --noEmit` sem erro
- [ ] Lint sem warning
- [ ] Nenhum `console.log` esquecido
- [ ] Nenhum `any`
- [ ] Nenhum componente com mais de 200 linhas
- [ ] Server Component por padrão, `"use client"` só onde precisa

---

## 4. Estados da tela

| Estado | Implementado | Como foi testado |
| --- | --- | --- |
| Carregando | | |
| Vazio | | |
| Erro | | |
| Sem permissão | | |

---

## 5. Security Review (etapa 9)

Obrigatório em qualquer issue que toque em dado, credencial, permissão ou isolamento entre contas.

- [ ] Nenhuma chave, token ou credencial no código do front
- [ ] Nenhuma credencial em `localStorage` ou em estado do cliente
- [ ] Nenhuma regra crítica de negócio no cliente
- [ ] O tenant vem do token, nunca do cliente
- [ ] Permissão verificada na interface e no servidor
- [ ] Erro exibido não vaza dado interno, id, stack ou nome de tabela
- [ ] Nenhum dado sensível em parâmetro de URL
- [ ] Login não revela se o e-mail existe
- [ ] Entrada do usuário validada, nada renderizado como HTML
- [ ] Nenhuma dependência nova sem justificativa

**Achados:**

| Gravidade | O que | Onde | Corrigido? |
| --- | --- | --- | --- |
| | | | |

---

## 6. UX Review (etapa 10)

- [ ] A tela responde uma pergunta clara do usuário
- [ ] Hierarquia visual: o mais importante aparece primeiro
- [ ] Nenhum jargão técnico no texto
- [ ] Botão diz o que acontece, nunca "OK" ou "Confirmar" sozinho
- [ ] Mensagem de erro diz o que fazer em seguida
- [ ] Estado vazio tem ação que resolve
- [ ] Status de validade tem cor mais ícone mais rótulo
- [ ] Produto sem validade nunca aparece como verde
- [ ] Vocabulário fixo: vencido, a vencer, no prazo, sem validade
- [ ] Sem travessão em nenhum texto
- [ ] Zero hex solto, só tokens

**Achados:**

| O que | Onde | Corrigido? |
| --- | --- | --- |
| | | |

---

## 7. Visual

| Verificação | 360px | 768px | 1440px |
| --- | --- | --- | --- |
| Tema claro | | | |
| Tema escuro | | | |

- [ ] Contraste de texto em AA
- [ ] Todo input com label associado
- [ ] Fluxo principal navegável por teclado
- [ ] Alvo de toque de 44px em mobile

Screenshots capturados para o portfólio (backlog B76): sim / não

---

## 8. Ajustes necessários

Se o resultado foi "precisa de ajuste", listar aqui. Cada item vira correção antes de nova validação.

- [ ] 

---

## 9. Documentação a atualizar (etapa 12)

- [ ] `01-references/api-contract.md`
- [ ] `01-references/design-system.md`
- [ ] `01-references/screen-map.md`
- [ ] `07-decisions/technical-decisions.md`
- [ ] `07-decisions/ux-decisions.md`
- [ ] `07-decisions/security-decisions.md`
- [ ] `08-project/plano.md`
- [ ] `08-project/pauta-reuniao.md`

---

## 10. Commit (etapa 11)

```
<tipo>: <descrição em inglês>
```

Feito: sim / não
