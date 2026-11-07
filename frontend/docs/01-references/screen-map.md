# screen-map.md: Rotas e Conteúdo

Mapa das abas do Valide, derivado do documento de funcionalidades e do escopo do MVP.
Serve como referência única do que existe e do que ficou fora desta versão.

---

## Árvore de rotas

```
/login                          entrar
/cadastro-empresa               setup inicial da conta (multi-tenant)

/                               Home / Dashboard
/estoque                        listagem de produtos
/estoque/importar               wizard de importação de catálogo
/estoque/validades-pendentes    fila de preenchimento de lote e validade
/estoque/novo                   cadastro de produto
/estoque/[id]                   detalhe do produto, lotes e histórico
/estoque/[id]/baixa             registrar saída
/estoque/pastas                 gerenciar pastas de classificação
/estoque/movimentacoes          entradas e saídas de todos os produtos (issue 041)
/estoque/calendario             quando cada lote vence, mês a mês (issue 052)
/estoque/entrada                registrar a entrada de um lote buscando ou bipando o produto (issue 042)
/configuracoes                  perfil do usuário
/ajuda                          perguntas frequentes por assunto (issue 043)
/configuracoes/notificacoes     o que cada pessoa recebe no sino (issue 044)
/configuracoes/empresa          perfil e preferências da empresa
/configuracoes/usuarios         usuários e permissões
```

**Nota sobre entrada de dados:** a equipe decidiu em 16/09 que o caminho principal para colocar produtos no Valide é importar o catálogo do sistema que a farmácia já usa, não cadastrar um a um. A estratégia completa está em `01-references/import-strategy.md`.

**Atualização de 17/09:** a integração com o sistema da farmácia saiu do escopo do piloto. Restam duas origens, enviar planilha e cadastrar manualmente, e a tela `/configuracoes/integracoes` deixou de existir. Quando a integração voltar, ela entra como uma terceira origem no wizard que já existe.

---

## 1. Login (`/login`)

**Pergunta que responde:** como entro na minha conta.

- Campos: usuário e senha (contrato v6: o banco não guarda e-mail)
- Recuperação de senha: não há tela nem e-mail para onde mandar. Abaixo do botão, a instrução que vale neste modelo: "Esqueceu a senha? Peça a quem administra a conta da farmácia." Até 09/10 havia um "Esqueci a senha" apagado que não fazia nada
- Link para cadastro de empresa
- Erro de credencial inválida em português, sem expor se o usuário existe

Visual (revisto em 09/10/2026, issue 015): coluna única centralizada, sobre o fundo da página, com o card de formulário com borda e sem sombra. Saíram o degradê escuro e os círculos decorativos. Placeholder de logo no topo.

---

## 2. Cadastro de empresa (`/cadastro-empresa`)

**Pergunta que responde:** como coloco minha empresa no sistema.

Formulário em três etapas, com barra de progresso:

**Etapa 1. Dados cadastrais e fiscais**
CNPJ, razão social, nome fantasia, inscrição estadual, inscrição municipal.

**Etapa 2. Localização e contato**
CEP com busca automática, logradouro, número, complemento, bairro, cidade, estado, telefone, e-mail corporativo, site.

**Etapa 3. Estrutura**
Regime tributário. Matriz ou filial. Dados do usuário administrador: nome, usuário e senha. Até 09/10 a tela pedia e-mail, que o banco não tem (contrato v6). O administrador cadastra o resto da equipe depois, em Configurações, Usuários; não há convite.

**Etapa 4. Como trazer seus produtos**
Duas opções, com a primeira em destaque:

- **Enviar uma planilha** do sistema que você já usa (CSV ou Excel). Leva para `/estoque/importar`
- **Cadastrar manualmente**, um produto de cada vez. Leva para `/estoque/novo`

Esta etapa pode ser pulada, mas o usuário que pula cai no estado vazio do estoque, que oferece as mesmas opções. Ninguém fica sem saída.

Múltiplas filiais estão marcadas como **posterior** no escopo. Nesta versão, a interface pergunta se é matriz ou filial e guarda o dado, sem tela de gestão de filiais.

---

## 3. Home / Dashboard (`/`)

