# O que o frontend precisa: B24, B27, B28, B30

**De:** Marcus (frontend) · **Para:** Pedro (backend) · **Criado em:** 16/09/2026 · **Atualizado em:** 10/10/2026, contrato v17 (página versão 6)

A fonte da verdade continua sendo `docs/01-references/api-contract.md`. Este documento é o recorte do que trava as fases 3 e 4 do frontend.

---

## Atualização de 10/10: o contrato foi da v10 para a v17

Desde a versão de 09/10 o frontend ganhou telas novas: Retirar vencidos, Perdas, Avisos, Movimentações, Notificações e o Calendário de vencimentos. Cada uma pediu alguma coisa do servidor. Uma versão foi decidida pelo Marcus (v11); as outras são propostas do frontend e esperam o seu aceite.

| Versão | O que mudou | Onde mexe |
| --- | --- | --- |
| v11 | **Entrada de lote vira movimentação.** `POST /products/:id/lots` grava também uma ENTRADA no histórico, com usuário, data e hora do token. Código de lote repetido no mesmo produto responde `409 LOT_CODE_TAKEN` (decidido pelo Marcus) | B30 |
| v11 | **Descarte em lote, tudo ou nada.** `POST /movements/out/batch` com `{ items: { lotId, quantity }[], reason, note? }`, numa transação só. `422 LOT_QUANTITY_EXCEEDED` com os `lotId` em `details`, `404 LOT_NOT_FOUND`, `403` para `clerk`; em erro, nada é gravado (decidido pelo Marcus) | B31 |
| v12 | **Endpoint novo:** `GET /reports/losses?period=30d\|90d\|year` para a tela Perdas. Soma e agrupamento no servidor; a perda vale o custo de aquisição no momento da saída (pergunta 8). Proposta | relatório |
| v13 | `GET /products?belowMin=true` para a página Avisos. Sugestão: `POST /notifications/read-all`. Proposta | B27, avisos |
| v14 | **Usuários.** `409 LOGIN_TAKEN` no `POST /users`; `403` no `PATCH /users/:id` para quem muda o próprio cargo ou se bloqueia; `password` opcional no `PATCH`, só para `admin` (pergunta 7). Proposta | usuários |
| v15 | `GET /movements` com `type`, `reason`, `userId` e `from`, do mais recente para o mais antigo, `meta.total` já filtrado. Proposta | B31 |
| v16 | **Endpoint novo:** `GET` e `PUT /users/me/notification-preferences`, um booleano por tipo de aviso; sem nada gravado, tudo ligado (pergunta 9). Proposta | notificações |
| v17 | **Endpoint novo:** `GET /lots?expiresFrom=&expiresTo=` para o calendário de vencimentos, devolve `{ data: CalendarLot[] }`, sem paginação (até 42 dias). Proposta | B30 |

Os detalhes de cada um estão em `docs/01-references/api-contract.md`, nas seções de cada rota.

## Já enviado em 09/10: o contrato da v4 para a v10

Você aceitou a v3 em 16/09 e soube da v4 (sessão em cookie). Desde então o contrato mudou seis vezes. Quase tudo veio do banco que você e o Antônio entregaram em 07/10. O resto veio de telas novas do frontend. Abaixo está o que muda no que você implementa e o que preciso que você responda.

### O que muda no que você implementa

