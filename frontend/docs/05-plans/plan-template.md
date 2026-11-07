# Plan: Issue <número> - <título>

**Issue:** `docs/04-issues/<numero>-<slug>.md`
**Data:** <dd/mm/aaaa>
**Status:** aguardando aprovação | aprovado
**Etapa da esteira:** 6 de 12

---

> **Esta etapa acontece antes de qualquer código.** É a que mais evita retrabalho e a que mais é pulada. A IA precisa pesquisar a base de código antes de escrever este plano, não depois.

---

## 1. Pesquisa na base de código

O que já existe e foi encontrado. Preencher **depois de procurar**, não por suposição.

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| componente de chip de status | `src/components/products/status-chip.tsx` | sim |
| | nada parecido | não, vou criar |

**Regra:** se existe botão, card, layout, hook ou serviço parecido, reutiliza. Duplicar componente é o erro mais caro e mais silencioso do projeto.

## 2. Arquivos a criar

| Caminho | O que é | Linhas estimadas |
| --- | --- | --- |
| | | |

## 3. Arquivos a modificar

| Caminho | O que muda exatamente |
| --- | --- |
| | |

**Nenhum arquivo fora destas duas listas pode ser tocado na execução.** Se durante a execução aparecer necessidade de mexer em outro, pare e atualize o plano antes.

## 4. Componentes reutilizados

| Componente | De onde | Como será usado |
| --- | --- | --- |
| | | |

## 5. Tokens do design system

| Elemento | Token |
| --- | --- |
| | |

Zero hex. Se falta um token, ele é adicionado ao design system primeiro, e isso vira uma linha na seção 3.

## 6. Dados

### Serviços consumidos

| Função | Existe? |
| --- | --- |
| | sim / criar |

### Endpoints

| Método | Rota | No contrato? |
| --- | --- | --- |
| | | |

## 7. Cenários de erro

| Cenário | O que acontece na tela |
| --- | --- |
| Rede falhou | |
| Resposta vazia | |
| Sem permissão | |
| Dado inesperado | |

## 8. Critérios de aceite

Copiados da issue. São o que a etapa de Validate vai conferir.

- [ ] 
- [ ] 

## 9. Riscos desta execução

O que pode dar errado, e o que fazer.

| Risco | Resposta |
| --- | --- |
| | |

## 10. O que NÃO será feito aqui

Explicitar, para a execução não crescer.

- 

---

## Checklist antes de aprovar o plano

- [ ] A base de código foi realmente pesquisada, não assumida
- [ ] Toda oportunidade de reuso foi identificada
- [ ] A lista de arquivos está completa e fechada
- [ ] Nenhum token novo sem passar pelo design system
- [ ] Cenários de erro mapeados
- [ ] Nada aqui cria backend, banco ou autenticação real
- [ ] O plano cabe em uma sessão de trabalho