**Pergunta que responde:** o que eu preciso resolver hoje.

A tela mais importante do produto. Reestruturada em 08/10/2026 (`03-specs/redesign-hierarquia.md`, seção 5.1): de nove blocos para quatro, em três níveis de leitura.

### Blocos, nesta ordem

**1. Valor em risco (nível 1)**
Soma em reais do custo dos produtos vencidos mais os a vencer, em reais inteiros. Uma linha de contexto e a ação primária da tela, "Ver produtos em risco", que leva para `/estoque?status=expired,soon`.

**2. Resumo de status (nível 2)**
Uma faixa com as quatro contagens, na ordem Vencido, A vencer, No prazo, Sem validade. Vencido e A vencer com mais peso. Cada contagem leva para o estoque filtrado.

O contador de "No prazo" conta apenas produtos com validade conhecida. Produto sem lote fica em "Sem validade", que mostra o valor parado e a ação "Informar validades", levando para a fila. Isso substitui o antigo card de validades pendentes, e continua sendo o principal motor de adoção logo depois de uma importação.

**3. Vencem nos próximos 30 dias (nível 2)**
Os cinco lotes A vencer que vencem primeiro: produto, lote, validade, chip e distância. Link "Ver todos". Os vencidos ficam na contagem da faixa, não na lista.

**4. Vencimentos por semana (nível 3)**
Barras das próximas semanas, base neutra, destaque na semana de pico, título que diz a conclusão.

### O que saiu da Home em 08/10/2026, e onde ficou

| Saiu | Onde está agora |
| --- | --- |
| Pilha "Filas de hoje" | Segmentos da faixa de status |
| Divisão por pasta (rosca) | Contagem por pasta no filtro do estoque e em `/estoque/pastas` |
| Central de notificações | Menu do sino, no cabeçalho de todas as telas |
| Ações rápidas | Adicionar e importar no cabeçalho do estoque; registrar saída em cada produto |
| Movimentações recentes | Histórico no detalhe do produto |

---

## 4. Estoque (`/estoque`)

**Pergunta que responde:** o que eu tenho, e o que está perto de vencer.

- Busca por nome, SKU ou código de barras
- Filtro principal visível: os quatro status, como chips com contagem
- "Mais filtros", recolhido: pasta, fornecedor, marca, origem (planilha ou manual)
- Colunas padrão: produto, validade, situação, quantidade
- Seletor de colunas: código interno, pasta, lote, estoque mínimo, custo parado. Desligadas por padrão
- Ordenação por validade, por padrão crescente, o que vence primeiro no topo
- Ação por linha: ver detalhe, registrar baixa, informar validade (quando não tiver lote)
- Ação primária: importar produtos. Secundária: adicionar produto

Produto sem lote aparece com o chip neutro "Sem validade" e, na coluna de validade, um botão discreto "Informar" em vez de um traço. Traço deixa o usuário sem saber que ele pode agir ali.

No mobile a tabela vira lista de cards: produto e chip de status na primeira linha, validade e quantidade na segunda.

**Estado vazio (nenhum produto):** título "Comece trazendo seus produtos", com:

1. **Enviar planilha** (ação primária, em card destacado): "Exporte a lista de produtos do sistema que você já usa e envie aqui"
2. **Cadastrar manualmente**: ação secundária, em link

**Estado vazio (busca sem resultado):** "Nenhum resultado para essa busca. Tente outro termo ou limpe os filtros."

---

## 5. Importar produtos (`/estoque/importar`)

**Pergunta que responde:** como trago tudo que já tenho, sem digitar.

Wizard de quatro passos. O usuário pode voltar em qualquer passo concluído sem perder o que fez.

Revista em 09/10/2026 (`03-specs/redesign-hierarquia.md`, seção 5.5): etapas com número e texto, a atual sublinhada e só as concluídas clicáveis; uma ação primária por passo (Escolher arquivo, Continuar para a revisão, Importar N produtos, Começar a informar validades); vermelho só na linha que não entra; sem verde, amarelo ou degradê.

### Passo 1. Origem

Dois caminhos: enviar planilha, em destaque, e cadastrar manualmente, como link abaixo ("Prefere cadastrar um produto de cada vez?"). O passo foi desenhado para aceitar mais origens sem mudar os passos seguintes, então a integração volta aqui como uma terceira opção quando existir.