| Versão | O que mudou | Onde mexe |
| --- | --- | --- |
| v5 | Integração com o sistema da farmácia saiu do piloto. `/integrations` não é para fazer | nada a fazer |
| v6 | **Login por usuário, não e-mail.** `POST /auth/login` recebe `{ login, password }`. `User` troca `email` por `login` e ganha `active`. Cargos: `clerk`, `pharmacist`, `admin`. `POST /users` com `{ name, login, password, role }` substitui o convite, e `DELETE /users/:id` saiu (bloqueio é `PATCH` com `active: false`) | B24, usuários |
| v6 | **Descarte só de Farmacêutico ou Administrador.** `POST /movements/out` com `reason` igual a `expiry` ou `damage`, vindo de `clerk`, responde `403` com `FORBIDDEN` | B31 |
| v7 | **Lote que vence hoje é `expired`**, como na `vw_alerta_validade`: `expired` com 0 dias ou menos, `soon` de 1 até `soonThresholdDays` | B27, B30 |
| v8 | **Validade é data, instante é instante.** `expiresAt` e `manufacturedAt` chegam como meia-noite UTC. `createdAt` e `finishedAt` são instantes UTC de verdade, e eu mostro no fuso da conta. **Hora local marcada como UTC aparece 3 horas adiantada** | todos |
| v8 | `Movement.unit`, a unidade do produto, para mostrar "2,5 kg" e não "2,5 un" | B31 |
| v9 | `GET /dashboard`: `expiringSoon` só com lotes `soon`, os cinco que vencem primeiro, com `unit`; `expiryByWeek` começa amanhã. `byFolder` e `recentMovements` não são mais usados | B32 |
| v10 | `GET /products`: `status` aceita vários valores separados por vírgula (`status=expired,soon`), e entram os filtros `supplier` e `brand`. **Endpoint novo:** `GET /products/facets` devolve `{ suppliers: string[], brands: string[] }`, distintos, dos produtos ativos, em ordem alfabética | B27 |

Uma correção no próprio contrato: `POST /companies` ainda dizia que devolvia `token` no corpo. Desde a v4 é `{ user, company }` mais `Set-Cookie`, como o login.

### O que preciso que você responda

1. **Em que fuso o banco decide que dia é hoje?** Se o `CURRENT_DATE` da `vw_alerta_validade` usa o fuso do servidor, e o servidor está em UTC, entre 21h e meia-noite de Brasília o banco já está no dia seguinte: o lote que vence amanhã vira Vencido três horas antes. O certo é o fuso da conta (`Company.timezone`, hoje sempre `America/Sao_Paulo`). O frontend já corrigiu do lado dele
2. **O banco não tem metade do contrato.** Faltam empresa, custo e preço do produto, pastas (só `categoria` em texto), importação e notificações. Sem custo não existe o valor em risco, que é o número principal da Home, nem a ordem da fila de validades. Precisamos decidir com o Antônio o que entra no banco e o que sai do piloto
3. **Faixas de validade.** A view tem Vencido, Vermelho (1 a 30 dias), Amarelo (31 a 60) e Verde. O frontend tem Vencido, A vencer (até 30, configurável por conta), No prazo e Sem validade. Proposta: o banco mantém as faixas que quiser, e a API devolve o `status` do contrato (`expired`, `soon`, `ok`, `unknown`)
4. **Motivos de saída.** O banco aceita VENDA, DESCARTE, AJUSTE e ENTRADA. Roubo e Consumo interno não têm lugar óbvio, e AJUSTE não tem tela
5. **Nomes da API.** O banco usa português (`nome_comercial`, `data_validade`), o contrato usa inglês (`name`, `expiresAt`). A API traduz?
6. **Os cargos.** Proposta do frontend, pelo menor privilégio: Farmacêutico pode o mesmo que Balconista mais o descarte; importação, pastas, usuários e configurações da empresa ficam só com o Administrador. Confirma?
7. **Troca de senha não tem endpoint.** O perfil tem a tela "Trocar senha" (senha atual e nova), e a tela de login diz "Esqueceu a senha? Peça a quem administra a conta". Só que `PATCH /users/:id` não aceita senha. Proposta: `POST /auth/password` com `{ currentPassword, newPassword }` para a própria pessoa, e `password` opcional no `PATCH /users/:id`, só para `admin`, para redefinir a de outra pessoa
8. **Perdas pelo custo de quando saiu (nova, 10/10).** Se o custo do produto mudar, a perda antiga não pode mudar junto: a saída precisa guardar o custo do momento, e o banco ainda não tem custo (pergunta 2). E quem pode ver a tela Perdas? Proposta: a regra da pergunta 6; até a resposta, a tela aparece para todos
9. **A preferência de aviso precisa de lugar no banco (nova, 10/10).** Proposta: quatro colunas booleanas em `usuarios`, ou uma tabela com uma linha por pessoa. A escolha é do Antônio

