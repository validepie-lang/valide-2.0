# Valide: Frontend

SaaS de gestão de estoque com foco em controle de validade.
Projeto Integrador de Extensão I, Análise e Desenvolvimento de Sistemas, UNIFAN, 2026.2.

Esta pasta contém **apenas o frontend**. O backend e o banco vivem no mesmo repositório, em `backend/` e `banco/`. Visão geral do projeto no README da raiz.

| Papel | Responsável |
| --- | --- |
| Frontend e prototipação | Marcus Campos |
| Backend e API | Pedro |
| Banco de dados | Antônio |
| QA e testes | João |

---

## Como trabalhamos

Este projeto segue a **Esteira Profissional de Produção com IA**:

```
Ideia → Discovery → PRD → SPEC → Issues → Plan → Execute
      → Validate → Security Review → UX Review → GitHub → Documentação
```

Clareza antes do código, planejamento antes da execução, validação antes de avançar.

O método completo, adaptado ao Valide, está em [`docs/01-references/workflow.md`](./docs/01-references/workflow.md). Leia antes de pedir qualquer coisa ao Claude Code.

---

## Estrutura da documentação

```
CLAUDE.md                    manual operacional do Claude Code
docs/
  00-context/                o que é o projeto, para quem, quais regras
    project-overview.md
    target-audience.md
    business-rules.md
  01-references/             como construir
    workflow.md              a esteira de 12 etapas
    architecture.md          stack, camadas, convenções
    design-system.md         paleta Ardósia, tokens, componentes
    security-rules.md        regras de segurança do front
    api-contract.md          interface com o backend
    screen-map.md            rotas e conteúdo de cada tela
    import-strategy.md       estratégia de entrada de dados
  02-prd/                    documentos de produto
  03-specs/                  especificações técnicas
  04-issues/                 tarefas pequenas
  05-plans/                  plano de cada issue
  06-validations/            relatório de validação
  07-decisions/              decisões técnicas, de UX e de segurança
  08-project/                plano de fases e pauta de reunião
```

Cada pasta numerada de 02 a 06 tem um template correspondente.

---

## Por onde começar

**Se você nunca viu este projeto:**

1. [`docs/00-context/project-overview.md`](./docs/00-context/project-overview.md)
2. [`docs/00-context/target-audience.md`](./docs/00-context/target-audience.md)
3. [`docs/00-context/business-rules.md`](./docs/00-context/business-rules.md)

**Se você vai construir algo:**

1. [`CLAUDE.md`](./CLAUDE.md)
2. [`docs/01-references/workflow.md`](./docs/01-references/workflow.md)
3. [`docs/01-references/design-system.md`](./docs/01-references/design-system.md)
4. [`docs/01-references/architecture.md`](./docs/01-references/architecture.md)

**Se você precisa saber o que está decidido:**

- [`docs/07-decisions/`](./docs/07-decisions/)
- [`docs/08-project/pauta-reuniao.md`](./docs/08-project/pauta-reuniao.md)

---

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, lucide-react, Recharts. Deploy na Vercel.

---

## Agentes e skills do projeto

Em `.claude/agents/`:

- **`ui-builder`**: constrói telas e componentes seguindo a esteira
- **`design-reviewer`**: revisa contra o design system e acessibilidade
- **`api-contract`**: mantém contrato, tipos, mocks e serviços sincronizados

Em `.claude/skills/`:

| Skill | Quando usar |
| --- | --- |
| `tela-valide` | Levar uma tela pela esteira, da ideia ao commit |
| `componente-valide` | Criar componente com todas as variantes e estados |
| `copy-valide` | Escrever ou revisar texto de interface |
| `mock-farmacia` | Gerar dados de demonstração realistas |

---

## Estado atual

Fase 0 concluída: documentação e fundação.
Próximo passo: criar o projeto Next e começar a esteira pela Home (fase 1).
