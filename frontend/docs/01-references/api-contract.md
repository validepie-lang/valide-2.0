# api-contract.md: Contrato entre Frontend e Backend

**Status:** versão 22. Perfis, usuário e descarte alinhados ao banco de 07/10. A v8 a v17 foram enviadas ao Pedro (página do pedido: versão 5 em 09/10, versão 6 em 10/10) e **falta o aceite dele**; a v18 a v22 ainda não foram levadas. Convenções gerais, autenticação, produtos, lotes e pastas **acordados com o Pedro em 16/09**. Endpoints de importação continuam como proposta, pendente de aceite.
**Autor:** Marcus (frontend). **Interlocutor:** Pedro (backend), Antônio (banco).

Este documento é a interface entre o meu trabalho e o do Pedro. Enquanto ele não existir de forma acordada, o frontend trabalha com mocks que seguem exatamente estes formatos. Toda mudança aqui precisa ser combinada entre nós dois, por escrito, antes de virar código.

---

## Convenções gerais

- Base: `/api/v1`
- Autenticação: **cookie de sessão httpOnly**, gravado pelo backend no login. O frontend nunca vê o token. Fechado em 16/09, ver a seção de autenticação
- O tenant (conta) é inferido do token, nunca enviado pelo cliente. Isso protege o isolamento entre contas (backlog B20, B54).
- Datas em ISO 8601, sempre em UTC: `2026-11-30T00:00:00Z`
- **Validade é data, instante é instante.** `expiresAt` e `manufacturedAt` chegam como meia-noite UTC e o frontend lê em UTC (05/10/2026 continua 05/10/2026). `createdAt` e `finishedAt` são instantes reais em UTC, e o frontend mostra a hora no fuso da conta (`Company.timezone`; até a sessão chegar a todos os componentes, `America/Sao_Paulo`). **A API não pode mandar hora local marcada como UTC**, senão tudo aparece 3 horas adiantado. Desde a v8
- Valores monetários em **centavos, número inteiro**. Nada de float para dinheiro.
- Paginação por query: `?page=1&perPage=20`
- Resposta de lista sempre no envelope:

```json
{ "data": [], "meta": { "page": 1, "perPage": 20, "total": 143 } }
```

- Erro sempre no formato:

```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "Produto não encontrado" } }
```

---

## Tipos do domínio

```ts
// 'unknown' = produto sem nenhum lote, validade desconhecida. Não é "no prazo".
type ExpiryStatus = 'expired' | 'soon' | 'ok' | 'unknown'

type ExitReason = 'sale' | 'damage' | 'theft' | 'expiry' | 'internal'

// Os três perfis de perfil_acesso, em ordem de nível. v6
type UserRole = 'clerk' | 'pharmacist' | 'admin'

type ImportSource = 'file' | 'integration' | 'manual'

type ImportStatus = 'pending' | 'mapping' | 'previewing' | 'running' | 'done' | 'failed'

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
  timezone: string
  currency: string
  locale: string
  soonThresholdDays: number   // janela de "a vencer", padrão 30. Fechado em 16/09
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

interface User {
  id: string
  name: string
  login: string        // usuarios.login, único. O banco não guarda e-mail de usuário. v6
  role: UserRole
  active: boolean      // usuarios.ativo. false bloqueia sem apagar histórico. v6
  avatarUrl: string | null
}

interface Folder {
  id: string
  name: string
  productCount: number
  active: boolean // v30: false tira a pasta das escolhas; os produtos continuam nela
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
  source: ImportSource               // de onde este produto veio
  externalId: string | null          // id no sistema de origem, para não duplicar em reimportação
  active: boolean                    // false quando o produto sumiu da origem na reimportação
}

interface Lot {
  id: string
  productId: string
  code: string
  manufacturedAt: string | null
  expiresAt: string
  quantity: number
  status: ExpiryStatus
}

interface Movement {
  id: string
  productId: string
  productName: string
  lotId: string
  lotCode: string
  type: 'in' | 'out'
  reason: ExitReason | null
  quantity: number
  unit: 'un' | 'kg' | 'cx'   // v8, igual a Product.unit: a unidade do produto, para mostrar "2,5 kg" e não "2,5 un"
  userId: string
  userName: string
  createdAt: string
  note: string | null
}

interface Notification {
  id: string
  kind: 'min_stock' | 'user_change' | 'system' | 'import_done'
  title: string
  body: string
  read: boolean
  createdAt: string
  link: string | null
}

interface ImportJob {
  id: string
  source: ImportSource
  status: ImportStatus
  fileName: string | null
  detectedColumns: string[]          // cabeçalhos encontrados no arquivo
  mapping: Record<string, string>    // coluna de origem -> campo do Valide
  totalRows: number
  validRows: number
  errorRows: number
  createdRows: number                // produtos criados de fato
  updatedRows: number                // produtos que já existiam e foram atualizados
  createdAt: string
  finishedAt: string | null
}

interface ImportPreviewRow {
  rowNumber: number
  data: Partial<Product>
  issues: ImportIssue[]
  action: 'create' | 'update' | 'skip'
}

interface ImportIssue {
  field: string
  severity: 'error' | 'warning'
  message: string                    // em português, pronto para exibir
}

interface Integration {
  id: string
  provider: string                   // nome do sistema da farmácia
  status: 'connected' | 'disconnected' | 'error'
  lastSyncAt: string | null
  lastSyncError: string | null
  autoSync: boolean
}
```

---

## Endpoints

### Autenticação

