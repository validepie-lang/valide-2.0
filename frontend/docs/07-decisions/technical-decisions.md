# technical-decisions.md: Decisões Técnicas

Registro de decisões com a alternativa que foi descartada e o motivo. Serve para não reabrir discussão já resolvida, e para entender o porquê meses depois.

Formato: uma seção por decisão, mais recente no topo.

---

## 2026-10-08: "Hoje" é o dia do calendário da farmácia, e o instante aparece no fuso dela

**Decisão:** toda conta de dias (`daysUntil`, `getExpiryStatus`) usa como hoje o dia do calendário de Brasília (`calendarToday()` em `src/lib/utils/calendar.ts`), não o dia em UTC. Toda hora de evento aparece no mesmo fuso (`formatEventTime`). Data de validade continua lida em UTC, porque é data, não instante.

**Por quê:** o servidor da Vercel roda em UTC. Entre 21h e meia-noite de Brasília o UTC já está no dia seguinte, e nessas três horas "vence em 12 dias" aparecia como 11, e um lote que vence amanhã aparecia como Vencido na prévia do formulário. Achado na validação da issue 007, corrigido na 016.

**Descartado:** usar o fuso da máquina (`getDate()`, `getTimezoneOffset()`). O servidor está em UTC e o computador do caixa pode estar com o fuso errado. O fuso é explícito e a data é lida pelo `Intl`.

**Limite:** o fuso é fixo em `America/Sao_Paulo` até a sessão (com `Company.timezone`) chegar aos componentes que contam dias. O cálculo oficial é do backend; a pauta 2.6 pergunta em que fuso o banco decide o dia.

---

## 2026-09-16: Primitivos escritos à mão, não gerados pelo CLI do shadcn

**Decisão:** os primitivos de interface (Button, Card, Input, Select, Skeleton, Progress, Avatar) foram escritos neste repositório, seguindo a mesma API do shadcn/ui (variante por prop, `cn()`, `forwardRef`), mas ligados aos tokens do Valide desde a primeira linha.

**Por quê:** a aparência padrão do shadcn é a mais reconhecível como interface gerada automaticamente, e o Marcus pediu explicitamente um resultado que não tenha essa cara. Além disso, o CLI traz Radix e um segundo conjunto de tokens (`--background`, `--foreground`) que precisaria ser mapeado para o nosso de qualquer forma.

**Descartado:** `npx shadcn init` e depois recustomizar cada componente.

**Consequência:** a stack continua sendo a mesma do `architecture.md`, porque shadcn não é biblioteca instalada, é código copiado para dentro do projeto. Trocar um primitivo nosso por um do shadcn depois é substituir um arquivo, sem tocar em tela nenhuma.

**Confirmada pelo Marcus em 16/09/2026**, depois de ver o resultado das telas. A alternativa de rodar o CLI e migrar tela por tela foi apresentada e descartada.

**Revisar se:** aparecer necessidade de componente com acessibilidade complexa (combobox, menu flutuante com navegação por setas). Aí vale trazer o Radix para aquele componente específico, sem trocar os outros.

---

## 2026-09-17: Integração com o sistema da farmácia sai do escopo do piloto

**Decisão:** o piloto entra com duas origens de dado, planilha e cadastro manual. A integração por API com o sistema que a farmácia já usa vira projeto futuro, para depois do piloto se provar.

**Por quê:** a equipe concluiu na reunião de 17/09 que depender de acesso de fornecedor não cabe no prazo do piloto. É o risco que `import-strategy.md` seção 4 já listava em 16/09, com esta mesma resposta.

**Descartado:** segurar o piloto esperando contrato com fornecedor.

**Consequência, e o ponto que vale registrar:** o custo foi uma tela e três cards. O wizard de importação, a fila de validades, o dashboard, o estoque, a baixa e o cadastro não mudaram uma linha, porque o fluxo de revisão foi desenhado agnóstico de origem desde o começo. Quando a integração voltar, ela entra como um terceiro card no passo 1 e usa os passos 2, 3 e 4 que já existem.

**O que saiu:** a rota `/configuracoes/integracoes`, o tipo `Integration`, o mock e o serviço correspondentes, a área `integrations` da chave da API, e o card "Conectar meu sistema" do wizard, do cadastro de empresa e do estado vazio do estoque.

**O que ficou de propósito:** o valor `integration` em `ImportSource`. Ele faz parte do contrato acordado com o Pedro, e um produto vindo da integração precisa ter como se identificar quando ela existir. O que saiu foi a interface para conectar, não a possibilidade de o dado existir.

**Revisar se:** o piloto se provar e a equipe conseguir acesso a um fornecedor.