---

## Convenções que valem para todos os endpoints

- Base `/api/v1`
- **Sessão em cookie httpOnly** gravado por você no login (`valide_session`). Sem header `Authorization`, ver B24
- **O tenant vem sempre do token, nunca do cliente.** O frontend não envia id de conta em lugar nenhum e não tem como escolher conta. Uma farmácia ver o estoque de outra encerra o projeto comercialmente
- Datas em ISO 8601, sempre UTC: `2026-11-30T00:00:00Z`. Validade como meia-noite UTC; instante como instante real (v8)
- **Dinheiro em centavos, número inteiro.** Nunca float, nem string decimal. `R$ 42,80` chega como `4280`
- Paginação por query: `?page=1&perPage=20`
- Toda lista vem no envelope:

```json
{ "data": [], "meta": { "page": 1, "perPage": 20, "total": 143 } }
```

- Todo erro vem no formato:

```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "Produto não encontrado" } }
```

O `message` eu exibo direto para o usuário, então precisa estar em português e sem detalhe interno: nada de nome de tabela, id interno, stack ou caminho de arquivo. O `code` eu uso para decidir o que fazer na tela.

---

## B24: Autenticação

**Trava a fase 3, alvo 24/10.** É o primeiro que preciso: sem ele a área logada não existe de verdade.

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ login, password }` | `{ user: User, company: Company }` mais `Set-Cookie` |
| POST | `/auth/logout` | vazio | `204` mais `Set-Cookie` expirando a sessão |
| GET | `/auth/me` | vazio | `{ user: User, company: Company }` |
| POST | `/companies` | dados da empresa mais o administrador (`name`, `login`, `password`) | `{ user, company }` mais `Set-Cookie` |

`GET /auth/me` é o que eu chamo ao carregar a área logada. `POST /companies` é o cadastro inicial e já deixa o administrador logado.

### A sessão fica com você

Você grava um cookie no login, com `HttpOnly`, `Secure`, `SameSite` e prazo de validade. Nome combinado: `valide_session`. O navegador manda sozinho, e o meu JavaScript nunca toca no token. Token no corpo da resposta teria de ser guardado em algum lugar do navegador, e todo lugar ali é legível por JavaScript: um script injetado, vindo por exemplo de um nome de produto malformado numa planilha importada, levaria a sessão junto.

Do meu lado já está implementado: não existe header `Authorization` no código. As telas buscam dado no servidor, e eu repasso o cookie da requisição que chegou.

**Ponto de infraestrutura para decidirmos antes do deploy:** para o cookie valer entre o domínio do frontend e o da API, ou os dois ficam no mesmo site, ou o cookie precisa de `SameSite=None; Secure` e o CORS precisa liberar credenciais.

### Três pedidos de segurança

1. **Credencial inválida devolve sempre a mesma resposta**, tanto para usuário que não existe quanto para senha errada. Mensagem diferente permite descobrir quais usuários estão cadastrados. Eu exibo "Usuário ou senha incorretos" nos dois casos.
2. **A interface esconde, o servidor bloqueia.** Eu escondo da tela o que cada cargo não pode fazer, mas isso é experiência, não segurança: qualquer pessoa com o console aberto passa por um botão escondido. O servidor precisa negar a requisição de qualquer jeito. Cargos: `clerk` (Balconista), `pharmacist` (Farmacêutico), `admin` (Administrador). A tabela de quem pode o quê está em `docs/00-context/business-rules.md` seção 5.
3. **Nada de dado sensível em resposta de erro**, e nada que eu precise guardar no navegador além de preferência de interface.

---

## B27 e B30: Produtos e lotes

**Travam a fase 4, alvo 07/11.**

### Produtos

| Método | Rota | Query | Saída |
| --- | --- | --- | --- |
| GET | `/products` | `page`, `perPage`, `search`, `folderId`, `status`, `source`, `supplier`, `brand`, `sort` | `{ data: Product[], meta }` |
| GET | `/products/facets` | vazio | `{ suppliers: string[], brands: string[] }` |
| GET | `/products/:id` | vazio | `Product` |
| POST | `/products` | corpo do produto mais lotes iniciais | `Product` |
| PATCH | `/products/:id` | campos parciais | `Product` |
| DELETE | `/products/:id` | vazio | `204` |

- `search` procura em nome, SKU e código de barras
- `status` aceita `expired`, `soon`, `ok`, `unknown`, e mais de um separado por vírgula: `status=expired,soon` é o "Ver produtos em risco" da Home (v10)
- `supplier` e `brand` filtram por igualdade (v10)
- `belowMin=true` devolve só os produtos com `totalQuantity` abaixo de `minStock` (v13)
- `source` aceita `file`, `integration`, `manual`
- `sort` aceita `expiry_asc` (padrão), `expiry_desc`, `name_asc`, `quantity_asc`, `value_desc`
- **Produto inativo não aparece por padrão.** Só com `active=false` ou `active=all`

`value_desc` ordena pelo custo total parado, `totalQuantity × acquisitionCost`. Existe para a fila de validades: o cliente preenche primeiro o que dá mais prejuízo se vencer.

`GET /products/facets` existe para o filtro de fornecedor e marca ser uma escolha, não um campo de texto livre: devolve os valores distintos dos produtos ativos da conta, em ordem alfabética.

### Lotes

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| POST | `/products/:id/lots` | `{ code, manufacturedAt, expiresAt, quantity }` | `Lot`; grava ENTRADA, `409 LOT_CODE_TAKEN` se o código repetir (v11) |
| PATCH | `/lots/:id` | campos parciais | `Lot` |
| GET | `/lots` | `expiresFrom`, `expiresTo` (datas, inclusive) | `{ data: CalendarLot[] }` (v17) |

### Fila de validades pendentes

Não tem rota própria (acordado em 16/09): usa `GET /products?status=unknown&sort=value_desc`. O preenchimento usa o `POST /products/:id/lots` acima.

### O ponto mais importante desta seção

**O status de validade é calculado por você e vem pronto em cada lote e no produto.** Eu tenho uma função local só para dar feedback no formulário enquanto o usuário digita a data. A verdade mora no servidor, porque regra de negócio duplicada em dois lugares diverge com o tempo.

| Estado | Condição |
| --- | --- |
| `expired` | Vence hoje ou já venceu: 0 dias ou menos (v7) |
| `soon` | De 1 até `Company.soonThresholdDays` dias, padrão 30 |
| `ok` | Depois da janela |
| `unknown` | Produto sem nenhum lote cadastrado |

"Hoje" é o dia no fuso da conta, não o do servidor. Ver a pergunta 1 da atualização.

Três regras que são o produto inteiro:

1. **Produto sem lote é `unknown`, nunca `ok`.** Confundir "não sei a validade" com "está no prazo" dá ao dono da farmácia uma segurança que ele não tem. É o pior erro que este sistema pode cometer.
2. **`nearestExpiryStatus` nunca vem `null`.** Quando `lots` está vazio, vem `unknown`.
3. **Produto com vários lotes assume o status do lote que vence primeiro.** Um produto com um lote vencido e dois no prazo aparece como vencido, porque tem algo para resolver nele.

---

## B28: Pastas de classificação

**Trava a fase 4, alvo 07/11.** É o menor dos quatro.

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| GET | `/folders` | vazio | `{ data: Folder[] }` |
| POST | `/folders` | `{ name }` | `Folder` |
| PATCH | `/folders/:id` | `{ name }` | `Folder` |
| DELETE | `/folders/:id` | vazio | `204`, ou erro se a pasta tiver produto |

Regras: um produto pertence a no máximo uma pasta, produto pode ficar sem pasta, pasta só pode ser excluída se estiver vazia, e não há hierarquia nesta versão.

O `productCount` do `Folder` eu uso direto na tela, então preciso que venha calculado.

---

## Os tipos, exatamente como estão no meu código

Copiados de `docs/01-references/api-contract.md` na v10. Se algum campo mudar de nome ou de formato, me avisa antes, porque eu preciso mexer nas telas.

```ts
type ExpiryStatus = 'expired' | 'soon' | 'ok' | 'unknown'
type UserRole     = 'clerk' | 'pharmacist' | 'admin'   // v6
type ImportSource = 'file' | 'integration' | 'manual'

