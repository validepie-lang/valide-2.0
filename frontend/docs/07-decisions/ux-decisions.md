# ux-decisions.md: Decisões de Experiência e Copy

Decisões sobre como o produto se comporta e como fala com o usuário. Mais recente no topo.

---

## 2026-10-08: Redesign de hierarquia: um nível 1 por tela, dado em padrão único

**Status:** aprovada pelo Marcus em 08/10/2026, junto com a SPEC `03-specs/redesign-hierarquia.md`. Inclui a mudança da regra 1 do `CLAUDE.md` (cor de erro).

**Contexto:** feedback de design recebido em 08/10: informação demais, nenhuma hierarquia, cara de front gerado por IA, dado sem padrão. A auditoria (`06-validations/auditoria-hierarquia.md`) confirmou: nove blocos de peso igual na Home, a mesma contagem três vezes na primeira dobra, sete anatomias de indicador, cor de validade usada fora de validade em seis lugares.

**Decisões:**

1. **Uma pergunta, um elemento de nível 1 e uma ação primária por tela.** A Home cai de nove blocos para quatro: valor em risco, faixa de status, lotes que vencem nos próximos 30 dias, gráfico por semana.
2. **Mona Sans só em título e no número herói; Inter no resto, com algarismos tabulares.** Medido em 08/10: os tabulares da Mona Sans têm zero com ponto e "1" com base, desenho de fonte de código, sem recurso para desligar.
3. **Vermelho significa "problema que exige ação": lote Vencido ou erro que impede continuar.** O erro usa `--error`, que aponta para os mesmos valores de `--status-expired`. Aviso e sucesso ficam neutros.
4. **A lista da Home mostra só A vencer.** Os vencidos têm contagem e caminho próprios na faixa de status; o A vencer é onde a decisão é item a item.
5. **Indicador mostra reais inteiros (R$ 8.573); tabela e detalhe mostram centavos.** Sem "mil".
6. **Data de validade em dd/mm/aaaa em toda a interface**, porque é o formato impresso na embalagem que o balconista tem na mão. Mês abreviado só em eixo de gráfico e registro de evento.
7. **Custo parado sai das colunas padrão do estoque** e vai para o seletor de colunas.
8. **Da referência MT fica a estrutura e sai a decoração.** Ficam: um matiz, trilho escuro, número herói. Saem: vidro, recorte de canto, degradê, ícone em quadrado, caixa alta de 11px, raio de 22px, sombra em todo card, centavos esmaecidos.

**Por quê:** cada item tem a justificativa na seção 3 da SPEC. Em comum: a referência MT é um estudo de portfólio, feito para ser visto uma vez; o Valide é usado oito horas por dia num computador de caixa. Quando tudo tem destaque, nada tem.

**Descartado:**

- Algarismos proporcionais em tudo: colunas de número não alinham.
- Erro de formulário neutro: o balconista apressado não perceberia que o produto não foi salvo.
- Um segundo vermelho para erro: já descartado em 16/09, pelo mesmo motivo.
- "R$ 8,6 mil" no herói: troca valor exato por estimativa no número que sustenta a venda.
- "12 out 2026" em lista (exemplo do feedback): obriga a converter na hora de comparar com a caixa.

**Substitui, em parte:** a decisão de 07/10/2026 sobre a linguagem visual MT, abaixo.

**Mantém:** botão destrutivo em neutro (16/09).

---

## 2026-09-16: Ação destrutiva em neutro, sem vermelho

**Decisão:** botão de excluir, remover e descartar usa Ardósia, não vermelho. A segurança vem do texto que nomeia a ação ("Excluir pasta", "Voltar sem excluir") e da confirmação obrigatória.

**Por quê:** a regra de cor do Valide diz que vermelho comunica validade vencida, e só isso. Um botão vermelho "Excluir" no detalhe do produto convive na mesma tela com o chip Vencido, e o usuário que aprendeu que vermelho significa "produto perdido" passa a ver dois significados para a mesma cor.

**Descartado:** um token `--danger` com um vermelho diferente do `--status-expired`. Dois vermelhos na mesma tela enfraquecem a regra em vez de reforçá-la.

**Consequência:** ação destrutiva se distingue por texto e por confirmação, nunca por cor. O design system não tem token de perigo.

---

## 2026-09-16: Vocabulário fixo de status, sem sinônimo

**Decisão:** em toda a aplicação, os quatro estados usam sempre os mesmos termos: **Vencido**, **A vencer**, **No prazo**, **Sem validade**.

**Por quê:** consistência de vocabulário é o que faz o usuário confiar no painel. Se a mesma coisa se chama "a vencer" em uma tela e "próximo do vencimento" em outra, ele para de ter certeza de que está olhando a mesma informação.