**A sessão vive em cookie httpOnly, não no corpo da resposta.** Decidido em 16/09.

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ login, password }` | `{ user: User, company: Company }` mais `Set-Cookie` com a sessão |
| POST | `/auth/logout` | vazio | `204` mais `Set-Cookie` expirando a sessão |
| GET | `/auth/me` | vazio | `{ user: User, company: Company }` |

O cookie precisa de `HttpOnly`, `Secure`, `SameSite` e um prazo de validade. O nome combinado é `valide_session`.

**Por que não devolver o token no corpo:** se o token chega no corpo, o frontend precisa guardá-lo em algum lugar, e todo lugar disponível no navegador é legível por JavaScript. Qualquer script injetado leva a sessão junto. Com `HttpOnly` o navegador manda o cookie sozinho e o JavaScript nunca toca nele.

**O que isso muda para o frontend:** nada de header `Authorization`. As telas buscam dado em Server Component, e o servidor repassa o cookie da requisição que chegou. Fica tudo em `src/lib/api/session-token.ts`.

**Ponto de infraestrutura a combinar:** para o cookie valer entre o domínio do frontend e o da API, os dois precisam estar no mesmo site, ou o cookie precisa de `SameSite=None; Secure` com CORS liberando credenciais. Vale decidir antes do deploy, junto com o Pedro.

### Empresa

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| POST | `/companies` | dados de cadastro mais usuário admin (`name`, `login`, `password`) | `{ user, company }` mais `Set-Cookie`, como o login (corrigido em 09/10: ainda dizia `token` no corpo, contra a v4) |
| GET | `/companies/current` | vazio | `Company` |
| PATCH | `/companies/current` | campos parciais | `Company` |

**Empresa, nome e senha (v21, proposto pelo frontend em 10/10, issue 059).** Desde 10/10 o front chama de fato:

- `PATCH /companies/current` com `{ cnpj, tradeName, legalName, stateRegistration, cityRegistration, taxRegime, address: { zipCode, street, number, district, city }, phone, email, website, soonThresholdDays, timezone }` (`cityRegistration` e `website` desde a v22, os dois opcionais e `null` quando em branco; `website` chega completo, com `https://`). Só `admin`; os outros cargos recebem `403`. O `address` vem parcial (complemento e estado não estão na tela): o servidor junta com o que já tem. Mudar `soonThresholdDays` muda o `status` de todos os lotes
- `PATCH /users/me` com `{ name }`: o próprio nome, para qualquer cargo, sem o front mandar id
- `POST /auth/password` com `{ currentPassword, newPassword }` (ponto aberto 10): senha atual errada devolve `422` com `WRONG_PASSWORD`; deu certo, `204`
- `PUT /users/me/notification-preferences` (v16) a cada interruptor tocado, com as quatro chaves

### Usuários

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| GET | `/users` | vazio | `{ data: User[] }` |
| POST | `/users` | `{ name, login, password, role }` | `User` |
| PATCH | `/users/:id` | `{ name?, role?, active? }` | `User` |

v6: sem e-mail no banco, não há convite. Quem administra cria a pessoa com uma senha inicial. Usuário não é apagado: `PATCH` com `active: false` bloqueia o acesso e preserva o histórico, que aponta para ele. `DELETE /users/:id` saiu.

**v14 (proposto pelo frontend em 10/10, issue 040).** A tela Usuários ganhou as janelas de adicionar, editar e bloquear. Pedidos ao servidor:

- `POST /users` com `login` que já existe devolve `409 LOGIN_TAKEN`. O `login` é único no banco inteiro (`uk_usuarios_login`), não só na farmácia: o front só confere a lista da própria conta
- `PATCH /users/:id` recusa, com `403`, que a pessoa mude o próprio `role` ou mande `active: false` para si mesma. A tela já esconde as duas coisas; o servidor precisa bloquear, senão a farmácia pode ficar sem administrador
- A edição tem "Nova senha", opcional: é o `password` no `PATCH /users/:id`, só para `admin`, do ponto aberto 10
- Desde 10/10 (issue 058) o front chama de fato. Na edição manda só o que pode mudar: `name`, `role` (nunca o da própria pessoa) e `password` só se foi digitada. Bloquear e liberar mandam só `active`

### Pastas

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| GET | `/folders` | vazio | `{ data: Folder[] }` |
| POST | `/folders` | `{ name }` | `Folder` |
| PATCH | `/folders/:id` | `{ name }` ou `{ active }` (v30) | `Folder` |
| DELETE | `/folders/:id` | `?moveTo=<id>` ou `?moveTo=none` (v30), só para pasta com produto | `204`, ou erro se tiver produto e não vier `moveTo` |

**Erros das pastas (v20, proposto pelo frontend em 10/10, issue 057).** Desde 10/10 o front chama de fato as três escritas.

- `name` sem espaços sobrando, de 1 a 60 letras, único na conta sem diferenciar maiúscula: repetido devolve `409` com `FOLDER_NAME_TAKEN`
- `DELETE` de pasta com produto: `409` com `FOLDER_NOT_EMPTY`, e a `message` dizendo para mover os produtos antes
- Pasta que não existe ou é de outra conta: `404` com `FOLDER_NOT_FOUND`

**Pasta ativa e excluir com destino (v30, proposto pelo frontend em 13/10, issue 076).** Regra em `business-rules.md` 9 e 9.1.

- `Folder.active`: toda pasta nasce ativa. `PATCH /folders/:id` com `{ active: false }` desativa e com `{ active: true }` ativa de novo; só Administrador (`403 FORBIDDEN` para os outros cargos, como as outras escritas de pasta). Pede uma coluna `ativo` na tabela de pastas (Antônio)
- Desativar não mexe nos produtos: continuam na pasta e aparecem em `GET /products`, `GET /dashboard` (`byFolder`) e no filtro `folderId`. O front tira a pasta desativada das escolhas (cadastro, mover, filtro, destino). `GET /folders` continua devolvendo todas, com `active`
- Produto já numa pasta desativada pode ser salvo com ela (`PATCH /products/:id` com o mesmo `folderId`). Sugestão: `POST /products` e `PATCH /products/folder` para uma pasta desativada recusam com `422 FOLDER_INACTIVE`; o front nunca oferece, então é só proteção
- `DELETE /folders/:id?moveTo=<id>` leva os produtos para outra pasta da conta e exclui na mesma transação; `?moveTo=none` deixa-os sem pasta. Sem `moveTo`, pasta com produto continua dando `409 FOLDER_NOT_EMPTY`. Destino que não existe, de outra conta ou a própria pasta: `422 FOLDER_TARGET_INVALID`. O histórico dos produtos não muda (mudar de pasta não é movimentação)
- Excluir várias de uma vez (item 66): o front chama um `DELETE` por pasta, só das vazias. Um endpoint em lote não é necessário com poucas pastas
- Busca, ordem e página da tela Pastas (item 64) ficam no front: `GET /folders` devolve todas. Se alguma conta passar de umas 200 pastas, combinamos `search`, `sort` e `page`

### Produtos

| Método | Rota | Query | Saída |
| --- | --- | --- | --- |
| GET | `/products` | `page`, `perPage`, `search`, `folderId`, `status`, `source`, `supplier`, `brand`, `sort` | `{ data: Product[], meta }` |
| GET | `/products/facets` | vazio | `{ suppliers: string[], brands: string[] }` |
| GET | `/products/:id` | vazio | `Product` |
| POST | `/products` | corpo do produto mais lotes iniciais | `Product` |
| PATCH | `/products/:id` | campos parciais | `Product` |
| PATCH | `/products/folder` | `{ productIds: string[], folderId: string \| null }` (v25) | `{ moved: number, folderName: string \| null }` |
| GET | `/products/:id/notes` | (v26) | `{ data: ProductNote[] }`, da mais recente |
| POST | `/products/:id/notes` | `{ text }` (v26) | `ProductNote` |
| GET | `/products/:id/changes` | (v26) | `{ data: ProductChange[] }`, da mais recente |
| POST | `/products/:id/photo` | multipart, campo `foto` (v26) | `{ photoUrl }` |
| DELETE | `/products/:id/photo` | (v26) | `204` |
| DELETE | `/products/:id` | vazio | `204` |

