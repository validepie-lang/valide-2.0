# workflow.md: Esteira de Produção do Valide

Adaptação da Esteira Profissional de Produção com IA ao frontend do Valide.

**Fluxo oficial:**

```
Ideia → Discovery → PRD → SPEC → Issues → Plan → Execute
      → Validate → Security Review → UX Review → GitHub → Documentação
```

A regra-mãe: **clareza antes do código, planejamento antes da execução, validação antes de avançar.**

---

## Quando usar a esteira completa

Sempre que a funcionalidade tiver impacto real: múltiplos arquivos, regra de negócio, dado sensível, permissão de usuário, ou necessidade de manutenção futura.

No Valide, isso é praticamente toda tela. Dashboard, importação, cadastro de produto, baixa, fila de validades: todas passam pelo fluxo completo.

**Caminho curto**, com Plan, Execute e Validate apenas, vale para: ajuste de texto, correção de espaçamento, troca de ícone, correção de bug pontual com causa já identificada. Nada que mude comportamento ou toque em mais de um arquivo.

---

## Adaptação ao papel do Marcus

Este repositório é **somente frontend**. Isso muda três etapas:

**No PRD:** o Marcus registra a visão de produto do ponto de vista da interface. Regras de negócio que pertencem ao backend entram como dependência, não como escopo.

**Na SPEC:** toda necessidade de dado vira uma linha no contrato de API (`01-references/api-contract.md`), nunca uma implementação de servidor.

**No Security Review:** o princípio **Thin Client, Fat Server** é a própria regra de escopo deste repositório. O front captura intenção e exibe resposta. Regra crítica, permissão, cálculo sensível e isolamento entre contas ficam no backend do Pedro. Se uma tarefa exigir o contrário, pare e avise.

---

## Etapa 1. Ideia

Descrever em linguagem simples o que se quer criar. Sem código, sem tela, sem componente.

> "Quero uma tela onde o usuário veja o que está vencendo e resolva antes de perder o produto."

**Entrega:** uma descrição curta, em português, no chat ou no topo do PRD.

---

## Etapa 2. Discovery

Investigar antes de decidir. A IA faz perguntas, mapeia riscos, identifica o que já existe no projeto e o que pode ser impactado.

Perguntas obrigatórias no Valide:

- Quem acessa essa tela: Administrador, Operador, ou os dois?
- Qual pergunta o usuário responde aqui?
- Quais dados vêm da API, e eles já existem no contrato?
- Existe componente ou tela parecida já construída que possa ser reutilizada?
- O que acontece quando não há dado nenhum?
- O que acontece com produto sem validade informada?
- Isso funciona no celular, ou é só desktop?
- O que **não** deve ser feito agora?

**Regra de reuso:** antes de propor qualquer componente novo, pesquisar `src/components/` e `01-references/design-system.md`. Duplicar componente é o erro mais caro e mais silencioso do projeto.

**Entrega:** perguntas respondidas, riscos listados, dúvidas que precisam da equipe separadas das que o Marcus resolve sozinho.

---

## Etapa 3. PRD

Documento de produto, não de código. Responde: qual problema, para quem, por que importa, o que entra no escopo, o que fica de fora, quais critérios indicam sucesso.

Template: `docs/02-prd/prd-template.md`
Salvar como: `docs/02-prd/prd-<funcionalidade>.md`

No Valide, todo PRD considera: usuário de balcão sem familiaridade com tecnologia, vocabulário de farmácia, e o fato de o produto ser a camada de validade sobre o estoque que a farmácia já tem.

**Entrega:** PRD em markdown, commitado.

---

## Etapa 4. SPEC

Especificação técnica. Transforma o PRD em instrução executável.

Lista: rotas, componentes, arquivos a criar, arquivos a modificar, estados de erro, estados vazios, tokens de cor usados, endpoints consumidos, permissões por cargo, critérios de aceite e riscos técnicos.

Template: `docs/03-specs/spec-template.md`
Salvar como: `docs/03-specs/spec-<funcionalidade>.md`

Uma SPEC boa impede a IA de inventar padrão, duplicar componente ou mexer em arquivo errado.

**Entrega:** SPEC em markdown, com critérios de aceite mensuráveis.