**Proibido:** expirado, próximo do vencimento, em dia, regular, ok.

---

## 2026-09-16: Card herói mostra "valor em risco", não "total em estoque"

**Decisão:** o card principal do dashboard mostra a soma em reais do custo dos produtos vencidos mais os a vencer.

**Por quê:** é o número que prova o valor do produto em uma demonstração. O dono da farmácia vê, em reais, quanto está prestes a perder. Total em estoque é informação, valor em risco é motivo para agir.

**Descartado:** saldo total do estoque, que era o padrão da referência visual usada.

---

## 2026-09-16: Fila de validades pendentes como parte do produto

**Decisão:** depois da importação, o cliente é conduzido a uma tela dedicada de preenchimento rápido, um produto por vez, ordenada por maior valor parado primeiro.

**Por quê:** a importação entrega 800 produtos e 800 campos em branco. Esse é o momento em que o cliente desiste, se a interface não conduzir. Sem essa tela, a importação entrega um banco de dados bonito e inútil.

**Consequência:** a tela precisa de navegação por teclado completa, porque quem preenche 400 itens não usa mouse.

---

## 2026-09-16: Produto sem validade mostra botão "Informar", não traço

**Decisão:** na coluna de validade da listagem, produto sem lote mostra um botão discreto "Informar" em vez de um traço ou célula vazia.

**Por quê:** traço comunica ausência, mas não comunica que o usuário pode agir ali. O botão transforma uma lacuna em uma tarefa possível.

---

## 2026-09-16: FEFO sugere, não obriga

**Decisão:** ao dar baixa, o lote que vence primeiro vem pré-selecionado e sinalizado, mas o usuário pode trocar.

**Por quê:** o balconista às vezes precisa dar baixa em outro lote por motivo real (produto avariado de um lote específico, por exemplo). Interface que força a regra quebra o trabalho de quem está no balcão, e o resultado é ele voltar ao papel.

---

## 2026-09-16: Estado vazio nunca é mudo

**Decisão:** todo estado vazio tem ícone, uma frase que explica, e o botão da ação que resolve.

**Por quê:** o público não vai procurar o que fazer. Se a tela está vazia e não diz o próximo passo, ele fecha.

**Exceção de tom:** "Nenhum produto vencido. Seu estoque está em dia." é boa notícia, e o texto reconhece isso sem exagero. Estado vazio nem sempre é problema.

---

## 2026-09-16: Botão diz o que acontece

**Decisão:** nada de "OK", "Confirmar" ou "Enviar" sozinhos. O botão nomeia a ação: "Salvar produto", "Registrar saída", "Importar 800 produtos".

**Por quê:** o usuário confirma sem ler o texto acima. O botão precisa ser autossuficiente.

**Em ação destrutiva:** o botão de cancelar também nomeia: "Voltar sem excluir", não "Cancelar".

---

## 2026-09-16: Status sempre com cor, ícone e rótulo

**Decisão:** nenhum status é comunicado só por cor.

**Por quê:** acessibilidade para usuário daltônico, e legibilidade em tela de baixa qualidade, que é o que existe no balcão.

---

## 2026-09-16: Sem travessão em nenhum texto

**Decisão:** nenhum travessão (em-dash) em interface ou documentação. Usar vírgula, dois pontos, parênteses ou ponto.

**Por quê:** preferência de escrita do Marcus, e o texto fica mais próximo de como as pessoas escrevem no Brasil.

---

## 2026-09-16: Mensagem de erro diz o que fazer

**Decisão:** toda mensagem de erro tem o que aconteceu e o próximo passo. Nada de "Ops!", nada de código de erro exposto, nada de culpar o usuário.

**Exemplos aprovados:**

- "Não foi possível salvar o produto. Verifique a conexão e tente de novo."
- "Este SKU já está cadastrado. Use outro código ou edite o produto existente."
- "A data de validade não pode ser anterior à data de fabricação."
- "E-mail ou senha incorretos."

---

## 2026-09-16: Identidade não presa ao universo farmacêutico

**Decisão:** nada de cruz verde, símbolo de farmácia, ou texto estrutural dizendo "sua farmácia".

**Por quê:** o produto nasce para farmácia mas se expande para bebidas e delicatessen. Amarrar a identidade agora obriga a refazer depois.

---

## 2026-10-07: Linguagem visual a partir da referência MT

**Decisão:** o Valide adota a linguagem visual do estudo de caso MT (dashboard de cripto): um matiz azul-ardósia, trilho lateral escuro, número herói com centavos esmaecidos, pilha de abas em vidro azul, recorte de canto e Mona Sans. A pill de navegação no topo e o herói Ardósia de 16/09 saem.