**Corpo do cadastro e da edição (v18, proposto pelo frontend em 10/10, issue 055).** O "corpo do produto mais lotes iniciais" fica assim:

```json
{
  "name": "Dipirona Sódica 500mg", "sku": null, "barcode": "7896004700014",
  "folderId": "f2", "brand": "Neo Química", "supplier": null, "unit": "un",
  "minStock": 0, "maxStock": null,
  "acquisitionCost": 742, "operationalCost": 0, "salePrice": 1290,
  "lots": [{ "code": "L2291", "manufacturedAt": null, "expiresAt": "2027-05-31T00:00:00Z", "quantity": 30 }]
}
```

- `lots` só no `POST`, e pode vir vazio: o produto nasce `unknown`. Cada lote entra como no `POST /products/:id/lots` (grava ENTRADA)
- O `PATCH` manda os mesmos campos, sem `lots`: lote e quantidade mudam por movimentação
- Texto opcional em branco chega como `null`; `sku` também, já que o banco não tem SKU
- `barcode` é único (`produtos.ean`): repetido devolve `409` com `BARCODE_TAKEN`, e a `message` diz de qual produto é
- `sku` (código interno), quando vem, também é único na conta (v27, issue 072): repetido devolve `409` com `SKU_TAKEN`, a `message` dizendo de qual produto é, e a tela mostra no campo
- Vender abaixo do custo é permitido; o aviso é só da tela

`status` aceita `expired`, `soon`, `ok`, `unknown`, **e mais de um separado por vírgula** (`status=expired,soon`, v10): é o "Ver produtos em risco" da Home, que soma vencidos e a vencer.
`supplier` e `brand` (v10) filtram por igualdade com `Product.supplier` e `Product.brand`.
`belowMin=true` (v13, proposto em 10/10): só os produtos com `totalQuantity` abaixo de `minStock`, para a página Avisos. A comparação é do servidor, como o status de validade.

`GET /products/facets` (v10) devolve os fornecedores e as marcas distintos dos produtos ativos da conta, em ordem alfabética, para o filtro ser uma escolha e não um campo de texto livre.
`sort` aceita `expiry_asc` (padrão), `expiry_desc`, `name_asc`, `quantity_asc`, `value_desc`.
**Produto sem validade fica no fim nas duas ordens de validade** (v24, 12/10, decisão do Marcus): em `expiry_asc` e em `expiry_desc`, quem não tem lote vem depois de todos os que têm, porque a ordem é pela data e ele não tem. Hoje o mock punha os sem validade no topo da `expiry_desc`.
`folderId=none` (v24) devolve só os produtos sem pasta (`folderId: null`), para o filtro "Sem pasta" do Estoque e a linha "Sem pasta" da tela Pastas.
`perPage` (v24): o Estoque pede 25, 50 ou 100 ("Linhas por página"). O servidor pode recusar acima de 100.

`PATCH /products/folder` (v25, proposto em 12/10, issue 069): move vários produtos para uma pasta, ou para nenhuma com `folderId: null`, tudo ou nada. Até 500 ids por pedido; acima, `422 TOO_MANY_PRODUCTS`. Lista vazia, `422 NOTHING_SELECTED`. Pasta que não existe, `404 FOLDER_NOT_FOUND`; produto que não existe ou é de outra conta, `404 PRODUCT_NOT_FOUND`. Quando o Estoque marca "todos os N", o front junta os ids com o mesmo `GET /products` da tela e manda a lista: a API não precisa entender filtro aqui.
`source` filtra por `file`, `integration` ou `manual`.

**Detalhe do produto (v26, proposto em 12/10, issue 070):**
- `Product.photoUrl`: endereço da foto, ou `null`. `POST /products/:id/photo` recebe JPG, PNG ou WebP até 2 MB (`422 PHOTO_NOT_ACCEPTED` fora disso) e devolve o endereço; `DELETE` tira
- Nota: `{ id, text, userName, createdAt }`, até 500 letras (`422 NOTE_INVALID` vazia ou longa). Qualquer cargo escreve; não se edita nem se apaga
- Alteração do cadastro: `{ id, at, userName, kind: "created", source }` ou `{ id, at, userName, kind: "updated", field, from, to }`. `field` é `name`, `salePrice`, `acquisitionCost`, `minStock`, `folder`, `barcode`, `brand` ou `supplier`; dinheiro em centavos, pasta pelo nome (`null` é sem pasta). `userName` null no `created` quando veio da importação. O servidor grava uma linha por campo mudado em todo `PATCH /products/:id` e `PATCH /products/folder`
- **Quem edita (item 18, decisão do Marcus em 12/10):** Administrador e Farmacêutico. `PATCH /products/:id`, `PATCH /products/folder` e a foto devolvem `403` para o Balconista

`value_desc` existe para a fila de validades pendentes: ordena pelo custo total parado, para o cliente preencher primeiro o que dá mais prejuízo se vencer.

**Produto inativo não aparece por padrão.** `GET /products` devolve apenas `active: true`, a não ser que a query traga `active=false` ou `active=all`. O frontend não tem tela para produto inativo nesta versão, então a listagem simplesmente não os vê.

### Lotes

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| POST | `/products/:id/lots` | `{ code, manufacturedAt, expiresAt, quantity, supplier?, invoiceNumber? }` (v27) | `Lot` |
| DELETE | `/products/:id/lots/:lotId` | (v27) | `204` |
| PATCH | `/lots/:id` | campos parciais | `Lot` |

**Origem e desfazer (v27, proposto em 13/10, issue 072).**
- `supplier` e `invoiceNumber` são opcionais (`null` em branco): fornecedor até 80 letras; nota até 20 caracteres, começando por número, só números, ponto, traço e barra (`422 VALIDATION_ERROR` fora disso). O servidor guarda na ENTRADA do histórico; o `Movement` da entrada devolve `note` com "Fornecedor · NF número"
- `DELETE /products/:id/lots/:lotId` é o "Desfazer" da fila de validades pendentes, logo depois de salvar. Só aceita lote que não teve outra movimentação além da ENTRADA; senão, `409` com `LOT_NOT_REMOVABLE`. A ENTRADA sai junto: o lote nunca existiu. Proposta: aceitar só nos primeiros minutos (o servidor decide quantos)