---

## Etapa 5. Issues

Quebrar a SPEC em tarefas pequenas. Uma issue é uma página, um comportamento, uma integração, uma validação ou uma revisão.

Template: `docs/04-issues/issue-template.md`
Salvar como: `docs/04-issues/<numero>-<slug>.md`

Exemplo real, para a tela de importação:

```
001-tipos-e-mocks-importacao.md
002-componente-import-source-picker.md
003-componente-column-mapper.md
004-tela-wizard-passo-origem.md
005-tela-wizard-passo-mapeamento.md
006-tela-wizard-passo-revisao.md
007-tela-wizard-passo-resultado.md
008-estados-vazios-e-erros.md
009-responsividade.md
010-revisao-seguranca.md
011-revisao-ux.md
```

**Regra de tamanho:** se uma issue não cabe em uma sessão de trabalho, ela é grande demais. "Crie a tela de importação" não é issue, é SPEC.

**Entrega:** issues numeradas, em ordem de dependência.

---

## Etapa 6. Plan

Planejar uma issue antes de executar. Esta é a etapa que mais economiza retrabalho, e é a mais pulada.

O plano responde:

- Quais arquivos serão **criados**
- Quais arquivos serão **modificados**
- Quais componentes existentes serão **reutilizados**
- Quais tokens do design system serão usados
- Quais endpoints do contrato serão consumidos
- Quais cenários de erro existem
- Quais critérios de aceite precisam ser cumpridos

Template: `docs/05-plans/plan-template.md`
Salvar como: `docs/05-plans/plan-<numero>-<slug>.md`

A IA deve **pesquisar a base de código** antes de escrever o plano. Se já existe botão, card, layout, hook ou serviço parecido, reutiliza.

**Entrega:** plano aprovado pelo Marcus antes de qualquer código.

---

## Etapa 7. Execute

Implementar uma issue por vez, seguindo o plano aprovado.

Nesta etapa a IA **não**:

- inventa funcionalidade extra
- avança para a próxima issue
- mexe em arquivo fora da lista do plano
- escreve hex solto
- cria backend, schema ou autenticação real

Ao final, informa: arquivos alterados, o que foi implementado, o que precisa de validação.

**Entrega:** código da issue, e só dela.

---

## Etapa 8. Validate

Conferir a entrega contra os critérios de aceite. Resultado explícito: **passou**, **falhou** ou **precisa de ajuste**.

Verificar:

- Cumpriu o plano
- Não mexeu em arquivo fora da lista
- Não duplicou código
- Tratou carregando, vazio, erro e sem permissão
- Funciona em 360px, 768px e 1440px
- Funciona em tema claro e escuro
- `npx tsc --noEmit` sem erro, lint sem warning

Template: `docs/06-validations/validation-template.md`
Salvar como: `docs/06-validations/validation-<numero>-<slug>.md`

**Entrega:** relatório de validação.

---

## Etapa 9. Security Review

Obrigatória em qualquer issue que toque em dado de cliente, credencial, permissão ou isolamento entre contas.

Checklist do frontend do Valide:

- [ ] Nenhuma chave, token ou credencial no código do front
- [ ] Nenhuma credencial de sistema de terceiro no `localStorage` ou em estado do cliente
- [ ] Nenhuma regra crítica de negócio no cliente. Thin Client, Fat Server
- [ ] O tenant nunca é enviado pelo cliente, vem sempre do token
- [ ] Permissão por cargo verificada na interface **e** no servidor. A interface esconde, o servidor bloqueia
- [ ] Erro exibido ao usuário não vaza dado interno, id, stack ou nome de tabela
- [ ] Nenhum dado sensível em parâmetro de URL
- [ ] Login não revela se um e-mail existe

Referência: `01-references/security-rules.md`

**Entrega:** checklist marcado, ou lista do que precisa mudar.

---

## Etapa 10. UX Review

Quem usa o Valide é balconista de farmácia e dono de comércio pequeno, não usuário de produto de tecnologia.

Checklist:

