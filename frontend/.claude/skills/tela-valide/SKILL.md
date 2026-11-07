---
name: tela-valide
description: Leva uma tela do Valide pela esteira de produção de 12 etapas, da ideia ao commit. Use ao criar ou refazer qualquer página do app (dashboard, estoque, importação, fila de validades, cadastro de produto, baixa, login, configurações).
---

# Construir uma tela do Valide pela esteira

A esteira existe para evitar o resultado de sempre: tela grande, com hex solto, sem estados, feita de um prompt só.

**Execute uma etapa por vez.** Ao terminar cada uma, diga o que fez e pare para confirmação antes da próxima.

## Antes de começar

Leia, nesta ordem:

1. `CLAUDE.md`
2. `docs/01-references/workflow.md`
3. `docs/00-context/business-rules.md`
4. `docs/01-references/design-system.md`
5. `docs/01-references/screen-map.md`, a seção da tela

Se o usuário não disse qual tela, pergunte antes de qualquer coisa.

## As 12 etapas

### 1. Ideia
Descrever em linguagem simples o que se quer. Sem código.

### 2. Discovery
Perguntar antes de decidir: quem acessa, qual pergunta a tela responde, quais dados vêm da API, o que acontece sem dado, o que acontece com produto sem validade, funciona no celular, o que **não** deve ser feito agora.

**Pesquisar `src/components/` antes de propor componente novo.** Duplicar componente é o erro mais caro e mais silencioso do projeto.

### 3. PRD
Template em `docs/02-prd/prd-template.md`. Salvar como `docs/02-prd/prd-<slug>.md`. Documento de produto, não de código.

### 4. SPEC
Template em `docs/03-specs/spec-template.md`. Salvar como `docs/03-specs/spec-<slug>.md`. Rotas, arquivos a criar e modificar, componentes a reutilizar, tipos, serviços, endpoints, estados, validações, tokens, permissões, critérios de aceite.

Todo endpoint novo entra em `docs/01-references/api-contract.md` **nesta etapa**, não depois.

### 5. Issues
Template em `docs/04-issues/issue-template.md`. Quebrar em tarefas que cabem em uma sessão de trabalho. "Crie a tela de importação" não é issue, é SPEC.

### 6. Plan
Template em `docs/05-plans/plan-template.md`. **Pesquisar a base de código antes de escrever o plano.** Listar arquivos a criar, a modificar, componentes a reutilizar, tokens, endpoints, cenários de erro.

O plano precisa de aprovação do Marcus antes de qualquer código.

### 7. Execute
Uma issue por vez, seguindo o plano. Sem funcionalidade extra, sem avançar para a próxima issue, sem tocar em arquivo fora da lista.

### 8. Validate
Conferir contra os critérios de aceite. Resultado explícito: passou, falhou ou precisa de ajuste. Template em `docs/06-validations/validation-template.md`.

### 9. Security Review
Checklist em `docs/01-references/security-rules.md`. Obrigatório em qualquer issue que toque em dado, credencial, permissão ou isolamento entre contas.

### 10. UX Review
Checklist em `docs/01-references/workflow.md`, etapa 10. Rodar o agente `design-reviewer`.

### 11. GitHub
`tipo: descrição em inglês`. Uma issue, um commit.

### 12. Documentação
Atualizar contrato de API, design system, mapa de telas e o arquivo de decisões que couber.

## Regras que você nunca quebra

- **Somente frontend.** Se a tarefa pedir backend, banco ou auth real, pare e avise.
- Vermelho, amarelo e verde só comunicam validade.
- **Produto sem lote nunca aparece como verde.** Usa o neutro `--status-unknown`.
- Status sempre com cor **mais** ícone **mais** rótulo.
- Zero hex solto. Se falta token, ele entra no design system primeiro.
- Código em inglês, interface em português do Brasil.
- **Nunca use travessão (em-dash).**
- Vocabulário fixo: Vencido, A vencer, No prazo, Sem validade.
- Toda tela trata carregando, vazio, erro e sem permissão.
- Nenhuma tela importa mock direto, sempre via `src/lib/services/`.
- Componente com mais de 200 linhas deve ser quebrado.

## Ao terminar cada etapa

Diga o que produziu, onde salvou, e qual é a próxima etapa. Não emende duas etapas no mesmo turno.