**Entrada de lote (decidido pelo Marcus em 10/10, falta o aceite do Pedro).** O `POST /products/:id/lots` grava também uma movimentação de ENTRADA em `historico_movimentacao`, com usuário, data e hora tirados do token, como a saída. Código de lote que já existe no mesmo produto é recusado: `409` com `LOT_CODE_TAKEN`. A tela avisa antes de enviar, mas quem decide é o servidor.

**Lotes por data de validade (v17, proposto pelo frontend em 10/10, issue 052).** Para o calendário de vencimentos:

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| GET | `/lots` | `expiresFrom`, `expiresTo` (datas, inclusive) | `{ data: CalendarLot[] }` |

`CalendarLot` é o `ExpiringSoonItem` do dashboard mais o `lotId`: produto, lote, validade, `status`, quantidade e unidade. Do que vence primeiro ao último, só produto ativo e lote com quantidade. Um mês com os dias de fora da grade cabe numa chamada (até 42 dias), sem paginação.

### Movimentação e baixa

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| POST | `/movements/out` | `{ lotId, quantity, reason, note? }` | `Movement` |
| POST | `/movements/out/batch` | `{ items: { lotId, quantity }[], reason, note? }` | `{ data: Movement[] }` |
| GET | `/movements` | `page`, `perPage`, `productId?`, `type?`, `reason?`, `userId?`, `from?` (v15), `to?` (v28) | `{ data: Movement[], meta }`, com `meta.countsByType` (v28) |
| POST | `/movements/:id/reverse` | (v27) | `Movement` (o estorno) |
| POST | `/movements/:id/adjust` | `{ quantity, note }` (v28) | `Movement` (o ajuste) |

**Desfazer a saída (v27, proposto em 13/10, issue 072).** O botão "Desfazer" da faixa "Saída registrada" chama `POST /movements/:id/reverse`. O histórico continua imutável: o servidor grava uma movimentação nova, de estorno, que devolve a quantidade ao lote, com quem e quando do token. Só vale para saída, uma vez e logo depois de registrar; fora disso, `409` com `MOVEMENT_NOT_REVERSIBLE`. Mesmo cargo que pode registrar aquela saída.

Ao dar baixa, o backend registra usuário, data e hora automaticamente a partir do token.

Desde 10/10 (issue 054) o front chama de fato o `POST /movements/out` (tela Registrar saída) e o `POST /products/:id/lots` (Registrar entrada, pelo produto e geral). Recusa com `message` vai para a tela como veio; `LOT_CODE_TAKEN` vai para o campo do lote. Desde 13/10 (issue 074) a entrada geral mostra "Conferido hoje" com o `GET /movements?type=in&userId=<quem usa>&from=<hoje>&to=<hoje>&perPage=8`: nada novo, só o que a v28 já pede.

**Filtros da tela Movimentações (v15, proposto pelo frontend em 10/10, issue 041).** `type` é `in` ou `out`; `reason`, um dos motivos de saída (implica `out`); `userId`, quem registrou; `from`, o primeiro dia, `"2026-10-04"`, no fuso da conta (`Company.timezone`), como as outras datas de calendário. A lista vem do mais recente para o mais antigo, e `meta.total` conta o resultado já filtrado. Todos os cargos veem, como o histórico do produto.

**Movimentações com contagem, datas livres, planilha e correção (v28, proposto em 13/10, issue 073).**
- `to`: o último dia, inclusive, no fuso da conta, como `from`. A tela manda os dois sempre (período pronto ou datas escolhidas, até um ano para trás)
- `type` aceita também `adjust`
- `meta.countsByType`: `{ in, out, adjust }`, quantas o filtro acha de cada tipo **sem contar o próprio `type` nem o `reason`** (respeita `productId`, `userId`, `from` e `to`). São os números nos botões de tipo. Sem o campo, a tela mostra os botões sem número
- **Ajuste (AJUSTE do banco):** `Movement.type = "adjust"`, `quantity` com sinal (positivo volta para o lote, negativo sai), `reason: null`, `note` com a justificativa e `corrects: { id, type, quantity, createdAt }` da movimentação corrigida. A corrigida passa a vir com `correctedAt`
- `POST /movements/:id/adjust` com `{ quantity, note }`: `quantity` é o que de fato aconteceu (zero se não aconteceu); o servidor grava o AJUSTE com a diferença e muda o lote. Justificativa obrigatória, de 3 a 500 letras. Erros: `403 FORBIDDEN` para o Balconista (o banco: o nível 2 autoriza ajustes); `409 MOVEMENT_NOT_CORRECTABLE` se for um ajuste; `409 MOVEMENT_ALREADY_CORRECTED` se já foi corrigida (uma vez só); `422 VALIDATION_ERROR` para a mesma quantidade ou justificativa vazia; `422 LOT_QUANTITY_EXCEEDED` se o lote ficaria negativo; `409 LOT_NOT_FOUND` se o lote já não existe. Regra em `business-rules.md` 3.5
- **Planilha:** sem endpoint novo. O front pede o mesmo `GET /movements` de 100 em 100, até 5.000 linhas. Se ficar pesado, um `GET /movements/export` com os mesmos filtros resolve

**Descarte só de Farmacêutico ou Administrador** (regra do banco, v6). `reason` igual a `expiry` ou `damage` é descarte. Vindo de `clerk`, o servidor responde `403` com `FORBIDDEN`. O frontend esconde esses motivos do Balconista, mas isso é interface, não proteção.

`note` corresponde a `historico_movimentacao.justificativa`, e a tela já chama o campo de Justificativa.

**Descarte em lote (v11, decidido pelo Marcus em 10/10, falta o aceite do Pedro).** `POST /movements/out/batch` grava várias saídas numa transação só: ou todas entram, ou nenhuma. É o que a tela Retirar vencidos usa.

- `reason` vale para todos os itens. Na tela, sempre `expiry`
- Cada item vira uma movimentação no histórico, com usuário, data e hora do token, como a saída avulsa
- `403` com `FORBIDDEN` se o cargo for `clerk` e o motivo for descarte (mesma regra da saída avulsa)
- `422` com `LOT_QUANTITY_EXCEEDED` se algum item pedir mais do que o lote tem, e `details` com os `lotId` problemáticos; nada é gravado
- `404` com `LOT_NOT_FOUND` se algum lote não existir ou for de outra conta; nada é gravado

### Relatório de perdas (v12, proposto pelo frontend em 10/10)

```
GET /reports/losses?period=30d|90d|year
```

Soma, custo e agrupamento ficam no servidor; a tela Perdas (issue 036) só mostra. Perda é saída com `reason` igual a `expiry`, `damage` ou `theft`, valorada pelo custo de aquisição do produto **no momento da saída** (se o custo mudar depois, a perda antiga não muda).

