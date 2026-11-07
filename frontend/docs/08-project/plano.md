# plano.md: Execução do Frontend do Valide

Plano de trabalho do Marcus, amarrado ao backlog oficial do PIE e ao cronograma de sprints.
Cada fase tem entrada, saída e os IDs do backlog que ela fecha.

---

## Visão geral das fases

| Fase | Nome | Entrega | Backlog | Prazo alvo |
| --- | --- | --- | --- | --- |
| 0 | Documentação e fundação | Este repositório, docs e decisões | preparo de B12 | concluída em 16/09 |
| 1 | Esboço navegável | Telas estáticas com dados mock | B12, B13, B14 | concluída em 16/09 |
| 2 | Design system real | Tokens, primitivos, tema claro e escuro | B13 | concluída em 16/09 |
| 3 | Shell e autenticação | Layout, navegação, login | B35, B36 | 24/10 |
| 4 | Núcleo do estoque | Cadastro, listagem, pastas | B38, B39, B40 | 07/11 |
| 4b | Importação e validades | Wizard de importação por planilha, fila de validades | novo | 07/11 |
| 5 | Validade e baixa | Dashboard, indicadores, baixa | B37, B41, B46, B47, B48, B49 | 14/11 |
| 6 | Integração e polimento | Ligar na API, notificações, responsividade | B42, B43, B44 | 21/11 |
| 7 | Correções e apresentação | Bugs do QA, material de apresentação | B59, B67 | até a entrega final |

---

## Fase 0. Documentação e fundação (hoje)

**Objetivo:** chegar na reunião de hoje à noite com direção visual e técnica fechada, não com opinião.

Entregas:

- `CLAUDE.md` com regras do projeto
- `docs/01-references/design-system.md` com a paleta traduzida em tokens
- `docs/01-references/screen-map.md` com as abas e o que tem em cada uma
- `docs/01-references/api-contract.md` com o primeiro rascunho dos endpoints
- `docs/01-references/workflow.md` com o fluxo de produção de cada tela
- Agentes do projeto em `.claude/agents/`

**Saída da fase:** a equipe entende o que o frontend vai construir e o Pedro sabe o que precisa expor.

---

## Fase 1. Esboço navegável

**Status: concluída em 16/09/2026.** Todas as rotas do mapa de telas estão navegáveis com dados mock, nos dois temas e nas três larguras. Relatório em `docs/06-validations/validation-fase-1-esboco-visual.md`.

As fases 1 e 2 foram entregues juntas, porque construir tela sem token pronto teria gerado retrabalho imediato.

**Objetivo:** protótipo clicável, sem backend, para validar com a equipe e com a farmácia parceira (B15).

Ordem de construção:

1. Projeto Next criado, Tailwind e shadcn configurados, tokens aplicados
2. Shell da aplicação: navegação em pill no topo, área de conteúdo, avatar e notificações
3. **Home / Dashboard** com os três indicadores de validade, ações rápidas e lista de vencimentos próximos
4. **Estoque**: tabela de produtos com lote e validade, filtros, busca
5. **Cadastro de produto**: formulário completo em etapas
6. **Login e cadastro de empresa**
7. **Configurações**: perfil, permissões, preferências da empresa

Tudo com dados mock realistas: nomes de medicamento de verdade, lotes plausíveis, datas que produzem os três status. Um mock ruim faz a demo parecer falsa.

**Saída da fase:** protótipo navegável entregue (B14), apresentado para a equipe e registrado como evidência acadêmica.

---

## Fase 2. Design system real

Em paralelo com a fase 1, e consolidado ao final dela.

- CSS variables para claro e escuro
- Tailwind apontando para as variables
- Primitivos revisados: Button, Input, Select, Card, Badge, Table, Dialog, Tabs, Toast
- Componentes de domínio: `StatusChip`, `ExpiryIndicatorCard`, `ProductRow`, `LotBadge`
- Checagem de contraste de todos os pares de cor usados

**Saída:** nenhum hex solto no código, tema claro e escuro funcionando com um clique.

---

## Fase 3. Shell e autenticação

Depende do Pedro entregar B24 (autenticação).

- Tela de login ligada no endpoint real
- Guarda de rota na área logada
- Contexto de sessão com conta (tenant) e usuário
- Cadastro de empresa com busca de CEP e validação de CNPJ no formato
- Estado de "sem permissão" quando o cargo for Operador