Na opção de planilha: área de arrastar e soltar, aceita CSV e XLSX, com texto de apoio dizendo onde encontrar essa exportação no sistema da farmácia. Um exemplo concreto vale mais que uma instrução genérica.

### Passo 2. Mapear colunas

O sistema mostra as colunas encontradas no arquivo à esquerda e os campos do Valide à direita, com o palpite automático já preenchido. O usuário corrige o que estiver errado.

- Campos obrigatórios marcados: nome e ao menos um identificador (SKU ou código de barras)
- Campos opcionais podem ficar sem mapeamento
- Prévia de três linhas de exemplo ao lado de cada mapeamento, para o usuário conferir que pegou a coluna certa
- Se o arquivo trouxer lote e validade, o mapeamento oferece esses campos também. Isso seria o melhor cenário

### Passo 3. Revisar

Tabela com o que vai entrar. Cada linha mostra a ação: **criar**, **atualizar** ou **ignorar**, e os problemas encontrados.

- Resumo no topo: "738 produtos serão criados, 62 atualizados, 14 com problema"
- Linhas com erro destacadas (ícone e texto em `--error`, sem fundo na linha)
- **Ainda não construído:** filtrar só as linhas com erro e desmarcar linhas individualmente. Desmarcar depende do contrato (a confirmação teria de receber as linhas excluídas). Até 09/10 a tela dizia "Desmarque qualquer linha", sem ter onde desmarcar; a frase saiu
- No celular e no tablet a tabela vira lista, com a ação visível em cada linha
- Problemas comuns a tratar: preço em formato estranho, data inválida, produto duplicado no próprio arquivo, campo obrigatório vazio

O botão de confirmar diz o que vai acontecer: "Importar 800 produtos".

### Passo 4. Resultado

- Progresso durante a execução, com possibilidade de sair da tela e voltar depois (ainda não construído: o mock vai direto ao resultado). Terminada a importação, não há barra: uma barra parada em 98% parece travada
- Ao terminar: quantos entraram, quantos falharam, com download do relatório de erros
- **A ação seguinte em destaque:** "Agora informe as validades" levando para a fila. Este é o passo que faz o produto funcionar. Terminar a importação sem apontar para ele é deixar o cliente parado

**Estados especiais**

- Arquivo grande demais: avisar antes de subir, com o limite em número de linhas
- Arquivo sem cabeçalho reconhecível: oferecer mapeamento manual completo em vez de falhar
- Importação que falhou no meio: dizer quantas linhas entraram antes da falha

---

## 6. Validades pendentes (`/estoque/validades-pendentes`)

**Pergunta que responde:** tenho 412 produtos sem validade, por onde começo.

Esta tela é o que transforma uma importação em um produto que funciona. É tela de trabalho repetitivo, então cada clique economizado importa.

- **Um produto por vez**, em foco, com nome, código e valor em estoque visíveis
- Apenas três campos: número do lote, data de validade, quantidade
- Ao preencher a validade, o chip de status aparece na hora, mostrando o resultado
- Botão "Salvar e próximo" como ação primária, e "Pular este" como secundária
- **Navegação por teclado obrigatória.** Tab entre campos, Enter salva e avança. Quem preenche 400 itens não usa mouse
- Progresso no topo, discreto: "38 de 412 preenchidos", com o valor ainda parado
- Ordem padrão: maior valor parado primeiro, para o esforço render mais cedo
- Opção de trocar para modo tabela, para quem prefere preencher em lote

**Estado vazio (fila zerada):** "Todos os produtos têm validade informada." com o resumo do que foi feito e um botão para voltar ao painel. Este é um estado de vitória, o texto deve reconhecer isso sem exagero.

---

## 7. Cadastro de produto (`/estoque/novo`)

**Pergunta que responde:** como coloco um produto no sistema.

Continua existindo para item avulso, produto novo que chegou, ou cliente que preferiu não importar.

Formulário em seções, tudo em uma página com âncoras laterais:

**Dados técnicos**
Nome, SKU, código de barras (EAN), pasta de classificação, marca, fornecedor.