```json
{
  "period": "30d", "from": "2026-09-11T00:00:00Z", "to": "2026-10-10T00:00:00Z",
  "total": 239012, "previousTotal": 213400, "units": 87,
  "byReason": [{ "reason": "expiry", "value": 218100, "units": 76 }],
  "bucket": "week",
  "series": [{ "start": "2026-10-04T00:00:00Z", "value": 18500 }],
  "topProducts": [{ "productId": "p12", "productName": "Xarelto 20mg", "unit": "un", "units": 3, "value": 56200, "mainReason": "expiry" }]
}
```

- `previousTotal`: o mesmo intervalo, logo antes; `null` quando não há histórico
- `bucket`: semana para 30 e 90 dias, mês para o ano
- `topProducts`: os cinco de maior valor
- Quem pode ver é a pergunta 6 (permissões por cargo). Até a resposta, a tela aparece para todos

### Dashboard

Este é o endpoint mais importante para mim. Uma chamada só, para a Home carregar rápido.

```
GET /dashboard
```

```json
{
  "valueAtRisk": 428000,
  "valueAtRiskLastWeek": 274000,
  "counts": { "expired": 12, "soon": 37, "ok": 284, "unknown": 412 },
  "pendingExpiry": { "productCount": 412, "valueAtStake": 1840000 },
  "expiryByWeek": [
    { "weekStart": "2026-09-21T00:00:00Z", "lotCount": 8 },
    { "weekStart": "2026-09-28T00:00:00Z", "lotCount": 14 }
  ],
  "byFolder": [
    { "folderId": "f1", "folderName": "Medicamentos", "atRiskCount": 22 }
  ],
  "expiringSoon": [
    {
      "productId": "p1",
      "productName": "Dipirona 500mg",
      "lotCode": "L2291",
      "expiresAt": "2026-09-22T00:00:00Z",
      "status": "soon",
      "quantity": 14,
      "unit": "un"
    }
  ],
  "recentMovements": []
}
```

`valueAtRisk` em centavos: soma do custo de aquisição dos itens com status `expired` mais `soon`. **Não inclui `unknown`**, porque não se sabe se está em risco.

`counts.ok` conta apenas produtos com validade conhecida e dentro do prazo. Produto sem lote entra em `unknown`, nunca em `ok`.

`pendingExpiry.valueAtStake` é o custo total parado em produtos sem validade informada. É o número que justifica o esforço de preencher a fila.

`expiringSoon` (v9): só lotes com `status = soon`, os **cinco** que vencem primeiro, cada um com a `unit` do produto. Os vencidos não entram: já têm a contagem em `counts.expired` e um caminho próprio na tela.

`expiryByWeek` (v9): oito semanas, a primeira começando **amanhã**. O lote que vence hoje já é `expired` e não entra.

`valueAtRiskLastWeek` (v23, proposto em 12/10): o `valueAtRisk` de sete dias atrás, em centavos, para a variação "+12% desde a semana passada" do Início. O jeito mais simples é guardar o número do dia uma vez por dia; recalcular do histórico também serve. `null` quando a conta tem menos de uma semana: aí o front não mostra variação.

`byFolder` voltou a ser usado em 12/10 (v23): a rosca "Em risco por pasta" do Início e a coluna de risco da tela Pastas. `atRiskCount` conta **produtos** (não lotes) com estado `expired` ou `soon` em cada pasta; produto sem pasta não entra. `recentMovements` continua sem uso na Home desde 08/10 e fica no contrato até o Pedro confirmar que pode tirar.

### Importação

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| POST | `/imports` | `{ source: "file", files: [{ name, size }] }` (v29) | `ImportJob` em `uploading` |
| POST | `/imports/:id/parts` | multipart: `fileIndex`, `partIndex`, `part` (até 1 MB) (v29) | `{ received }` |
| POST | `/imports/:id/read` | vazio (v29) | `ImportJob` em `mapping`, com `detectedColumns` e `mapping` sugerido |
| GET | `/imports/:id/columns` | vazio (v29) | `{ data: { name, samples }[] }` |
| PATCH | `/imports/:id/mapping` | `{ mapping }` | `ImportJob` |
| GET | `/imports/:id/preview` | `page`, `perPage`, `issue` (v29: `error`, `warning`, `excluded`) | `{ data: ImportPreviewRow[], meta }` |
| PATCH | `/imports/:id/rows` | `{ rowNumber, excluded }` (v29) | `ImportJob` |
| POST | `/imports/:id/confirm` | vazio | `ImportJob` com status `running` |
| POST | `/imports/:id/cancel` | vazio (v29) | `ImportJob` em `canceled` |
| GET | `/imports/:id` | vazio | `ImportJob`, para acompanhar o progresso |
| GET | `/imports` | `page`, `perPage`, `status` (v29) | histórico de importações |

**Envio do arquivo (v19, proposto pelo frontend em 10/10, issue 056).** O `POST /imports` recebe `multipart/form-data` com dois campos: `source` igual a `file` e `file`, o arquivo. Desde 10/10 o front chama de fato os quatro passos (enviar, mapear, confirmar, acompanhar).

- O arquivo passa pelo servidor do Next antes de chegar à API, e a Vercel aceita até 4,5 MB por requisição: a tela recusa acima de 4 MB. Catálogo maior pede outro caminho (ponto 21)
- Arquivo que não é CSV nem XLSX, vazio, ou que não dá para ler: `422` com `FILE_NOT_ACCEPTED` e a `message` dizendo o que fazer, que a tela mostra como veio
- O mapeamento vai como `{ mapping: { "<coluna do arquivo>": "<campo do Valide>" } }`, coluna sem campo com `""`. A tela já confere que `name` está em alguma coluna e que nenhum campo está em duas