- [ ] A tela responde uma pergunta clara do usuário
- [ ] Hierarquia visual: o mais importante aparece primeiro
- [ ] Nenhum jargão técnico no texto
- [ ] Botões dizem o que acontece, nunca "OK" ou "Confirmar" sozinho
- [ ] Mensagem de erro diz o que fazer em seguida
- [ ] Estado vazio tem ação que resolve, não é mudo
- [ ] Status de validade tem cor **mais** ícone **mais** rótulo
- [ ] Produto sem validade nunca aparece como verde
- [ ] Contraste em AA, input com label, fluxo principal por teclado
- [ ] Sem travessão em nenhum texto
- [ ] Zero hex solto, só tokens do design system

Ferramentas: o agente `design-reviewer` e as skills `design:design-critique` e `design:accessibility-review`.

**Entrega:** checklist marcado, ou lista de correções.

---

## Etapa 11. GitHub

Depois de validada, a entrega vira commit.

Padrão: `tipo: descrição curta em inglês`

```
feat: add expiry status chip component
fix: correct lot date validation on product form
docs: add spec for import wizard
refactor: extract product table row into component
style: align dashboard card spacing to scale
```

Uma issue, um commit. Commit que junta três issues destrói a rastreabilidade que a esteira inteira construiu.

**Entrega:** commit claro, versionado.

---

## Etapa 12. Documentação

Memória do projeto. Ao fechar um ciclo, atualizar o que mudou:

| Documento | Quando atualizar |
| --- | --- |
| `01-references/api-contract.md` | Qualquer endpoint novo ou alterado |
| `01-references/design-system.md` | Token, componente ou regra visual nova |
| `01-references/screen-map.md` | Tela ou rota nova |
| `07-decisions/technical-decisions.md` | Decisão técnica com alternativa descartada |
| `07-decisions/ux-decisions.md` | Decisão de experiência ou de copy |
| `07-decisions/security-decisions.md` | Decisão que afeta dado ou permissão |
| `08-project/plano.md` | Fase concluída ou prazo mudado |
| `08-project/pauta-reuniao.md` | Pergunta nova para a equipe, ou item fechado |

Também: screenshot da tela em claro e escuro para o portfólio digital (backlog B76).

**Entrega:** documentação em dia. Sem isso, o próximo ciclo começa no escuro.

---

## Fórmula operacional

Para cada funcionalidade nova:

1. Descrever a ideia em linguagem simples
2. Discovery com perguntas e pesquisa na base de código
3. Gerar o PRD
4. Gerar a SPEC
5. Quebrar em issues pequenas
6. Planejar a primeira issue
7. Executar só a primeira issue
8. Validar
9. Security Review e UX Review
10. Commit
11. Atualizar documentação
12. Só então ir para a próxima issue

---

## Como pedir isso no Claude Code

Uma etapa por prompt. Pedir tudo de uma vez produz tela grande, com hex solto e sem estados, que é exatamente o que a esteira existe para evitar.

```
"Leia CLAUDE.md e docs/01-references/. Vamos fazer Discovery da tela de importação."

"Gere o PRD da importação em docs/02-prd/prd-importacao.md, usando o template."

"Gere a SPEC em docs/03-specs/spec-importacao.md."

"Quebre a SPEC em issues em docs/04-issues/."

"Planeje a issue 001 em docs/05-plans/."

"Execute a issue 001, seguindo o plano. Só ela."

"Valide a issue 001 contra os critérios de aceite."

"Rode o Security Review e o UX Review da issue 001."
```

---

## O que evitar

- Pedir código direto, sem PRD, SPEC ou issue planejada
- Tarefa grande demais: "crie todo o dashboard"
- Deixar a IA decidir sozinha quais arquivos mexer
- Código duplicado por falta de pesquisa na base existente
- Regra crítica de negócio no frontend
- Avançar sem validar a etapa anterior
- Documentação desatualizada
- Criar backend neste repositório

---

## Ordem de produção das telas

1. Shell e navegação
2. Home / Dashboard
3. Estoque (listagem)
4. Importação de catálogo
5. Fila de validades pendentes
6. Cadastro de produto
7. Baixa de produto
8. Login
9. Cadastro de empresa
10. Configurações e integrações

O dashboard vem cedo porque é a tela que sustenta a apresentação. Importação e fila de validades vêm logo depois porque, sem elas, o produto não tem como sair do zero em um cliente real.