---

## 2026-09-16: Chave entre mock e API por área, não por projeto

**Decisão:** `NEXT_PUBLIC_API_LIVE` lista quais áreas já usam a API de verdade. O resto continua com dados de demonstração, no mesmo build.

**Por quê:** o Pedro entrega em ordem, B24 primeiro. Uma chave só, ligando tudo de uma vez, obrigaria a esperar o último endpoint para usar o primeiro. Com a chave por área, o login entra em produção enquanto o estoque ainda roda com mock.

**Descartado:** uma variável booleana só. E MSW, que resolveria o mesmo com mais peça móvel.

**Consequência:** toda função de serviço tem os dois caminhos e um `if (isLive(...))`. É repetição de propósito, e some quando a área estiver ligada de vez.

---

## 2026-09-16: Falha de enfeite não derruba a tela

**Decisão:** dado secundário passa por `optional()`, que devolve um valor de reserva quando a chamada falha. Dado principal deixa o erro subir para a fronteira `error.tsx`.

**Por quê:** descoberto em teste, apontando a aplicação para uma API morta. O cabeçalho busca notificações no layout, e `error.tsx` não pega erro de layout: **o sino fora do ar devolvia 500 em todas as telas**, inclusive na baixa de estoque, que não tem nada a ver com notificação.

**Consequência:** serviço chamado dentro de um layout precisa de `optional()`. E o valor de reserva não pode mentir: notificações que falharam viram `null` e o painel diz que não carregou, em vez de virar lista vazia e comunicar "nenhuma notificação".

**Revisar se:** aparecer um terceiro nível, tipo bloco que vale tentar de novo sozinho sem recarregar a tela.

---

## 2026-09-16: Janela de "a vencer" vive na conta, não em constante

**Decisão:** `Company.soonThresholdDays`, inteiro, padrão 30. O backend usa esse valor para calcular o `status` de cada lote, e o frontend passa o mesmo valor para a função local que dá feedback no formulário.

**Por quê:** a equipe já tinha fechado que a janela é configurável por conta, e a tela que edita o número já existia, mas não havia campo para guardar. A constante do frontend deixa de ser a verdade e vira apenas o padrão de quem ainda não configurou.

**Descartado:** deixar a janela só como constante no código, que impediria uma farmácia de giro rápido usar 15 dias.

**Consequência:** `getExpiryStatus` continua aceitando o valor por parâmetro. A fila de validades e o cadastro de produto passam a receber `soonThresholdDays` da sessão, então a prévia do chip mostra a mesma coisa que o servidor vai devolver depois de salvar.

**Acordado com o Pedro em 16/09/2026.**

---

## 2026-09-16: Produto que sumiu da origem vira inativo, não é apagado

**Decisão:** `Product.active`, booleano. Na reimportação, produto que não vem mais da origem é marcado `active: false`. `GET /products` devolve só os ativos por padrão.

**Por quê:** esse produto pode ter lote e validade que o cliente preencheu à mão, uma por uma, na fila de validades. Apagar destrói trabalho dele, e perder o trabalho do cliente é o caminho mais rápido para ele abandonar o sistema.

**Descartado:** apagar o produto na reimportação.

**Consequência:** o campo nasce junto com o resto do modelo, não é acrescentado depois. Ainda não existe tela para ver e reativar produto inativo, e isso fica para depois do MVP.

**Acordado com o Pedro em 16/09/2026.**

---

## 2026-09-16: A fila de validades usa a listagem, sem rota própria

**Decisão:** a fila consome `GET /products?status=unknown&sort=value_desc`. A rota `GET /products/pending-expiry`, que eu tinha proposto na v2 do contrato, foi descartada.

**Por quê:** `status=unknown` já devolve exatamente os produtos sem lote, e `value_desc` já ordena pelo custo total parado. A rota dedicada era a mesma consulta com outro nome, e duas rotas para o mesmo dado divergem com o tempo.

**Descartado:** manter as duas.

**Consequência:** a função `getPendingExpiryProducts` continua existindo na camada de serviço, porque a tela não precisa saber como o dado é buscado. Mudou só o corpo dela. Nenhuma tela foi tocada, que é exatamente a razão da camada existir.

**Acordado com o Pedro em 16/09/2026.**

---

## 2026-09-16: Tailwind v4, com tokens em @theme inline

**Decisão:** Tailwind v4, sem `tailwind.config.ts`. As CSS variables do Valide continuam sendo a fonte da verdade, e o bloco `@theme inline` dentro de `globals.css` as expõe como classes utilitárias.

