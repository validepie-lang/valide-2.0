# Validation: Fase 1 - Esboço visual navegável

**Data:** 16/09/2026
**Escopo:** todas as rotas do `screen-map.md`, com dados mock, sem backend e sem lógica de negócio.
**Caminho:** curto (Plan, Execute, Validate), autorizado pelo Marcus por causa do prazo de entrega da noite. PRD e SPEC por tela ficam para as próximas fases.

## Resultado

**Passou, com três pendências registradas na seção 8.**

---

## 1. Critérios de aceite

| Critério | Passou | Observação |
| --- | --- | --- |
| Todas as rotas do mapa de telas existem e são navegáveis | sim | 15 rotas no build, nenhum link morto |
| Login e área logada construídos | sim | `/login` e o shell de `(app)` |
| Tema claro e escuro funcionando | sim | Tokens invertem por classe no `<html>`, sem piscar no carregamento |
| Dados mock plausíveis de farmácia | sim | 80 produtos reais, 63 lotes, valores em centavos não redondos |
| Nenhuma lógica de negócio nem backend | sim | Só estado de interface: passo do wizard, filtro na URL, fila de preenchimento |
| Aparência profissional, sem cara de gerador automático | sim | Ver seção 7 |

---

## 2. Aderência ao plano

| Verificação | Resultado |
| --- | --- |
| Cumpriu o que o plano previa | Sim, as cinco etapas |
| Nenhum arquivo fora da lista foi tocado | Sim. Uma exceção justificada: `next.config.ts`, para desligar a reescrita automática do `CLAUDE.md` pelo Next |
| Nenhum código duplicado | Sim. Tabela, chip, card, botão e estado vazio são componentes únicos |
| Componentes reutilizáveis foram de fato reutilizados | Sim. `StatusChip` aparece em 7 telas, `EmptyState` em 6, `MovementsTable` em 2 |
| Nenhuma funcionalidade extra inventada | Sim |

**Desvio consciente do plano:** o shadcn/ui não foi inicializado pelo CLI. Os primitivos foram escritos à mão, com a mesma API (variante por prop, `cn()`, `forwardRef`) e ligados aos tokens do Valide desde a primeira linha. Motivos: a aparência padrão do shadcn é a mais reconhecível como interface gerada, e o Radix traria dependências que este esboço não usa. Trocar por componentes do shadcn depois é substituir arquivo por arquivo, sem tocar em tela. Registrado em `07-decisions/technical-decisions.md`.

---

## 3. Qualidade técnica

| Verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Sem erro |
| `npx eslint src --max-warnings 0` | Sem erro e sem aviso |
| `npm run build` | Compila, 15 rotas |
| Hex solto em `.tsx` e `.ts` | Nenhum. Única exceção documentada: `themeColor` em `layout.tsx`, que o sistema operacional lê antes de existir CSS |
| Travessão (em-dash) | Nenhum, em código ou documentação |
| `any` | Nenhum |
| Componente acima de 200 linhas | Nenhum |
| Tela importando mock direto | Nenhuma. Todo dado passa por `src/lib/services/` |

---

## 4. Estados da tela

| Estado | Implementado | Como foi testado |
| --- | --- | --- |
| Carregando | Sim | Oito arquivos `loading.tsx`, um por segmento de rota. Conferidos nos dois temas |
| Vazio | Sim | `/estoque` sem resultado de busca e sem produto nenhum, fila zerada, produto sem lote, produto sem movimentação, pasta vazia |
| Erro | Sim | `/login?erro=1`, linha com problema na revisão de importação, integração com erro, produto inexistente em `/estoque/nao-existe` (404 próprio) |
| Sem permissão | Sim | `?cargo=operador` em `/configuracoes/empresa`, `/configuracoes/usuarios`, `/estoque/pastas` e `/configuracoes/integracoes`, esta última removida do escopo em 17/09 |

---

## 5. Security Review

| Item | Resultado |
| --- | --- |
| Chave, token ou credencial no código | Nenhuma |
| Credencial em `localStorage` ou em estado do cliente | Nenhuma. O único uso de `localStorage` é a preferência de tema, dentro de `try/catch` |
| Regra crítica de negócio no cliente | Nenhuma. `getExpiryStatus` roda só para feedback imediato no formulário e na fila, com a verdade continuando no servidor |
| Tenant enviado pelo cliente | Não existe. Nenhuma tela tem seletor de conta |
| Permissão verificada na interface | Sim, com o aviso escrito no código de que o servidor precisa bloquear também |
| Erro exibido vazando dado interno | Nenhum. As mensagens dizem o que aconteceu e o que fazer |
| Dado sensível em parâmetro de URL | Nenhum. Só filtro, busca, passo do wizard e o `cargo` de demonstração |
| Login revelando se o e-mail existe | Não. A mensagem é a mesma nos dois casos, com o motivo comentado no código |
| `dangerouslySetInnerHTML` | Uma ocorrência: o script de tema em `layout.tsx`, com string literal escrita por nós, sem dado de usuário |
| Dependência nova sem justificativa | Nenhuma. `lucide-react` e `recharts` já estavam na stack. `clsx` e `tailwind-merge` são o que o `cn()` exige |