**Vários arquivos, envio em partes, rascunho, desmarcar e cancelar (v29, proposto em 13/10, issue 075).** Substitui o envio da v19.
- **Envio:** `POST /imports` com a lista das planilhas (até 5, até 20 MB somadas; acima, `422 FILE_NOT_ACCEPTED`) abre a importação em `uploading`. Cada arquivo sobe em partes de 1 MB, em ordem, por `POST /imports/:id/parts` (multipart: `fileIndex`, `partIndex`, `part`), que devolve quantos bytes daquele arquivo já chegaram: é a barra de progresso. Assim cabe acima dos 4,5 MB por requisição da Vercel sem cookie entre domínios (ponto 21). Parte fora de ordem ou de arquivo que não existe: `422 PART_INVALID`
- **Leitura:** `POST /imports/:id/read` quando todas as partes chegaram (senão `409 UPLOAD_INCOMPLETE`). O servidor lê as planilhas, confere que têm as mesmas colunas (`422 COLUMNS_DIFFER`, com a `message` dizendo qual arquivo difere e o que falta) e sugere o mapeamento. Produto repetido entre as planilhas segue a regra do item 26, ainda em decisão
- `GET /imports/:id/columns`: cada coluna com até três valores de exemplo, para o Mapear (o front mostrava os de exemplo; faltava no contrato)
- `ImportStatus` ganha `uploading` e `canceled`. `ImportJob` ganha `files` (`{ name, size }[]`), `warningRows` e `excludedRows`; `validRows` já desconta as desmarcadas
- **Desmarcar (item 25):** `PATCH /imports/:id/rows` com `{ rowNumber, excluded }`. Linha com erro já fica de fora: `422 ROW_NOT_SELECTABLE`. A prévia aceita `issue=error|warning|excluded` e devolve as linhas com `excluded`. O `confirm` grava só as marcadas
- **Rascunho (item 38):** a importação continua no servidor entre os passos. `GET /imports?status=uploading,mapping,previewing` lista as paradas, para a primeira tela oferecer Continuar e Descartar
- **Cancelar (item 108):** `POST /imports/:id/cancel`. Antes de confirmar, descarta; durante `running`, o servidor para e desfaz o que já gravou (nada entra); depois de `done`, `409 IMPORT_FINISHED`
- **Linhas com problema (item 107):** sem endpoint novo. O front pede a prévia com `issue=error` e `issue=warning`, de 100 em 100, e monta a planilha
- **Modo de demonstração (item 106):** sem a API, o navegador lê o cabeçalho e as primeiras linhas para a tela. Com a API ligada, não lê nada (`import-strategy.md`, seção 6)

O frontend faz polling em `GET /imports/:id` enquanto o status for `running`. Se a importação de um catálogo grande passar de alguns minutos, vale revisar para webhook ou SSE, mas polling resolve o MVP.

**Regra de duplicata:** o backend decide `create` ou `update` por `externalId`, e na falta dele por código de barras, e na falta dos dois por SKU. Isso precisa estar definido antes da tela de revisão ser construída, porque a coluna "ação" da revisão mostra essa decisão ao usuário.

### Fila de validades pendentes

**Não tem rota própria.** A fila usa a listagem que já existe:

```
GET /products?status=unknown&sort=value_desc
```

`status=unknown` já devolve exatamente os produtos com `lots` vazio, e `value_desc` já ordena pelo custo total parado. Uma rota dedicada seria a mesma consulta com outro nome.

O preenchimento usa o endpoint de lote que já existe: `POST /products/:id/lots`. Desde 10/10 (issue 053) o front chama de fato, um lote por produto, com `manufacturedAt: null` e a quantidade em branco preenchida com o `totalQuantity` do produto. `409 LOT_CODE_TAKEN` aparece no campo do lote; qualquer outro erro, com o `message` do servidor, acima dos botões.

Descartado em 16/09: `GET /products/pending-expiry`, proposto na v2.

### Integrações: fora do escopo do piloto

**Não construir.** A equipe decidiu em 17/09 que a integração com o sistema da farmácia é inviável para o piloto, porque depender de acesso de fornecedor não cabe no prazo. Vira projeto futuro.

O rascunho fica registrado aqui para quando voltar, junto com a regra de segurança que vale desde já:

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| GET | `/integrations` | vazio | `{ data: Integration[] }` |
| POST | `/integrations` | `{ provider, credentials }` | `Integration` |
| POST | `/integrations/:id/sync` | vazio | `ImportJob` |
| DELETE | `/integrations/:id` | vazio | `204` |

**Nota de segurança, para quando isso voltar:** as credenciais do sistema da farmácia nunca ficam no frontend nem no navegador. O formulário envia uma vez e o backend guarda. A tela depois mostra apenas o estado da conexão, nunca o valor da credencial.

O tipo `Integration` foi removido do frontend. `ImportSource` mantém o valor `integration`, porque faz parte do contrato já acordado e um produto vindo dela precisa ter como se identificar quando ela existir.

### Notificações

| Método | Rota | Entrada | Saída |
| --- | --- | --- | --- |
| GET | `/notifications` | vazio | `{ data: Notification[] }` |
| PATCH | `/notifications/:id/read` | vazio | `Notification` |

Desde 10/10 (issue 060) o front chama de fato: ao abrir um aviso e, um por aviso, em "Marcar todos como lidos" (ponto 15 sugere `POST /notifications/read-all`).
| GET | `/users/me/notification-preferences` | vazio | `NotificationPreferences` (v16) |
| PUT | `/users/me/notification-preferences` | `NotificationPreferences` | `NotificationPreferences` (v16) |

**Preferência de aviso (v16, proposto pelo frontend em 10/10, issue 044).** Cada pessoa escolhe o que vira aviso no sino, um booleano por tipo que já existe: `{ expiringThisWeek, minStock, teamActivity, importDone }` (os `kind` `system`, `min_stock`, `user_change` e `import_done`). Sem preferência gravada, tudo ligado. O servidor deixa de criar o aviso desligado para aquela pessoa; não esconde depois. Precisa de lugar no banco (uma tabela por usuário ou quatro colunas em `usuarios`).

---

## Decisões fechadas em 16/09/2026

1. **Cálculo do status de validade.** O backend calcula e devolve `status` pronto em cada lote. O frontend tem a função local `getExpiryStatus` para dar feedback imediato no formulário, antes de salvar. A regra de negócio mora no servidor.
2. **Janela de "a vencer": 30 dias**, como padrão. Ideal que o valor venha do `Company` e seja configurável por conta.
3. **Valores monetários em centavos, inteiro.** Aceito.
4. **Dashboard em uma chamada agregada.** Aceito.
5. **Paginação por offset.** Aceito para o MVP. Revisamos se a farmácia parceira tiver volume alto.
6. **Sessão em cookie httpOnly.** O backend grava no login, o frontend nunca vê o token. Acordado com o Marcus e o Pedro em 16/09.
7. **A janela de "a vencer" vive na conta.** `Company.soonThresholdDays`, inteiro, padrão 30. O backend usa esse valor para calcular o `status` de cada lote. Acordado com o Pedro em 16/09.
8. **Produto que sumiu da origem vira inativo, não é apagado.** `Product.active`, booleano. Apagar destruiria lote e validade que o cliente preencheu à mão. Acordado com o Pedro em 16/09.
9. **A fila de validades não tem rota própria.** Usa `GET /products?status=unknown&sort=value_desc`. Acordado com o Pedro em 16/09.
10. **O dia do vencimento já é Vencido.** `expired` quando faltam 0 dias ou menos; `soon` de 1 até `soonThresholdDays`. Igual à `vw_alerta_validade` do banco. Decidido em 08/10.

