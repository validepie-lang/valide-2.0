# SPEC: <nome da funcionalidade>

**PRD de origem:** `docs/02-prd/prd-<slug>.md`
**Autor:** Marcus Campos
**Data:** <dd/mm/aaaa>
**Status:** rascunho | em revisão | aprovada
**Etapa da esteira:** 4 de 12

---

## 1. Resumo técnico

O que será construído, em três linhas. Sem repetir o PRD.

## 2. Rotas

| Rota | Tipo | Quem acessa |
| --- | --- | --- |
| `/exemplo` | Server Component | Administrador e Operador |

## 3. Arquivos

### A criar

| Caminho | O que é |
| --- | --- |
| `src/app/(app)/exemplo/page.tsx` | |
| `src/components/exemplo/exemplo-card.tsx` | |

### A modificar

| Caminho | O que muda |
| --- | --- |
| | |

**Nada fora desta lista pode ser tocado na execução.**

### A reutilizar

Componentes e utilitários que já existem e serão usados. Pesquisar `src/components/` e `01-references/design-system.md` antes de preencher.

| Já existe | Onde |
| --- | --- |
| `StatusChip` | `src/components/products/status-chip.tsx` |

## 4. Dados

### Tipos

Tipos novos ou alterados em `src/lib/types/`.

```ts

```

### Serviços

| Função | Arquivo | Retorno |
| --- | --- | --- |
| | `src/lib/services/` | |

### Endpoints consumidos

| Método | Rota | Já está no contrato? |
| --- | --- | --- |
| GET | `/exemplo` | sim / **não, adicionar** |

Todo endpoint novo precisa entrar em `01-references/api-contract.md` nesta etapa, não depois.

### Mock

O que o mock precisa cobrir, incluindo casos de borda. No Valide, todo mock de produto precisa dos quatro estados de validade representados.

## 5. Comportamento

Passo a passo do que acontece quando o usuário age. Um bloco por ação.

### Ação: <nome>

1. 
2. 
3. 

## 6. Estados da tela

| Estado | O que mostra | Texto |
| --- | --- | --- |
| Carregando | Skeleton com a forma do conteúdo | |
| Vazio | Ícone, frase, ação que resolve | |
| Erro | O que falhou e botão de tentar de novo | |
| Sem permissão | Explicação, sem beco sem saída | |

## 7. Validações

| Campo | Regra | Mensagem de erro |
| --- | --- | --- |
| | | |

Mensagem em português, dizendo o que fazer. Sem travessão.

## 8. Design

### Tokens usados

Só tokens de `01-references/design-system.md`. Zero hex.

| Elemento | Token |
| --- | --- |
| | |

### Cores de status

Se a tela exibe status de validade, confirmar:

- [ ] Vermelho, amarelo e verde só comunicam validade
- [ ] Produto sem lote usa `--status-unknown`, nunca verde
- [ ] Status tem cor mais ícone mais rótulo

### Responsividade

| Largura | Comportamento |
| --- | --- |
| 360px | |
| 768px | |
| 1440px | |

## 9. Permissões

| Cargo | Pode |
| --- | --- |
| Administrador | |
| Operador | |

A interface esconde, o servidor bloqueia.

## 10. Critérios de aceite

Verificáveis, um por linha. São eles que a etapa de Validate confere.

- [ ] 
- [ ] 
- [ ] Trata carregando, vazio, erro e sem permissão
- [ ] Funciona em 360px, 768px e 1440px
- [ ] Funciona em tema claro e escuro
- [ ] Zero hex solto
- [ ] Sem travessão nos textos
- [ ] `npx tsc --noEmit` sem erro e lint sem warning

## 11. Riscos técnicos

| Risco | Resposta |
| --- | --- |
| | |

## 12. Fora desta SPEC

O que fica para depois, explicitamente. Evita que a execução cresça sozinha.

- 

---

## Checklist antes de quebrar em issues

- [ ] Todo arquivo a criar e a modificar está listado
- [ ] Componentes reutilizáveis foram procurados na base, não assumidos como inexistentes
- [ ] Todo endpoint está no contrato de API
- [ ] Os quatro estados de tela estão especificados
- [ ] Critérios de aceite são verificáveis, não subjetivos
- [ ] Nada aqui exige criar backend, banco ou autenticação real