**Por quê:** o Marcus não estava gostando do visual anterior, com onze blocos do mesmo peso e cara de modelo pronto. A referência resolve hierarquia com um número dominante e blocos de formato repetido. E a interface monocromática faz as cores de validade serem as únicas cores da tela.

**Descartado da referência:** verde menta como acento, selos de variação verde e vermelho, minigráficos de cotação sem dado por trás, texto abaixo de 11px sobre vidro. Detalhe em `01-references/visual-ref/README.md`.

**Consequência:** a tipografia deixa de ser pendência. As telas além da Home herdam os tokens, mas o acabamento fino delas é a próxima issue.

---

## 2026-10-11: Identidade Petróleo e uma família tipográfica

**Decisão:** a paleta Ardósia vira Petróleo (tinta `#0e3b3a`, fundo de papel menta `#eff4f2`, menta `#a6ebd9` só sobre superfície escura). Inter e Mona Sans dão lugar a uma família só, Instrument Sans. Os cartões de estado perdem a faixa colorida no topo e, na Home, ficam 2 por 2 ao lado do cartão cheio.

**Por quê:** o Marcus pediu para tirar o visual genérico. A pesquisa no Behance (issue 061) mostrou que a neutralidade escolhida em 16/09 era a causa: azul-ardósia com cinza frio e Inter é a cara padrão de painel SaaS. Os projetos de saúde e farmácia mais bem avaliados usam verde-petróleo, água e menta com uma tinta escura; as duas referências mais próximas do Valide (Pharmacy CRM Software e BetterData) usam uma família tipográfica só.

**Revê duas decisões:** a de 16/09 (paleta neutra, não presa ao segmento) e o descarte do menta de 07/10. A regra de fundo das duas continua: o petróleo não é símbolo de farmácia (nada de cruz) e serve a bebidas e delicatessen; e o menta não aparece perto de chip de status, só no trilho, no cartão cheio e no painel do login. Cores de status não mudam.

**Descartado:** General Sans (a fonte da referência): não tem algarismos tabulares e a licença proíbe converter o arquivo e passá-lo a terceiros. Geist: é a fonte padrão das telas geradas pelo v0, justamente a cara a evitar. Schibsted e Onest: o tabular alarga vírgula e espaço.

**Consequência:** zero hex solto continua; os novos tokens são `--mint`, `--mint-hover` e `--mint-fg`. Toda tela nova usa a paleta Petróleo.

---

## 2026-10-11: Logo do Valide

**Decisão:** o logo é um V que também é o visto de "validar", ao lado de três barras arredondadas que diminuem de cima para baixo, mais o nome "Valide" em curvas. O Marcus criou no Claude a partir de um briefing com as regras da marca e mandou os SVG (marca, logo escuro, favicon). Petróleo `#0e3b3a` sobre fundo claro, menta `#a6ebd9` sobre fundo escuro, nenhuma outra cor. Um primeiro conceito, "Fila" (três barras com a do meio deslocada), entrou e foi trocado no mesmo dia por este.

**Por quê:** o V diz o nome e a ação (validar); as barras diminuindo são o estoque baixando. Não é símbolo de farmácia (decisão de 16/09) e não usa cor de status. Em relação ao "Fila", não lembra o ícone de menu.

**Consequência:** o desenho mora em `src/components/layout/logo.tsx` (marca no trilho; marca e nome no resto); o favicon `src/app/icon.svg` é só o V, e `apple-icon.png` é o V em menta sobre petróleo. A versão clara do logo completo não veio nos arquivos: é a mesma arte com marca em petróleo e nome em `--fg`. Sai da lista de pendências do CLAUDE.md.

---

## 2026-10-11: Cobalto sobre papel no lugar do petróleo

**Decisão:** a paleta passa a ser Cobalto sobre papel (tinta `#1a3a8f`, fundo `#f5f4f0`, assinatura lavanda `#b7c8ff` só sobre o escuro). O token `--mint` virou `--signature`. Logo, favicon e ícone do celular acompanham: cobalto no claro, lavanda no escuro.

**Por quê:** publicado o petróleo (061), o Marcus não gostou do verde e disse que o azul de antes era melhor. Pediu propostas que não parecessem genéricas. Foram quatro azuis aplicados nas telas reais, com contraste conferido; ele escolheu o Cobalto, a mais diferente do painel comum. Base: Farmacia Panata (Behance, 1.403), cobalto com cor clara.

**Revê:** a paleta da decisão de 11/10 (Identidade Petróleo). Continuam valendo dela a fonte única, os cartões de estado e a regra da cor de assinatura só sobre o escuro.

---

## Template para nova decisão

```
## AAAA-MM-DD: <título da decisão>

**Decisão:** o que foi decidido.

**Por quê:** o motivo, do ponto de vista do usuário.

**Descartado:** a alternativa, se houver.

**Consequência:** o que isso obriga daqui em diante.
```