---

## Pontos ainda abertos

Levar para a próxima reunião:

1. **Regra de duplicata na importação.** Qual campo identifica que um produto já existe: `externalId`, código de barras ou SKU, e em que ordem. Isso precisa estar definido antes da tela de revisão de importação ser construída.
2. ~~**Reimportação.**~~ **Fechado em 16/09:** produto que sumiu da origem fica marcado como inativo, via `Product.active`. Falta definir se o cliente consegue ver e reativar esses produtos em algum lugar, mas isso é tela, não contrato, e fica para depois do MVP.
3. **A integração traz lote e validade?** Depende do sistema. Precisa ser verificado com o primeiro fornecedor que a equipe conseguir contato. Ver `01-references/import-strategy.md` seção 2.
4. **Formato do arquivo de importação.** Sugiro aceitar CSV e XLSX, e o passo de mapeamento de colunas resolver o resto. Sem modelo fixo obrigatório, porque cada sistema exporta de um jeito.
5. **Limite de linhas por importação.** Precisa de um número para o frontend avisar antes de o usuário subir um arquivo grande demais.
6. **O banco de 07/10 não tem tabela para metade deste contrato.** Faltam empresa, custo e preço do produto, pastas (só `categoria` em texto), importação e notificações. Sem custo não existem `valueAtRisk`, `pendingExpiry.valueAtStake` nem `sort=value_desc`. Precisa decidir, com o Pedro e o Antônio, o que entra no banco e o que sai do piloto.
7. **Motivos de saída.** A migration aceita VENDA, DESCARTE, AJUSTE e ENTRADA. Roubo e Consumo interno não têm lugar óbvio, e AJUSTE ainda não tem tela no frontend. Pelo seed, ajuste é do Farmacêutico e do Admin, como o descarte.
8. **Classificação de validade: o banco e o frontend discordam.** A view `vw_alerta_validade` da migration de 07/10 classifica por dias até vencer: `<= 0` VENCIDO, 1 a 30 VERMELHO, 31 a 60 AMARELO, acima de 60 VERDE. O frontend usa o acordo de 16/09: `< 0` Vencido, 0 a 30 A vencer, acima de 30 No prazo, mais Sem validade. Três pontos a decidir juntos:
   - ~~**Lote que vence hoje.**~~ **Fechado em 08/10:** é Vencido, como no banco. Decisão 10.
   - **Vermelho para lote que ainda não venceu.** No frontend vermelho é só Vencido, para não perder o sentido de urgência. Proposta: o banco pode manter as faixas, e a API devolve o `status` do contrato (`expired`, `soon`, `ok`).
   - **Duas faixas de alerta (30 e 60 dias) ou uma (30, configurável por conta).** Se forem duas, o frontend precisa de um quinto estado, e isso muda o vocabulário fixo.
9. **Nomes da API.** O banco usa português (`nome_comercial`, `data_validade`) e este contrato usa inglês (`name`, `expiresAt`). Confirmar que a API traduz.
10. **Troca de senha não tem endpoint.** O perfil tem "Trocar senha" (senha atual e nova), e o login orienta a pedir ao administrador quem esqueceu, mas `PATCH /users/:id` não aceita senha. Proposta do frontend: `POST /auth/password` com `{ currentPassword, newPassword }` para a própria pessoa, e `password` opcional no `PATCH /users/:id`, só para `admin`. Levantado em 09/10.
11. **Em que fuso o banco decide o "hoje".** O `CURRENT_DATE` da `vw_alerta_validade` precisa usar o fuso da conta (`Company.timezone`), não o do servidor. Em UTC, entre 21h e meia-noite de Brasília o lote que vence amanhã vira Vencido. Ver `08-project/pauta-reuniao.md` item 2.6.
12. ~~**A entrada de lote vira movimentação?**~~ Decidido em 10/10: sim, e código repetido é recusado. Ver a seção Lotes.
13. ~~**Descarte em lote.**~~ Decidido em 10/10: `POST /movements/out/batch`, tudo ou nada. Ver a seção Movimentação e baixa (v11).
14. **Relatório de perdas.** `GET /reports/losses` (v12) é novo. Pede ao Pedro: a soma no servidor, o custo no momento da saída, e quem pode ver. Levantado em 10/10.
15. **Produtos abaixo do mínimo.** `GET /products?belowMin=true` (v13). E "Marcar todos como lidos" na página Avisos chama hoje um `PATCH /notifications/:id/read` por aviso; um `POST /notifications/read-all` resolveria de uma vez. Levantado em 10/10.
16. **Usuários (v14).** `409 LOGIN_TAKEN` no `POST /users`, e `403` para quem muda o próprio cargo ou se bloqueia. Levantado em 10/10.
17. **Movimentações (v15).** `GET /movements` com `type`, `reason`, `userId` e `from`, em ordem do mais recente. Levantado em 10/10.
18. **Preferência de aviso (v16).** `GET` e `PUT /users/me/notification-preferences`. Não há tabela no banco para isso. Levantado em 10/10.
19. **Lotes por data (v17).** `GET /lots?expiresFrom=&expiresTo=` para o calendário de vencimentos. Levantado em 10/10.
20. **Corpo do produto (v18).** O `POST /products` estava sem corpo definido. E `409 BARCODE_TAKEN` para código de barras repetido. Levantado em 10/10.
21. **Envio do catálogo (v19).** O arquivo sobe pelo servidor do Next, com teto de 4 MB. Catálogo maior pede envio direto do navegador para a API (cookie entre domínios) ou outro caminho. Levantado em 10/10.

---

## Histórico