**Parâmetros de estoque**
Unidade de medida (un, kg, cx), estoque mínimo, estoque máximo.

**Valores**
Custo de aquisição, custos operacionais, preço de venda.

**Lote e validade**
Número do lote, data de fabricação, data de validade, quantidade. Permite adicionar mais de um lote no mesmo cadastro.

A seção de lote é o coração do produto. Ao preencher a validade, a interface já mostra o chip de status calculado, para o usuário ver na hora se acabou de cadastrar algo que já está vencido.

---

## 8. Detalhe do produto (`/estoque/[id]`)

**Pergunta que responde:** este produto tem algo para resolver, e em qual lote.

- Cabeçalho com nome, código interno, marca e pasta
- Situação do lote que vence primeiro, em uma frase com o chip (nível 1)
- Três indicadores: em estoque, custo parado, número de lotes
- Lista de lotes, cada um com número, fabricação, validade, quantidade e chip de status
- Histórico de movimentação: usuário, ação, quantidade, motivo, data e hora
- Ficha do produto: estoque mínimo e máximo, valores, identificação
- Ações: registrar saída (primária), editar

---

## 9. Baixa de produto (`/estoque/[id]/baixa`)

**Pergunta que responde:** como tiro isso do estoque e registro o porquê.

- Seleção de lote, com **sugestão FEFO**: o lote que vence primeiro vem pré-selecionado e sinalizado
- Quantidade
- Motivo obrigatório: venda, avaria, roubo, vencimento, consumo interno
- Observação opcional
- Confirmação mostrando o resultado no estoque antes de gravar

O registro salva automaticamente qual usuário fez, com data e hora.

---

## 9b. Movimentações (`/estoque/movimentacoes`)

**Pergunta que responde:** o que entrou e saiu do estoque, quem fez e quando.

Criada em 10/10/2026 (issue 041), a partir do "Stock Adjustment List" do Inventar e da tabela agrupada do Ctrl Panel (Behance). É a segunda aba do Estoque ("Produtos", "Movimentações").

- Filtros à esquerda da tela grande em diante: tipo e período em botões; motivo da saída e pessoa em listas, com "Aplicar filtros". Abaixo da tela grande, em cima da lista
- Lista agrupada por dia ("Hoje", "Ontem", "quarta, 07/10"): hora, produto com lote e observação, movimento, quantidade com sinal e quem fez. Tabela na tela grande, lista no tablet e no celular
- Direção por ícone e sinal, nunca por cor. 25 por página

---

## 9d. Calendário de vencimentos (`/estoque/calendario`)

**Pergunta que responde:** o que vence em cada dia deste mês.

Criada em 10/10/2026 (issue 052), a partir do calendário do Kalee (Behance). Terceira aba do Estoque. O mês em grade (domingo a sábado) com quantos lotes vencem em cada dia e a barra do pior estado (No prazo em cinza); ao lado, os lotes do dia escolhido. Abre no próximo dia com lote vencendo. Mês e dia no endereço. Contrato v17 proposto.

---

## 9c. Registrar entrada (`/estoque/entrada`)

**Pergunta que responde:** chegou uma caixa, como registro sem procurar o produto antes.

Criada em 10/10/2026 (issue 042), a partir da busca com "Scan" do Inventar e das telas "Search" e "Scan QR" do Mobile App For Inventory (Behance). Abre por "Registrar entrada" no cabeçalho de Movimentações.

- Passo 1, "Qual produto chegou?": um campo com o foco já nele. O leitor do caixa funciona como teclado; código de barras ou código interno exato abre o produto direto. O resto vira uma lista curta. Sem resultado, "Cadastrar produto"
- Passo 2: o produto no topo com "Trocar produto", e o formulário da entrada pelo produto, com o foco no número do lote

---

## 10. Pastas de classificação (`/estoque/pastas`)

Revista em 10/10/2026 (issue 039), a partir da tela "Category" do Ventor (Behance). Só para quem administra; a porta de entrada é "Gerenciar pastas", embaixo do filtro de pasta em "Mais filtros" do Estoque.