**Saída:** entrar e sair de verdade, com a conta correta carregada.

---

## Fase 4. Núcleo do estoque

Depende de B27, B28, B30.

- Formulário de cadastro de produto ligado na API
- Listagem com paginação, busca e filtro por pasta
- Pastas de classificação: criar, renomear, mover produto
- Validação de formulário com feedback por campo

**Saída:** cadastrar, classificar e consultar produto ponta a ponta.

---

## Fase 4b. Importação e fila de validades

Decidida em 16/09. Estratégia completa em `docs/01-references/import-strategy.md`.

Ordem de construção, e ela importa:

1. **Wizard de importação por arquivo**, os quatro passos. Não depende de ninguém de fora, então começa aqui
2. **Fila de validades pendentes.** Sem ela a importação entrega um banco de dados inútil
3. **Card de validades pendentes no dashboard**, que é o que leva o usuário até a fila
**A tela de integrações saiu do escopo em 17/09.** A equipe concluiu, na reunião, que depender de acesso de fornecedor não cabe no prazo do piloto. Os itens 1 a 3 nunca dependeram de terceiro, então nada precisou ser refeito: era exatamente o plano de retorno previsto em `import-strategy.md` seção 7.

O piloto roda com planilha e cadastro manual. A integração volta como projeto futuro, quando e se o piloto se provar.

**Saída:** cliente sai do zero para um estoque com validades preenchidas sem digitar produto a produto.

---

## Fase 5. Validade e baixa

O diferencial do produto. É aqui que a apresentação final se ganha ou se perde.

- Três indicadores calculados pela API e exibidos no dashboard
- Filtro do dashboard que leva para a listagem já filtrada
- Fluxo de baixa com motivo (venda, avaria, roubo, vencimento, consumo interno)
- Sugestão FEFO: ao dar baixa, o sistema sugere o lote que vence primeiro
- Histórico de movimentação visível no produto

**Saída:** MVP integrado com validade, dashboard e baixa (marco de 14/11).

---

## Fase 6. Integração e polimento

- Todos os mocks substituídos por fetch real
- Notificações visuais (B43)
- Responsividade revisada em 360, 768 e 1440 (B44)
- Estados de carregando, vazio e erro revisados tela por tela

---

## Fase 7. Correções e apresentação

- Bugs priorizados pelo João (B58, B59)
- Apoio na apresentação comercial com o Eduardo (B67)
- Capturas de tela e gravação de fluxo para o portfólio digital (B76)

---

## Dependências críticas de outras pessoas

| Preciso de | De quem | Backlog | Bloqueia minha fase |
| --- | --- | --- | --- |
| Endpoint de autenticação | Pedro | B24 | 3 |
| Endpoints de produto | Pedro | B27, B30 | 4 |
| Endpoint de pastas | Pedro | B28 | 4 |
| Dados de dashboard | Pedro | B32 | 5 |
| Endpoint de baixa | Pedro | B31 | 5 |
| Modelo de lote e validade | Antônio | B29 | 4 e 5 |
| Endpoints de importação | Pedro | novo | 4b |
| Regra de duplicata na importação | Pedro e Antônio | novo | 4b |

A janela de "a vencer" foi fechada em 30 dias (16/09), então B45 deixou de ser bloqueio.

**Regra de proteção:** enquanto a dependência não chega, a fase avança com mock. Nenhuma fase para esperando alguém. O que não pode acontecer é a integração inteira ficar para a última semana.

---

## Riscos do frontend

| Risco | Resposta |
| --- | --- |
| Contrato de API mudar depois de pronto | Manter `api-contract.md` acordado com o Pedro por escrito antes de cada fase |
| Escopo visual crescer (animação, gráfico bonito demais) | Só polir depois que o fluxo essencial estiver de pé |
| Integração concentrada no fim | Integrar uma tela por vez assim que o endpoint existir |
| Marca e tipografia indefinidas | Trabalhar com placeholder e isolar em tokens, para trocar em um lugar só |
| ~~Integração por API não sair a tempo~~ | **Aconteceu em 17/09, e o plano de retorno funcionou.** A importação por arquivo já estava construída e independente, então o escopo encolheu sem retrabalho |
| Importação trazer produto mas não validade | Fila de validades pendentes desenhada como parte do produto, não como remendo |