---

## 6. UX Review

| O que | Onde | Corrigido |
| --- | --- | --- |
| Travessão usado como marcador de dado ausente | Tabela de produtos, revisão de importação, resumo da baixa | Sim. Agora o texto diz o que não há: "sem lote", "não veio no arquivo" |
| Botão primário com texto sem cor, escuro sobre escuro | Todo `Button` e `LinkButton` | Sim. O `tailwind-merge` classificava `text-body` como cor e apagava `text-primary-fg`. Corrigido em `cn.ts` |
| Gráfico de barras e rosca não desenhavam | Dashboard | Sim. Animação do Recharts desligada, o que também ajuda em máquina fraca |
| Rótulos do eixo se sobrepondo | Vencimentos por semana | Sim |
| Lista de notificações cortando frase no meio | Dashboard | Sim |
| Card herói com vão vazio | Dashboard | Sim. Preenchido com a proporção entre vencido e a vencer, que é informação, não decoração |
| Link quebrando em duas linhas | Login | Sim |
| Contraste do chip "A vencer" reprovando em AA | Design system | Sim. `--status-soon-fg` de `#92670E` (4,41:1) para `#8A610D` (4,84:1) |

**Checklist de vocabulário e cor:** Vencido, A vencer, No prazo e Sem validade em todas as telas, sem sinônimo. Vermelho, amarelo e verde só em validade. Produto sem lote nunca aparece verde, nem no chip nem na contagem de "No prazo". Chip sempre com cor, ícone e rótulo.

---

## 7. Visual

| Verificação | 360px | 768px | 1440px |
| --- | --- | --- | --- |
| Tema claro | Passou | Passou | Passou |
| Tema escuro | Passou | Passou | Passou |
| Sem rolagem horizontal | Passou | Passou | Passou |

Medição real em 360px feita renderizando o app dentro de um iframe de 360px, porque o Chrome no macOS não abre janela abaixo de 500px e o recorte da captura enganava. Resultado: `scrollWidth` igual ao `clientWidth`, nenhum elemento ultrapassando a largura.

Tabela vira lista de cards em `/estoque` e nas movimentações. A tabela de revisão da importação rola dentro do próprio contêiner, que é a exceção permitida.

Contraste conferido por cálculo em todos os pares usados: os quatro chips passam em AA nos dois temas, texto de apoio e botão primário também. Registrado em `design-system.md` seção 3.

---

## 8. Ajustes necessários

Nada bloqueia a entrega. Três pendências para as próximas fases:

1. ~~Skeleton não aplicado.~~ **Resolvida em 16/09.** Ver a seção 12.
2. ~~Navegação por teclado conferida por construção, não por uso.~~ **Resolvida em 16/09.** Ver a seção 11.
3. **Marca ainda é placeholder.** Logo e tipografia continuam indefinidos. Tudo está isolado em `src/components/layout/logo.tsx` e no token de fonte.

---

## 9. Documentação atualizada

- `01-references/design-system.md`: tokens do tema escuro para os chips, contraste corrigido do "A vencer", regra do tom sólido, bloco do Tailwind v4, tokens de foco, elevação e gráfico
- `07-decisions/technical-decisions.md`: Tailwind v4, primitivos próprios em vez do CLI do shadcn
- `07-decisions/ux-decisions.md`: ação destrutiva em neutro
- `08-project/plano.md`: fase 1 concluída
- `.claude/skills/componente-valide/SKILL.md`: `StatusChip` com os quatro estados
- `.claude/agents/ui-builder.md`: caminho correto das specs

`01-references/api-contract.md` não mudou. Nenhum endpoint novo foi consumido: a camada de serviço implementa exatamente o que já estava acordado.

---

## 10. Commit

`feat: add design tokens, data layer and first screens`
`feat: complete navigable visual draft of every screen`

---

## 11. Passada de teclado (16/09/2026)

Feita medindo a ordem de foco no DOM renderizado, não lendo o código. Uma ferramenta temporária percorreu cada tela listando os elementos focáveis na ordem do Tab, com nome acessível, altura do alvo e saltos verticais para trás. A ferramenta foi removida antes do commit.

### O que estava errado