| Versão | Data | O que mudou | Acordado com |
| --- | --- | --- | --- |
| v1 | 16/09/2026 | Rascunho inicial proposto pelo frontend | pendente |
| v2 | 16/09/2026 | Convenções gerais fechadas. Status `unknown` adicionado. Endpoints de importação, fila de validades e integrações. Campos `source` e `externalId` no produto | convenções fechadas, importação pendente |
| v3 | 16/09/2026 | `Company.soonThresholdDays` e `Product.active` adicionados. `GET /products/pending-expiry` removido, a fila passa a usar a listagem filtrada | **acordado com o Pedro** |
| v4 | 16/09/2026 | Sessão passa a viver em cookie httpOnly. `POST /auth/login` não devolve mais o token no corpo, e o header `Authorization` deixa de existir | **decidido, a avisar o Pedro** |
| v5 | 17/09/2026 | Integração com o sistema da farmácia sai do escopo do piloto. Os endpoints de `/integrations` ficam registrados como projeto futuro, para não construir agora | **decidido na reunião** |
| v6 | 07/10/2026 | Perfis passam a ser `clerk`, `pharmacist` e `admin`. `User` troca `email` por `login` e ganha `active`. Login por usuário. `POST /users` substitui o convite, `DELETE /users/:id` sai. Descarte restrito a Farmacêutico e Administrador | **derivado do banco do Pedro e do Antônio, falta aceite do formato** |
| v7 | 08/10/2026 | Lote que vence hoje passa a ser `expired`, como no banco (decisão 10). Divergência de faixas e cores com a `vw_alerta_validade` registrada no ponto aberto 8 | **decidido pelo Marcus, alinhado à migration do banco** |
| v8 | 08/10/2026 | `Movement.unit`. Convenção de exibição: validade lida em UTC, instante mostrado no fuso da conta | **proposto pelo frontend; enviado ao Pedro em 09/10 (página do pedido, versão 5), falta aceite** |
| v9 | 08/10/2026 | `GET /dashboard`: `expiringSoon` só A vencer, cinco, com `unit`; `expiryByWeek` começa amanhã; `byFolder` e `recentMovements` sem uso na Home | **proposto pelo frontend; enviado ao Pedro em 09/10 (página do pedido, versão 5), falta aceite** |
| v10 | 08/10/2026 | `GET /products`: `status` com vários valores, `supplier`, `brand`, e `source` documentado (o front já mandava). `GET /products/facets` novo | **proposto pelo frontend; enviado ao Pedro em 09/10 (página do pedido, versão 5), falta aceite** |
| v11 | 10/10/2026 | Entrada de lote grava ENTRADA no histórico e recusa código repetido (`409 LOT_CODE_TAKEN`). `POST /movements/out/batch` para descarte em lote, tudo ou nada | **decidido pelo Marcus; enviado ao Pedro em 10/10 (página do pedido, versão 6), falta aceite** |
| v12 | 10/10/2026 | `GET /reports/losses` para a tela Perdas | **proposto pelo frontend; enviado ao Pedro em 10/10 (página do pedido, versão 6), falta aceite** |
| v13 | 10/10/2026 | `GET /products?belowMin=true` para a página Avisos | **proposto pelo frontend; enviado ao Pedro em 10/10 (página do pedido, versão 6), falta aceite** |
| v14 | 10/10/2026 | Usuários: `409 LOGIN_TAKEN`, `403` para mudar o próprio cargo ou se bloquear, `password` no `PATCH` (ponto 10) | **proposto pelo frontend; enviado ao Pedro em 10/10 (página do pedido, versão 6), falta aceite** |
| v15 | 10/10/2026 | `GET /movements` ganha `type`, `reason`, `userId` e `from` para a tela Movimentações | **proposto pelo frontend; enviado ao Pedro em 10/10 (página do pedido, versão 6), falta aceite** |
| v16 | 10/10/2026 | `GET` e `PUT /users/me/notification-preferences` para a aba Notificações | **proposto pelo frontend; enviado ao Pedro em 10/10 (página do pedido, versão 6), falta aceite e lugar no banco (Antônio)** |
| v17 | 10/10/2026 | `GET /lots?expiresFrom=&expiresTo=` para o calendário de vencimentos | **proposto pelo frontend; enviado ao Pedro em 10/10 (página do pedido, versão 6), falta aceite** |
| v18 | 10/10/2026 | Corpo de `POST /products` (com `lots`) e de `PATCH /products/:id`; `409 BARCODE_TAKEN` | **proposto pelo frontend; falta levar ao Pedro** |
| v19 | 10/10/2026 | `POST /imports` em multipart (`source`, `file`), limite de 4 MB pelo caminho do envio, `422 FILE_NOT_ACCEPTED` | **proposto pelo frontend; falta levar ao Pedro** |
| v20 | 10/10/2026 | Pastas: `409 FOLDER_NAME_TAKEN`, `409 FOLDER_NOT_EMPTY`, `404 FOLDER_NOT_FOUND`, nome até 60 letras | **proposto pelo frontend; falta levar ao Pedro** |
| v21 | 10/10/2026 | `PATCH /users/me` (próprio nome), `422 WRONG_PASSWORD` em `POST /auth/password`, corpo do `PATCH /companies/current` | **proposto pelo frontend; falta levar ao Pedro** |
| v22 | 11/10/2026 | `cityRegistration` e `website` no `PATCH /companies/current` (os campos já estavam no tipo `Company`); `soonThresholdDays` aceita 7 | **proposto pelo frontend; falta levar ao Pedro** |
| v23 | 12/10/2026 | `GET /dashboard`: `valueAtRiskLastWeek` (valor em risco de sete dias atrás, ou `null`); `byFolder` volta a ser usado e conta produtos | **proposto pelo frontend; falta levar ao Pedro** |
| v24 | 12/10/2026 | `GET /products`: sem validade no fim também em `expiry_desc`; `folderId=none` para os sem pasta; `perPage` até 100 | **proposto pelo frontend; falta levar ao Pedro** |
| v25 | 12/10/2026 | `PATCH /products/folder` para mover vários produtos de pasta | **proposto pelo frontend; falta levar ao Pedro** |
| v26 | 12/10/2026 | Notas, alterações do cadastro e foto do produto (`photoUrl`); 403 do Balconista ao editar produto | **proposto pelo frontend; falta levar ao Pedro** |
| v28 | 13/10/2026 | `GET /movements`: `to`, `type=adjust`, `meta.countsByType`; `Movement` com `adjust`, `corrects` e `correctedAt`; `POST /movements/:id/adjust` (correção por AJUSTE) | **proposto pelo frontend; falta levar ao Pedro** |
| v29 | 13/10/2026 | Importação: várias planilhas, envio em partes de 1 MB até 20 MB, `read`, `columns`, desmarcar linha, filtro da prévia, rascunhos por `status`, `cancel`; status `uploading` e `canceled` | **proposto pelo frontend; falta levar ao Pedro** |
| v30 | 13/10/2026 | Pastas: `active` (`PATCH /folders/:id { active }`, `422 FOLDER_INACTIVE` sugerido), `DELETE /folders/:id?moveTo=` com `422 FOLDER_TARGET_INVALID` | **proposto pelo frontend; falta levar ao Pedro** |
| v27 | 13/10/2026 | `POST /products/:id/lots` aceita `supplier` e `invoiceNumber`; `DELETE /products/:id/lots/:lotId` (`LOT_NOT_REMOVABLE`); `POST /movements/:id/reverse` (`MOVEMENT_NOT_REVERSIBLE`); `sku` único (`409 SKU_TAKEN`) | **proposto pelo frontend; falta levar ao Pedro** |