interface User {
  id: string
  name: string
  login: string        // único; o banco não guarda e-mail de usuário (v6)
  role: UserRole
  active: boolean      // false bloqueia sem apagar o histórico (v6)
  avatarUrl: string | null
}

interface Address {
  zipCode: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
}

interface Company {
  id: string
  cnpj: string
  legalName: string
  tradeName: string
  stateRegistration: string | null
  cityRegistration: string | null
  taxRegime: string
  address: Address
  phone: string
  email: string
  website: string | null
  logoUrl: string | null
  timezone: string          // decide o "hoje" do status
  currency: string
  locale: string
  soonThresholdDays: number // janela de "a vencer", padrão 30 (v3)
}

interface Folder {
  id: string
  name: string
  productCount: number
}

interface Lot {
  id: string
  productId: string
  code: string
  manufacturedAt: string | null  // meia-noite UTC
  expiresAt: string              // meia-noite UTC
  quantity: number
  status: ExpiryStatus
}

interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  folderId: string | null
  folderName: string | null
  brand: string | null
  supplier: string | null
  unit: 'un' | 'kg' | 'cx'
  minStock: number
  maxStock: number | null
  acquisitionCost: number   // centavos
  operationalCost: number   // centavos
  salePrice: number         // centavos
  totalQuantity: number
  nearestExpiry: string | null
  nearestExpiryStatus: ExpiryStatus  // 'unknown' quando lots está vazio, nunca null
  lots: Lot[]
  source: ImportSource
  externalId: string | null
  active: boolean           // false se sumiu da origem na reimportação (v3)
}
```

`folderName` vem junto do `folderId`: eu mostro o nome da pasta em toda linha da listagem, e buscar pasta por pasta no cliente seria uma requisição por produto.

---

## Já fechado com você em 16/09

1. **`Company.soonThresholdDays`**, inteiro, padrão 30. Você usa esse valor para calcular o `status`. Aceito.
2. **`Product.active`**, booleano. Produto que sumiu da origem na reimportação fica inativo, não é apagado, porque pode ter lote e validade preenchidos à mão. Aceito.
3. **Sem `GET /products/pending-expiry`.** A fila usa a listagem filtrada. Aceito.

---

## O que eu **não** preciso ainda

- `GET /dashboard` (B32, fase 5, alvo 14/11). As mudanças da v9 estão na tabela lá em cima para você já modelar certo
- `POST /movements/out` e `GET /movements` (B31, mesma fase). O que mudou neles (v11 e v15), mais usuários (v14), perdas (v12) e preferência de aviso (v16), está na tabela de 10/10 lá em cima: não travam as fases 3 e 4, mas vale modelar o banco sabendo que vêm
- Endpoints de importação (fase 4b; a regra de duplicata ainda está aberta)
- **Endpoints de integração (`/integrations`). Não é "ainda não", é "não".** A integração com o sistema da farmácia saiu do piloto em 17/09
- Upload de logotipo e de foto de perfil. As telas tiraram os botões em 09/10 até o envio existir
- Recuperação de senha por e-mail. Sem e-mail no banco, quem esquece pede ao administrador (ver a pergunta 7)

---

## Como eu gostaria de receber

Na ordem: **B24 primeiro**, sozinho se precisar. Consigo ligar login, guarda de rota e sessão assim que ele existir, e isso destrava a fase 3 inteira.

Depois B28, que é pequeno, e por último B27 e B30, que dependem do modelo de lote e validade do Antônio (B29).

Se um endpoint ficar pronto antes dos outros, me manda que eu ligo na hora. Eu continuo com dados falsos enquanto isso, mas o que não pode acontecer é a integração inteira cair na última semana.

Uma URL de teste, mesmo instável e com poucos dados, vale mais para mim do que documentação bonita.