**Por quê:** é o que o `create-next-app` instala hoje. Forçar o v3 significaria instalação manual fora do padrão, sem ganho nenhum, porque a estratégia de token não muda: a variable continua sendo a fonte e o Tailwind continua apontando para ela.

**Descartado:** Tailwind v3 com o `tailwind.config.ts` do rascunho original do design system.

**Consequência:** o token de borda passou a se chamar `line` em vez de `border`, para não colidir com a família de utilitários `border-*` do Tailwind. A classe é `border-line`.

---

## 2026-09-16: Entrada de dados por importação de catálogo

**Decisão:** o caminho principal para colocar produtos no Valide é importar o catálogo do sistema que a farmácia já usa. Cadastro manual vira caminho secundário.

**Por quê:** cadastrar centenas de produtos à mão é o motivo número um de abandono de sistema de estoque na primeira semana.

**Descartado:** cadastro manual como caminho único. Funciona no papel, não funciona no cliente real.

**Consequência:** três origens em um fluxo (arquivo, integração, manual), e um quarto estado de validade para produto importado sem lote.

**Detalhe:** `01-references/import-strategy.md`

---

## 2026-09-16: Importação por arquivo antes da integração por API

**Decisão:** construir a importação por CSV e XLSX primeiro. A integração por API do fornecedor entra depois, como segunda origem no mesmo fluxo.

**Por quê:** sistemas de farmácia no Brasil raramente expõem API pública, muitos são desktop com banco local, e fechar acesso com terceiro não cabe no prazo de 14/11. Todo sistema de farmácia exporta relatório em Excel.

**Descartado:** apostar na API como caminho principal do MVP. Risco de chegar em novembro sem dados.

**Consequência:** o wizard de importação é agnóstico de origem. Se a API não sair, nada precisa ser refeito.

---

## 2026-09-16: Quarto estado de validade, em neutro

**Decisão:** produto sem nenhum lote recebe o estado `unknown`, com cor neutra (Ardósia 300).

**Por quê:** confundir "não sei a validade" com "está no prazo" dá ao usuário uma segurança que ele não tem.

**Descartado:** uma quarta cor semântica. O neutro comunica melhor justamente porque significa ausência de dado, não um status.

**Consequência:** `getExpiryStatus` aceita `null` na assinatura, e `counts.ok` do dashboard nunca inclui produto sem lote.

---

## 2026-09-16: Valores monetários em centavos, inteiro

**Decisão:** todo valor em centavos, número inteiro, no contrato e no estado da aplicação. Formatação só na camada de apresentação.

**Por quê:** float produz erro de arredondamento que diverge entre frontend e backend.

**Descartado:** float, e string decimal.

---

## 2026-09-16: Dashboard em uma chamada agregada

**Decisão:** `GET /dashboard` devolve todos os blocos da Home de uma vez.

**Por quê:** a Home carrega rápido e não faz cinco requisições em paralelo.

**Descartado:** cinco endpoints separados, um por bloco.

**Risco aceito:** o endpoint fica mais pesado no backend. Se virar problema de performance, revisamos.

---

## 2026-09-16: Status de validade calculado no backend

**Decisão:** o backend calcula e devolve o status pronto em cada lote. O frontend tem `getExpiryStatus` local apenas para feedback imediato no formulário, antes de salvar.

**Por quê:** a regra de negócio precisa de uma fonte de verdade só. Duplicar a regra em dois lugares garante divergência com o tempo.

**Descartado:** cálculo só no frontend (regra de negócio no cliente), e cálculo só no backend (formulário sem feedback imediato).

---

## 2026-09-16: Camada de serviço com mock, em vez de MSW

**Decisão:** funções em `src/lib/services/` que hoje devolvem mock e amanhã fazem fetch.

**Por quê:** permite construir sem esperar o backend, e a troca depois é o corpo de uma função, sem tocar em nenhuma tela.

**Descartado:** MSW. Mais fiel à camada HTTP, mas com mais setup para o mesmo ganho neste projeto.

---

## 2026-09-16: Tokens de cor em CSS variables

**Decisão:** paleta em CSS variables, com Tailwind apontando para elas.

**Por quê:** tema claro e escuro sem duplicar classe, e troca de marca em um lugar só. A marca do Valide ainda não está definida, então isolar isso é essencial.

**Descartado:** cores direto no `tailwind.config`, que travaria o tema escuro.

---

## 2026-09-16: Sem biblioteca de estado global

**Decisão:** estado local, URL, e Context para sessão e tema. Nada de Redux, Zustand ou MobX nesta versão.

**Por quê:** o estado do Valide cabe nessas três camadas. Filtro e busca na URL tornam a tela compartilhável e sobrevivem ao recarregar.