| Problema | Onde | Gravidade | Correção |
| --- | --- | --- | --- |
| Menu da conta fechado mantinha os links no caminho do Tab | Cabeçalho, em todas as telas | **Alta** | O `<details>` foi trocado por um menu controlado que só existe no DOM quando está aberto |
| Gráficos entravam no Tab como elementos sem nome | Dashboard, dois pontos | Média | `accessibilityLayer={false}` e `rootTabIndex={-1}`. Os números continuam disponíveis em lista para leitor de tela |
| Não havia como pular o cabeçalho | Todas as telas | Média | Link "Pular para o conteúdo" como primeira parada, visível só quando recebe foco |
| Ao zerar a fila, o foco caía no `body` | Validades pendentes | Média | O foco vai para o título "Fila concluída" |
| Alvos de toque abaixo de 44px no celular | Tema, notificações, avatar, logo | Baixa | 44px no celular, 40px no desktop |

O primeiro é o que mais importava: **"Sair da conta" era alcançável por Tab sem nada aparecer na tela.** Quem navega por teclado podia sair da conta sem querer, em qualquer tela do sistema.

### O que já estava certo

- **A ordem de foco acompanha a ordem visual em todas as telas.** O único salto para trás que sobra é a barra de navegação inferior do celular, que fica por último no DOM de propósito.
- **Fila de validades:** lote, validade, quantidade, "Salvar e ir para o próximo", "Pular este". Enter salva e avança, e o foco volta sozinho para o campo de lote.
- **Baixa:** os lotes como grupo de rádio dentro de `fieldset` com legenda, depois quantidade, motivo, observação e as ações. FEFO vem pré-selecionado, então quem usa só teclado não precisa mexer na seleção.
- **Cadastro de produto:** 19 paradas, do nome até "Salvar produto", exatamente na ordem em que os campos aparecem.
- Todo input tem label associado, explícito por `htmlFor` ou implícito envolvendo o campo.
- Foco visível desenhado em tudo, com anel de 2px e 2px de deslocamento, nunca o padrão do navegador removido.

### Números por tela, depois das correções

| Tela | Paradas de Tab | Com observação | Saltos para trás |
| --- | --- | --- | --- |
| Dashboard | 46 | 10, todas `display:none` que o navegador já pula | 2, ambos da barra inferior |
| Validades pendentes | 19 | 9, mesma situação | 1 |
| Baixa de produto | 20 | 6, mesma situação | 1 |
| Cadastro de produto | 36 | 10, mesma situação | 2 |

As observações que sobraram são de elementos escondidos por `display:none` no celular (navegação em pill, busca do cabeçalho, tabela que vira card). O navegador não os coloca no Tab, então não são problema.

### O que ainda não foi feito

Falta a passada com leitor de tela de verdade (VoiceOver). A auditoria mediu ordem de foco, nome acessível e tamanho de alvo, mas não como cada tela é anunciada.

---

## 12. Estados de carregando (16/09/2026)

Oito arquivos `loading.tsx`, um por segmento de rota, cada um com a forma do conteúdo que vai chegar. Nenhum spinner.

| Rota | O que o skeleton desenha |
| --- | --- |
| `/` | Herói, dois cards de indicador empilhados, card de pendências, dois gráficos, tabela e o painel lateral inteiro |
| `/estoque` | Cabeçalho, busca, chips de filtro de larguras diferentes, e a grade de colunas da tabela. No celular vira card, como a tabela real |
| `/estoque/[id]` | Lotes, histórico e as três fichas laterais |
| `/estoque/validades-pendentes` | Card do produto, os três campos na altura real do input, as duas ações, progresso e a fila |
| `/estoque/novo` | Âncoras laterais e as quatro seções com a contagem certa de campos |
| `/estoque/importar` | Trilha de etapas e a divisão de duas colunas do wizard |
| `/estoque/pastas` | Lista de pastas e os dois cards laterais |
| `/configuracoes` | Só o conteúdo da aba, porque cabeçalho e abas vivem no layout e já estão na tela |

### Como foram conferidos

Renderizando cada skeleton em uma rota temporária e comparando lado a lado com a tela real, em tema claro e escuro. A rota foi removida antes do commit.

Uma correção saiu daí: a listagem de estoque estava usando o skeleton de lista, com ícone redondo à esquerda, mas a tela real é uma tabela com oito colunas. Ganhou um skeleton próprio, com a mesma grade, que também vira card no celular.

### Detalhes que não são óbvios

- Cada skeleton fica dentro de um contêiner com `aria-busy` e um texto só para leitor de tela ("Carregando o painel"), para quem não vê a animação saber que a espera é temporária.
- O `loading.tsx` de configurações cobre só o conteúdo da aba. Cabeçalho e abas estão no layout, então repetir os dois em skeleton faria a tela piscar duas vezes.
- As larguras dos blocos variam de propósito. Bloco de tamanho igual não parece conteúdo, parece defeito.

### Limite conhecido

Hoje os serviços devolvem mock, que resolve na hora. O `loading.tsx` cria a fronteira de Suspense e o skeleton fica pronto, mas ele só vai aparecer de verdade quando a camada de serviço passar a fazer `fetch` na API do Pedro, na fase 6. A conferência visual foi feita renderizando os componentes direto, não esperando a rede.