- Tabela com a pasta, quantos produtos tem e quantos estão vencidos ou a vencer (o `byFolder` do `GET /dashboard`, com link para o estoque filtrado). No celular, lista
- "Criar pasta" no cabeçalho; criar e renomear em janela, com aviso de nome repetido
- Excluir pede confirmação; pasta com produto não se exclui, e a janela leva aos produtos dela
- **Ainda não construído:** mover produtos entre pastas em lote. Hoje a pasta muda no editar produto, um de cada vez

---

## 10b. Ajuda (`/ajuda`)

**Pergunta que responde:** como faço tal coisa, e o que quer dizer o que estou vendo.

Criada em 10/10/2026 (issue 043), a partir da Knowledge Base Landing Page e da FAQ Section (Behance); "Ajuda" no menu como no Pharmly e no Vault. Porta de entrada no trilho lateral, embaixo, e no menu da conta (o caminho no celular).

- Busca no topo, que filtra enquanto se digita, sem acento e sem maiúscula
- Quatro assuntos em cartões: Começar, Validades, Entrada e saída, Pessoas e acesso
- Perguntas que abrem e fecham, com a resposta curta e o link para a tela onde se faz. O conteúdo mora em `src/components/help/help-content.tsx`: mudou a regra, muda a resposta

---

## 11. Configurações

Revista em 09/10/2026 (`03-specs/redesign-hierarquia.md`, seção 5.6): as três abas em uma coluna, alinhada à esquerda, até 720px, com seções separadas por título e fio, sem card. Dado que não se muda ali vai como texto só de leitura, não como campo travado.

### Perfil do usuário (`/configuracoes`)
Nome, usuário de acesso (só leitura), empresa e cargo (só leitura), redefinição de senha, preferência de tema (claro, escuro, automático). O envio de foto saiu em 08/10/2026 até existir de verdade; o avatar usa as iniciais.

### Notificações (`/configuracoes/notificacoes`)
Criada em 10/10/2026 (issue 044), da tela Settings do Pharmly (Behance). Um interruptor por tipo de aviso (lotes da semana, estoque mínimo, o que a equipe registrou, importação), escolha de cada pessoa. Chega-se pelo menu das configurações, pelo rodapé do sino e pelo cabeçalho de Avisos. A preferência ainda não existe no contrato: proposta v16.

### Usuários e permissões (`/configuracoes/usuarios`)
Lista de usuários da conta com cargo e usuário de acesso. Quem saiu aparece com acesso bloqueado. Desde 10/10 (issue 040), "Adicionar pessoa" e "Editar" abrem uma janela: nome, usuário de acesso (só na criação), senha inicial ou nova senha, e cargo com o resumo do que ele pode. Bloquear e liberar o acesso ficam na edição, com confirmação. Ninguém muda o próprio cargo nem se bloqueia. Cargos:

| Cargo | Pode |
| --- | --- |
| Administrador | Tudo: configurações, usuários, cadastro, baixa, descarte, relatórios |
| Farmacêutico | O mesmo que o Balconista, mais o descarte por vencimento ou avaria |
| Balconista | Cadastrar produto, informar validade e registrar baixa. Sem descarte, configurações e usuários |

Matriz completa em `00-context/business-rules.md` seção 5.

### Empresa (`/configuracoes/empresa`)
Dados cadastrais editáveis, fuso horário e moeda (só leitura enquanto houver uma só). Um "Salvar alterações" no fim do formulário. O envio de logotipo saiu em 09/10/2026: o contrato tem `logoUrl`, mas não tem endpoint de envio. Volta junto com ele. Idioma não existe na tela: o piloto é só em português.
Também a **janela de "a vencer"**, configurável por conta, com 30 dias como padrão.

---

## Fora do escopo desta versão

Estes itens não têm tela nesta entrega. Se alguém pedir, a resposta é que estão no backlog como posteriores.

- **Integração com o sistema da farmácia.** Saiu em 17/09: depender de acesso de fornecedor não cabia no prazo do piloto. O piloto entra com planilha e cadastro manual, e a integração volta como projeto futuro, plugando no wizard que já existe
- Módulo de cobrança e assinatura (billing)
- Gestão de múltiplas filiais
- Leitor de QR Code
- Contagem rápida de estoque
- Acesso master a todos os módulos
- Relatórios financeiros avançados
