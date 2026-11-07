# Para o Pedro: o que mudou depois da página de 10/10

**De:** Marcus (frontend) · **Para:** Pedro (backend) · **Escrito em:** 10/10/2026
**Situação:** anotado, ainda não enviado. A página do pedido (https://claude.ai/artifact/9YLKBoyBfCQHFF31zxGnaN) está na versão 6, com o contrato até a v17. Este documento é o que vem depois: as versões v18 a v30 e o que o front passou a chamar de verdade. Quando for enviado, atualizar também a página e `pedido-backend-b24-b27-b28-b30.md`, juntos.

A fonte da verdade continua sendo `docs/01-references/api-contract.md`.

---

## 1. O que mudou no front

Em 10/10 todos os formulários da área logada passaram a gravar (issues 053 a 060). Cada tela chama a sua rota do contrato por uma função do servidor do Next, que repassa o cookie da sessão. Sem a API, o front responde como o seu servidor responderia, mas não guarda nada.

Para ligar uma parte à sua API, bastam duas variáveis de ambiente no front, sem mexer em tela:

```
NEXT_PUBLIC_API_URL=https://sua-api/api/v1
NEXT_PUBLIC_API_LIVE=auth,folders        # as áreas prontas, separadas por vírgula, ou "all"
```

Uma área por vez: dá para ligar o login antes de produtos, por exemplo.

## 2. O que cada área chama

| Área | Rotas que o front chama | Telas |
| --- | --- | --- |
| `auth` | `GET /auth/me`, `GET /users`, `POST /users`, `PATCH /users/:id`, `PATCH /users/me` (v21), `POST /auth/password`, `PATCH /companies/current` | sessão, Usuários, Meu perfil, Empresa |
| `products` | `GET /products` (com `status`, `supplier`, `brand`, `belowMin`, `sort`), `GET /products/:id`, `GET /products/facets`, `POST /products`, `PATCH /products/:id`, `POST /products/:id/lots`, `GET /lots?expiresFrom=&expiresTo=` | Estoque, produto, cadastro e edição, entrada, fila de validades, calendário, avisos |
| `folders` | `GET`, `POST`, `PATCH`, `DELETE /folders` | Pastas, filtros |
| `movements` | `GET /movements` (com filtros da v15), `POST /movements/out`, `POST /movements/out/batch` | saída, Retirar vencidos, Movimentações, histórico |
| `dashboard` | `GET /dashboard` | Início |
| `reports` | `GET /reports/losses?period=` | Perdas |
| `imports` | `POST /imports` (arquivo), `PATCH /imports/:id/mapping`, `GET /imports/:id/preview`, `POST /imports/:id/confirm`, `GET /imports/:id`, `GET /imports` | Importar |
| `notifications` | `GET /notifications`, `PATCH /notifications/:id/read`, `GET` e `PUT /users/me/notification-preferences` | sino, Avisos, Notificações |

## 3. O que é novo desde a página de 10/10 (v18 a v30)

Tudo proposto pelo front, esperando o seu aceite.

### v18: corpo do cadastro e da edição de produto

O contrato dizia só "corpo do produto mais lotes iniciais". Fica assim:

```json
{
  "name": "Dipirona Sódica 500mg", "sku": null, "barcode": "7896004700014",
  "folderId": "f2", "brand": "Neo Química", "supplier": null, "unit": "un",
  "minStock": 0, "maxStock": null,
  "acquisitionCost": 742, "operationalCost": 0, "salePrice": 1290,
  "lots": [{ "code": "L2291", "manufacturedAt": null, "expiresAt": "2027-05-31T00:00:00Z", "quantity": 30 }]
}
```

- `lots` só no `POST /products`, e pode vir vazio: o produto nasce `unknown`. Cada lote entra como no `POST /products/:id/lots` (grava ENTRADA)
- `PATCH /products/:id` manda os mesmos campos, sem `lots`
- Texto opcional em branco chega como `null`; `sku` também, já que o banco não tem SKU
- **Código de barras repetido:** `409` com `BARCODE_TAKEN`, e a `message` dizendo de qual produto é (o `ean` é único no banco). A tela mostra no campo
- Vender abaixo do custo é permitido; o aviso é só da tela

### v19: envio da planilha de importação

- `POST /imports` em `multipart/form-data`, com `source` igual a `file` e o arquivo no campo `file`
- O arquivo passa pelo servidor do Next antes de chegar à sua API, e a Vercel aceita até 4,5 MB por requisição: **a tela recusa acima de 4 MB**. Isso cabe dezenas de milhares de linhas em CSV
- Arquivo que não é CSV nem XLSX, vazio ou ilegível: `422` com `FILE_NOT_ACCEPTED` e a `message` dizendo o que fazer
- O mapeamento vai como `{ mapping: { "<coluna do arquivo>": "<campo do Valide>" } }`, coluna sem campo com `""`. A tela já confere que `name` está em alguma coluna e que nenhum campo está em duas
- Enquanto `GET /imports/:id` disser `running` ou `pending`, a tela consulta de novo a cada 3 segundos

### v20: erros das pastas

- `name` de 1 a 60 letras, sem espaços sobrando, único na conta sem diferenciar maiúscula: repetido devolve `409` com `FOLDER_NAME_TAKEN`
- `DELETE /folders/:id` de pasta com produto: `409` com `FOLDER_NOT_EMPTY`
- Pasta que não existe ou é de outra conta: `404` com `FOLDER_NOT_FOUND`

### v21: o próprio nome, a senha e a empresa

- **`PATCH /users/me` com `{ name }`:** o próprio nome, para qualquer cargo, sem o front mandar id. Hoje o `PATCH /users/:id` é de quem administra
- **`POST /auth/password` com `{ currentPassword, newPassword }`** (era a pergunta 7 da página): senha atual errada devolve `422` com `WRONG_PASSWORD`; deu certo, `204`
- **`PATCH /companies/current`** recebe `{ cnpj, tradeName, legalName, stateRegistration, taxRegime, address: { zipCode, street, number, district, city }, phone, email, soonThresholdDays, timezone }`. Só `admin`. O `address` vem sem complemento e estado (não estão na tela): junte com o que já existe. Mudar `soonThresholdDays` muda o `status` de todos os lotes

### v22: inscrição municipal, site e janela de 7 dias (11/10)

- **`PATCH /companies/current`** passa a mandar também `cityRegistration` e `website` (já estavam no tipo `Company`). Os dois são opcionais e chegam `null` em branco; o site chega completo, com `https://`
- **`soonThresholdDays`** pode ser 7, além de 15, 30, 45, 60 e 90
- O CEP preenche o endereço pela ViaCEP, direto do navegador: não precisa de nada da sua API

### v23: variação semanal e rosca por pasta no Início (12/10)

- **`GET /dashboard`** ganha `valueAtRiskLastWeek`: o valor em risco de sete dias atrás, em centavos, ou `null` se a conta tem menos de uma semana. O Início mostra "+12% desde a semana passada" no cartão principal. Guardar o número uma vez por dia resolve
- **`byFolder`** volta a ser usado (rosca "Em risco por pasta" e tela Pastas): `atRiskCount` conta produtos vencidos ou a vencer em cada pasta, não lotes

### v24: ordem, "Sem pasta" e linhas por página no Estoque (12/10)

- **`GET /products?sort=expiry_desc`**: produto sem validade vai para o fim, como já é em `expiry_asc` (decisão do Marcus: a ordem é pela data, e ele não tem)
- **`folderId=none`**: só os produtos sem pasta, para o filtro "Sem pasta" e a linha dele na tela Pastas
- **`perPage`** de 25, 50 ou 100 ("Linhas por página"); pode recusar acima de 100

### v25: mover vários produtos de pasta (12/10)

- **`PATCH /products/folder`** com `{ productIds, folderId }` (`folderId: null` deixa sem pasta), tudo ou nada, até 500 por pedido. Erros: `TOO_MANY_PRODUCTS`, `NOTHING_SELECTED`, `FOLDER_NOT_FOUND`, `PRODUCT_NOT_FOUND`. Devolve `{ moved, folderName }`. "Todos os N" do Estoque chega como lista de ids, não como filtro

### v26: notas, foto e alterações do produto; quem edita (12/10)

- **Notas:** `GET` e `POST /products/:id/notes` (`{ text }`, até 500 letras), qualquer cargo
- **Foto:** `Product.photoUrl`, `POST /products/:id/photo` (multipart, campo `foto`, JPG, PNG ou WebP até 2 MB) e `DELETE`
- **Alterações do cadastro:** `GET /products/:id/changes`, uma linha por campo mudado em cada edição, com quem, quando, antes e depois
- **Quem edita:** Administrador e Farmacêutico (decisão do Marcus). Editar, mover de pasta e mexer na foto devolvem 403 para o Balconista

### v27: entrada com origem, desfazer e código interno único (13/10)

- **Origem da entrada:** `POST /products/:id/lots` aceita `supplier` e `invoiceNumber`, opcionais; vão para a ENTRADA do histórico
- **Desfazer na fila:** `DELETE /products/:id/lots/:lotId`, só para lote sem outra movimentação além da ENTRADA (`409 LOT_NOT_REMOVABLE`)
- **Desfazer a saída:** `POST /movements/:id/reverse` grava um estorno (o histórico não se apaga), uma vez e logo depois (`409 MOVEMENT_NOT_REVERSIBLE`)
- **Código interno único:** `sku` repetido na conta devolve `409 SKU_TAKEN`, dizendo de qual produto é. O banco ainda não tem SKU (ponto 2)

### v28: Movimentações com contagem, datas livres e correção por ajuste (13/10)

- **`GET /movements`:** `to` (último dia), `type=adjust` e `meta.countsByType` (`{ in, out, adjust }`, sem contar o próprio tipo nem o motivo)
- **Correção:** `POST /movements/:id/adjust` com `{ quantity, note }` grava um AJUSTE (o tipo que já existe no banco) com a diferença. Uma vez por movimentação, justificativa obrigatória, Farmacêutico e Administrador. A original volta com `correctedAt`, o ajuste com `corrects`. Erros: `FORBIDDEN`, `MOVEMENT_NOT_CORRECTABLE`, `MOVEMENT_ALREADY_CORRECTED`, `LOT_QUANTITY_EXCEEDED`, `LOT_NOT_FOUND`
- **Planilha:** usa o mesmo `GET /movements`, de 100 em 100, até 5.000 linhas. Um endpoint de exportação só se ficar pesado

### v29: importação com várias planilhas, envio em partes, rascunho e cancelar (13/10)

- **Envio em partes:** `POST /imports` com `{ source: "file", files: [{ name, size }] }` abre a importação; cada arquivo sobe por `POST /imports/:id/parts` em partes de 1 MB (`fileIndex`, `partIndex`, `part`), devolvendo `{ received }`; `POST /imports/:id/read` lê tudo. Até 5 planilhas e 20 MB. Resolve o ponto 21 (acima de 4 MB) sem cookie entre domínios. Substitui o `POST /imports` em multipart da v19
- **Mesmas colunas:** várias planilhas numa importação precisam ter as mesmas colunas (`422 COLUMNS_DIFFER`). Produto repetido entre elas depende da regra do item 26, que a equipe ainda vai decidir
- **Colunas com exemplo:** `GET /imports/:id/columns` (`{ name, samples }[]`), que faltava no contrato
- **Desmarcar linha:** `PATCH /imports/:id/rows` com `{ rowNumber, excluded }`; a prévia filtra por `issue=error|warning|excluded`; o `confirm` grava só as marcadas
- **Rascunho e cancelar:** `GET /imports?status=uploading,mapping,previewing` para as paradas; `POST /imports/:id/cancel` descarta antes de confirmar e desfaz durante a importação (`409 IMPORT_FINISHED` depois). Status novos: `uploading` e `canceled`

### v30: pasta ativa e excluir pasta levando os produtos (13/10)

- **Ativa e desativada:** `Folder.active`, mudado por `PATCH /folders/:id` com `{ active }`, só Administrador. Precisa de uma coluna na tabela de pastas (Antônio). Desativar não mexe nos produtos: continuam na pasta e aparecem em todo lugar. O front só tira a pasta das escolhas. Sugestão de proteção: `422 FOLDER_INACTIVE` ao cadastrar ou mover produto para pasta desativada (editar um produto que já está nela continua valendo)
- **Excluir com destino:** `DELETE /folders/:id?moveTo=<id>` move os produtos e exclui, numa transação só; `?moveTo=none` os deixa sem pasta. Sem `moveTo`, continua o `409 FOLDER_NOT_EMPTY` da v20. Destino inválido: `422 FOLDER_TARGET_INVALID`
- **Excluir várias:** um `DELETE` por pasta vazia; busca, ordem e páginas da lista ficam no front (`GET /folders` devolve todas)

### Também ficou registrado

- **Usuários (v14, já na página):** a edição manda só o que pode mudar. O próprio cargo nunca vai, e `password` só se foi digitada. Bloquear e liberar mandam só `active`
- **"Marcar todos como lidos":** hoje é um `PATCH /notifications/:id/read` por aviso. Um `POST /notifications/read-all` (sugestão da v13) faria de uma vez

## 4. Pontos abertos novos

- **20. Corpo do produto (v18).** Aceita o formato acima e o `BARCODE_TAKEN`?
- **21. Catálogo acima de 4 MB.** Se precisar, o caminho é o navegador enviar direto para a sua API, o que depende do cookie de sessão valer entre os dois domínios (o mesmo ponto do deploy, abaixo), ou outro caminho que você preferir

## 5. Continuam sem resposta (da página de 10/10)

1. Em que fuso o banco decide o "hoje" da `vw_alerta_validade` (proposta: `Company.timezone`)
2. O banco não tem empresa, custo e preço, pastas, importação e notificações: o que entra e o que sai do piloto (com o Antônio)
3. Faixas de validade: a API devolve `expired`, `soon`, `ok`, `unknown`?
4. Motivos de saída: onde ficam Roubo e Consumo interno
5. A API traduz os nomes do banco (português) para o contrato (inglês)?
6. O que cada cargo pode (proposta do front, pelo menor privilégio), e quem vê a tela Perdas
7. Troca de senha: agora detalhada na v21
8. Perdas pelo custo do dia da saída: a saída precisa guardar o custo
9. Lugar no banco para a preferência de aviso (com o Antônio)

E da importação: a regra de duplicata (`externalId`, depois código de barras, depois SKU?) e o limite de linhas.

## 6. Para combinar antes do deploy

O cookie `valide_session` precisa valer entre o domínio do front (hoje valide-eight.vercel.app) e o da API: ou os dois no mesmo site, ou `SameSite=None; Secure` com CORS liberando credenciais. É o que destrava ligar `auth`, e com ela as telas Entrar e Cadastro da empresa, que ainda são só tela.

## 7. A ordem que mais ajuda o front

1. `auth` (B24): sem ela a área logada não existe de verdade
2. `folders` (B28): pequeno, e o filtro por pasta passa a ser real
3. `products` (B27 e B30), depois `movements` e `dashboard`
4. `imports`, `reports` e `notifications`

Uma URL de teste, mesmo instável, vale mais do que esperar tudo pronto.