**Descartado:** biblioteca de estado global. Complexidade sem retorno neste tamanho de projeto.

**Revisar se:** o estado passar a exigir sincronização complexa entre telas distantes.

---

## 2026-09-16: Stack Next.js, TypeScript, Tailwind, shadcn/ui

**Decisão:** App Router, TypeScript estrito, Tailwind com tokens, shadcn/ui customizado.

**Por quê:** deploy direto na Vercel, que o Marcus já usa, e caminho do protótipo navegável até o MVP sem refazer o projeto.

**Descartado:** Vite com React puro (SPA, sem Server Components) e componentes próprios do zero (tempo que o cronograma não tem).

---

## 2026-09-17: Teste com o runner nativo do Node, sem biblioteca

**Decisão:** os testes do Valide rodam com `node --test`, o runner embutido do Node, e `node:assert/strict`. Nenhuma dependência nova. O comando é `npm test`, e o padrão de nome é `<arquivo>.test.ts`, ao lado do arquivo testado.

**Por quê:** o Node 22 e superior executa TypeScript direto, sem compilar e sem loader. Para função pura, que é o que vale a pena testar num frontend cuja verdade está no backend, isso entrega cobertura real com zero custo de manutenção de ferramenta.

**Descartado:** Vitest. É melhor ferramenta, resolve o alias `@/`, tem watch mode e serve para testar componente React com Testing Library. Não entra agora porque nada do que precisa de teste hoje exige isso, e ferramenta parada na stack também custa. Volta à mesa no dia em que houver componente com lógica que mereça teste.

**Consequência:**

1. Rodar `npm test` exige **Node 22 ou superior** na máquina. Quem estiver em Node antigo não roda a suíte.
2. O teste importa o alvo por caminho relativo com extensão (`./expiry.ts`), porque o Node não conhece o alias `@/`. Isso obrigou `allowImportingTsExtensions: true` no `tsconfig.json`, aceito apenas porque `noEmit` já é `true`. O build do Next não muda.
3. Teste novo não precisa de instalação, configuração nem aprovação de dependência. Só de um arquivo.

**Revisar se:** aparecer necessidade de testar componente React, mock de módulo, ou rodar a suíte num ambiente preso a Node antigo.

---

## 2026-10-08: O dia do vencimento já é Vencido

**Decisão:** `getExpiryStatus` classifica um lote que vence hoje como **Vencido**. A vencer passa a ser de 1 a 30 dias. Substitui a decisão de 17/09, logo abaixo.

**Por quê:** a migration do banco de 07/10 (`Banco/supabase/migrations/001_create_schema.sql`, view `vw_alerta_validade`) trata `dias_para_vencer <= 0` como VENCIDO. Com a regra antiga, o mesmo lote aparecia como A vencer na tela e como vencido no banco, no mesmo dia. A decisão de 17/09 já previa revisão "se o Pedro implementar diferente no backend". Para remédio, errar para o lado de tirar da prateleira é o lado seguro. Decidido pelo Marcus em 08/10.

**Consequência:** `formatExpiryDistance(0)` diz "venceu hoje". Testes atualizados em `src/lib/utils/expiry.test.ts`. As faixas de 31 a 60 dias e o vermelho para lote não vencido, que o banco também tem, continuam em aberto no contrato (ponto 8).

---

## 2026-09-17: O dia do vencimento conta como último dia válido

> **Substituída em 08/10/2026**, ver acima.

**Decisão:** `getExpiryStatus` classifica um lote que vence hoje como **A vencer**, não como Vencido. Só a partir do dia seguinte ele vira Vencido. Comportamento travado em teste, em `src/lib/utils/expiry.test.ts`.

**Por quê:** é o que a farmácia entende na prática, e é o lado seguro do erro. Mostrar Vencido cedo demais faz o balconista tirar da prateleira um produto ainda vendável.

**Descartado:** tratar o dia do vencimento como Vencido, que seria mais conservador para o paciente mas descarta valor sem necessidade.

**Consequência:** o frontend e o backend precisam concordar nesse ponto, senão o mesmo produto aparece com status diferente na tela de cadastro e na listagem. Pergunta registrada na pauta, item 2.5.

**Revisar se:** o Pedro implementar diferente no backend, ou a farmácia parceira disser que trata o dia do vencimento como perdido.

---

## Template para nova decisão

```
## AAAA-MM-DD: <título da decisão>

**Decisão:** o que foi decidido.

**Por quê:** o motivo, em uma ou duas frases.

**Descartado:** a alternativa que não foi escolhida, e por quê.

**Consequência:** o que isso obriga ou permite daqui em diante.

**Revisar se:** a condição que faria reabrir esta decisão.
```
