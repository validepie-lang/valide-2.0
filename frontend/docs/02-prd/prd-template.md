# PRD: <nome da funcionalidade>

**Autor:** Marcus Campos
**Data:** <dd/mm/aaaa>
**Status:** rascunho | em revisão | aprovado
**Etapa da esteira:** 3 de 12

---

## 1. Problema

Qual dor real está sendo resolvida. Em linguagem de usuário, não de sistema.

Se possível, com evidência: o que a farmácia parceira relatou, o que o diagnóstico mostrou.

## 2. Para quem

Qual perfil de `00-context/target-audience.md` usa isso, e em que momento do dia dele.

| Perfil | Cargo | Contexto de uso |
| --- | --- | --- |
| | Administrador ou Operador | |

## 3. Por que importa

O que muda para o usuário e para o negócio se isso existir. E o que acontece se não existir.

## 4. Resultado esperado

O que o usuário consegue fazer ao final, que hoje não consegue.

## 5. Escopo

### Entra

- 

### Não entra (e por quê)

- 

Ser explícito aqui evita crescimento de escopo na SPEC.

## 6. Histórias de usuário

Como <perfil>, quero <ação>, para <resultado>.

- Como balconista, quero ver o que vence esta semana, para separar antes de perder.
- 

## 7. Regras de negócio envolvidas

Quais regras de `00-context/business-rules.md` se aplicam. Se houver regra nova, ela precisa ser confirmada com a equipe antes da SPEC, não inventada aqui.

## 8. Dependências do backend

O que precisa existir do lado do Pedro ou do Antônio. Se ainda não existe, o frontend avança com mock e registra o endpoint em `01-references/api-contract.md`.

| Preciso de | De quem | Já existe no contrato? |
| --- | --- | --- |
| | | |

## 9. Critérios de sucesso

Mensuráveis. Como saber que deu certo.

- 

## 10. Riscos

| Risco | Impacto | Resposta |
| --- | --- | --- |
| | | |

## 11. Perguntas em aberto

O que precisa de resposta da equipe antes da SPEC. Cada item com quem responde.

- [ ] (Pedro) 
- [ ] (Guilherme) 

---

## Checklist antes de aprovar

- [ ] O problema está descrito em linguagem de usuário, não de sistema
- [ ] O escopo diz o que **não** entra
- [ ] Nenhuma decisão de implementação vazou para cá (isso é da SPEC)
- [ ] As regras de negócio citadas existem em `business-rules.md` ou estão marcadas como pergunta
- [ ] Critérios de sucesso são verificáveis
