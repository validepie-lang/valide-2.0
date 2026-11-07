# O que ficou de fora

**Para quem:** o Marcus, para decidir item por item se entra ou não.
**Criado em:** 10/10/2026, a pedido dele ("deixe uma aba separada do que ficou de fora, que depois eu vou analisar").
**Como manter:** toda issue nova que deixar algo de fora acrescenta a linha aqui, na tela certa. Quando o Marcus decidir, preencher a coluna "Decisão" com **entra**, **não entra** ou **depois**, e a data.

Legenda de "Por quê":
- **Regra**: proibido pelo `CLAUDE.md` ou pelo `design-system.md`. Entrar exige mudar a regra antes
- **Dado**: o contrato ou o banco não têm o dado. Entrar exige o Pedro (e talvez o Antônio)
- **Lógica**: depende da fase de lógica funcional (agora o foco é visual)
- **Escolha**: decisão de produto minha, com o motivo ao lado. É o tipo que mais vale revisar

---

## Decisão de 11/10/2026 e fila de produção

O Marcus olhou o protótipo de cada item (branch `prototipo/ficou-de-fora`, só localhost, com a marca "Fora · nº") e decidiu: **80 entram, 12 não entram, nenhum fica para depois**. Não entram: 2, 5, 33, 42, 70, 73, 86, 87, 88, 92, 117 e 118.

O código do protótipo é maquete. Cada issue abaixo implementa de verdade (estados, teclado, tokens, celular, contrato), com pesquisa no Behance quando a tela é nova, e para no fim para o Marcus dizer "pode seguir".

- **Item "Dado"**: a tela entra com dado simulado tipado; o que falta no servidor vai para o contrato (v23 em diante) e para o `para-o-pedro.md`. Nada é enviado ao Pedro sem o Marcus mandar
- **Item "Regra"**: a issue muda a regra no `design-system.md` ou no `CLAUDE.md` antes do código, e diz como (ex.: 79 corrige com uma movimentação nova, o histórico continua imutável; 99 e 106 valem só no modo simulado)

| Issue | Tela | Itens | Depende de |
| --- | --- | --- | --- |
| 066 | Menu, atalhos e botão principal | 80, 61, 97, 89, 32 | Só front. **Feita (11/10)** |
| 067 | Início | 1, 3, 4 | 1: semana anterior no `GET /dashboard` (Pedro, contrato v23). 3: a foto. Regras 14.5 e 14.9. **Feita (12/10)** |
| 068 | Estoque: tabela | 7, 10, 11, 69 | 11 e 69: contrato v24. Regra da tabela no celular (`CLAUDE.md`). **Feita (12/10)** |
| 069 | Estoque: seleção e ações em massa | 8, 46, 68 | 68: troca de pasta em lote (Pedro, contrato v25). **Feita (12/10)**: mover de pasta e retirar vencidos; saída em massa não (Marcus, 12/10) |
| 070 | Detalhe do produto | 12, 13, 14, 15, 18 | 12, 13, 15 e 18: Pedro (contrato v26). **Feita (12/10)** |
| 071 | Modo simulado que guarda | 99, 103 | Só front. **Feita (12/10)**: registro das últimas ações num cookie |
| 072 | Entrada, saída e validades pendentes | 22, 24, 98, 100, 101, 102, 104, 105 | 22, 98, 102 e 105: Pedro (contrato v27). 24: regra 14.9. **Feita (13/10)**: placar na cor da marca |
| 073 | Movimentações | 75, 76, 77, 79 | 75, 76 e 79: Pedro (contrato v28). 79: regra em `business-rules.md` 3.5. **Feita (13/10)**: correção por AJUSTE, Farmacêutico e Administrador |
| 074 | Entrada geral | 81, 83, 84, 94 | Só front (94 traz uma biblioteca de leitura, carregada só ao abrir a câmera). **Feita (13/10)**: ZXing de 124 KB compactado, só ao abrir a câmera |
| 075 | Importar | 25, 26, 35, 37, 38, 106, 107, 108, 109 | 26: decisão da equipe. 25 e 107-109: Pedro (contrato v29). **Feita (13/10)** sem o 26, que ficou pendente (Marcus, 13/10) |
| 076 | Pastas | 64, 65, 66, 110 | 65 e 110: Pedro (contrato v30). **Feita (13/10)** |
| 077 | Pessoas | 71, 72, 111 | Pedro (71 usa o mesmo envio de imagem da 28) |
| 078 | Entrar | 29, 44, 45 | 29: Pedro (junto da B24). 45: regra 14.9 |
| 079 | Configurações | 28, 40, 41, 113, 115, 116 | 28, 113 e 115: Pedro. 116 muda o modelo: Pedro e Antônio |
| 080 | Notificações | 57, 90, 91, 93 | Pedro e Antônio (onde guardar a preferência) |
| 081 | Calendário | 95, 96 | Só front |
| 082 | Perdas | 50, 51, 53, 54, 55 | 53, 55 e o fornecedor da 51: Pedro. 54: regra 1 |
| 083 | Avisos | 56, 60, 114 | 114 (voltar a não lido): Pedro |
| 084 | Ajuda e página 404 | 85, 62 | 85: o canal de suporte. 62: regra 14.9 |
| — | Teste dos dois segundos | 6 | Preparo o roteiro e as capturas; o Marcus aplica com três pessoas |

**Falta decidir antes da issue que usa:**
- ~~11 (068)~~: decidido em 12/10, no fim nas duas ordens
- ~~18 (070)~~: decidido em 12/10, Administrador e Farmacêutico editam
- 55 (082): quais cargos veem Perdas. Recomendo administrador e farmacêutico; o balconista não
- 26 (075): limite de linhas, duplicata e reimportação (pauta 2.1 a 2.3). É da equipe
- 3 e 45 (067 e 078): de onde vêm as fotos (da farmácia parceira ou de banco gratuito)
- 85 (084): qual e-mail, telefone ou WhatsApp de suporte

---

## Home (issues 017 e 027)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 1 | Variação "+2% desde a semana passada" nos indicadores | Gyle, Pharmly, Vault (Behance) | Dado | O contrato não tem série histórica do valor em risco nem das contagens. Precisaria de `GET /dashboard` devolver a semana anterior | entra (Marcus, 11/10); feito na 067 |
| 2 | Ícone em quadrado colorido em cada cartão | Pharmly, Gyle | Regra | `design-system.md` 14.9 | não entra (Marcus, 11/10) |
| 3 | Foto promocional no painel | Pharmly | Regra | Não informa nada e é sinal de interface gerada (14.9) | entra (Marcus, 11/10); feito na 067 |
| 4 | Gráfico de rosca (distribuição por categoria) | Gyle | Regra | 14.5: distribuição é barra horizontal. O dado existe (`byFolder`), então dá para ter como barras | entra (Marcus, 11/10); feito na 067 |
| 5 | Saudação "Bom dia" | Gyle | Regra | 14.9 proíbe frase de boas-vindas | não entra (Marcus, 11/10) |
| 6 | Teste dos dois segundos com três pessoas | Critério da SPEC de hierarquia | Escolha | Precisa de gente de fora olhando a Home. Só o Marcus pode fazer, com a equipe ou a farmácia | entra (Marcus, 11/10) |

## Estoque (issues 018 e 029)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 7 | Escolher quantas linhas por página | SaaS Data Table | Escolha | Fixo em 25. O balconista não ganha com escolher | entra (Marcus, 11/10); feito na 068 |
| 8 | Caixa de seleção por linha e ações em massa | SaaS Data Table, Data table for inventory | Escolha | O Valide não tem ação em massa. Se entrar, o primeiro uso seria "retirar vencidos em lote" | entra (Marcus, 11/10); feito na 069 |
| 9 | Ordenar pelo cabeçalho no celular | | Escolha | No celular a lista segue "o que vence primeiro". Poderia ir em "Mais filtros" | feito na 050 (Marcus, 10/10) |
| 10 | Tabela com rolagem lateral no celular | Complex data tables on mobile | Regra | `CLAUDE.md`: no celular a tabela vira lista | entra (Marcus, 11/10); feito na 068 |
| 11 | Onde vai o Sem validade na ordem "vence por último" | | Dado | Hoje o mock põe os Sem validade no topo. O contrato não define | entra (Marcus, 11/10); feito na 068: no fim nas duas ordens (Marcus, 12/10) |

## Detalhe do produto (issues 019 e 030)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 12 | Aba "Notas" do produto | Inventar | Dado | Não existe observação de produto no contrato nem no banco | entra (Marcus, 11/10); feito na 070 |
| 13 | Foto do produto | Inventar, Ecommerce Product Details | Dado | O cadastro não tem imagem. Precisaria de upload e armazenamento | entra (Marcus, 11/10); feito na 070 |
| 14 | Aviso de pouco estoque por lote | Inventar ("low" por depósito) | Escolha | O mínimo é do produto; o aviso "abaixo do mínimo" fica no total | entra (Marcus, 11/10); feito na 070 |
| 15 | Histórico de edições do cadastro ("mudou o nome para…") | Inventar | Dado | O histórico do Valide é só de movimentação. Precisaria de log de alteração no backend | entra (Marcus, 11/10); feito na 070 |

## Editar produto (issue 026)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 16 | Gravar as alterações | | Lógica | `PATCH /products/:id` já está no contrato || feito na 055 (fase de lógica, 10/10) |
| 17 | Aviso ao sair com alterações não salvas | Primer (GitHub), Saving | Lógica | Precisa saber se o formulário mudou | feito na 046 (Marcus, 10/10) |
| 18 | Quem pode editar | | Dado | Pergunta 6 ao Pedro (permissões por cargo). Hoje o botão aparece para todos | entra (Marcus, 11/10); feito na 070: Administrador e Farmacêutico editam (Marcus, 12/10) |

## Registrar entrada (issue 028)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 19 | Gravar a entrada | | Lógica | `POST /products/:id/lots`, que grava ENTRADA no histórico (decidido em 10/10) || feito na 054 (fase de lógica, 10/10) |
| 20 | Ler o código de barras com a câmera | Inventar, Mobile App For Inventory | Escolha | A entrada geral existe desde a 042 e aceita o leitor do caixa, que funciona como teclado. A câmera do celular é comportamento (fase de lógica) | feito na 049 (Marcus, 10/10); iPhone no item 94 |
| 21 | Botões − e + na quantidade | Inventar | Escolha | A saída usa campo numérico; as duas telas ficaram iguais | feito na 047 (Marcus, 10/10) |
| 22 | Fornecedor e nota fiscal na entrada | Inventar (pedido de compra) | Dado | `POST /products/:id/lots` não recebe esses campos | entra (Marcus, 11/10); feito na 072 |
| 23 | Entrada geral, sem abrir um produto antes (buscar ou ler o código e registrar) | Inventar ("Search Product With Scan") | Escolha | `/estoque/entrada`, aberta por "Registrar entrada" em Movimentações | feito na 042 (10/10) |

## Validades pendentes (issues 020 e 031)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 24 | Placar, troféu, "Muito bem!" e cor por acerto | Quizai | Regra | Verde e vermelho são de validade; o tom do Valide é sóbrio | entra (Marcus, 11/10); feito na 072 |

## Importar (issues 013 e 021)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 25 | Filtrar e desmarcar linhas na revisão | `screen-map.md` | Dado | Desmarcar precisa de campo novo no contrato. Ponto para o Pedro | entra (Marcus, 11/10); feito na 075 |
| 26 | Limite de linhas, regra de duplicata, reimportação | Pauta 2.1 a 2.3 | Dado | Decisões pendentes no `CLAUDE.md` | entra (Marcus, 11/10); **pendente** (Marcus, 13/10: fica para a equipe decidir; a 075 seguiu sem ele) |
| 35 | Barra de progresso do envio, por arquivo | File Upload UI, Upload Files Design (Behance) | Lógica | Só faz sentido com o envio de verdade. Hoje "Escolher arquivo" vai direto ao Mapear | entra (Marcus, 11/10); feito na 075 |
| 36 | Tamanho máximo do arquivo escrito sob a área de arrastar | Upload Files Design ("max size of 15 MB") | Dado | Depende do limite de linhas (item 26, pauta 2.3) | feito na 056 ("CSV ou Excel (XLSX), até 4 MB") |
| 37 | Enviar vários arquivos de uma vez | File Upload UI | Escolha | Uma importação é um arquivo; juntar dois catálogos pede regra de duplicata (item 26) | entra (Marcus, 11/10); feito na 075 |
| 38 | "Salvar rascunho" no meio do assistente | Inventar ("Save as Draft") | Escolha | A importação não grava nada até o fim; sair e voltar recomeça do arquivo | entra (Marcus, 11/10); feito na 075 |
| 27 | Campo de seleção do passo Mapear com largura toda em 360 | Validação da 013 | Escolha | **Resolvido na 032 (10/10)**, junto com a reestruturação do passo | feito |

## Configurações e login (issues 014, 015, 022 e 023)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 28 | Enviar foto de perfil e logotipo da farmácia | Telas antigas | Dado | Os botões não faziam nada e saíram na 014. Precisaria de upload | entra (Marcus, 11/10) |
| 29 | Recuperar a senha por conta própria ("Esqueci a senha") | Tela antiga | Dado | Hoje a tela orienta pedir ao administrador. Não há endpoint (ponto 10 do contrato) | entra (Marcus, 11/10) |
| 30 | Gravar os formulários de configuração | | Lógica | Seguem em mock || feito na 059 (fase de lógica, 10/10) |
| 39 | Seção "Notificações" nas configurações (escolher o que avisa e por onde) | Fintech, My Account, Pharmly (Behance) | Dado | Feita a escolha do que avisa, com dado simulado e contrato v16 proposto. "Por onde" continua no item 90 | feito na 044 (10/10) |
| 40 | Rótulo à esquerda e campo à direita nos formulários | My Account Page (Behance) | Escolha | Mantive o rótulo em cima do campo: é mais rápido de preencher (Baymard). O rótulo à esquerda ficou só nos dados de leitura | entra (Marcus, 11/10) |
| 41 | "Cancelar" ao lado de "Salvar" no cabeçalho de cada seção | My Account Page | Escolha | O salvar fica no fim do formulário, como no Fintech; sem gravação real, cancelar não tem o que desfazer | entra (Marcus, 11/10) |
| 42 | Entrar com Google ou Facebook | As quatro referências de login (Behance) | Dado | Login é do backend; não há conta Google no contrato, e o usuário do Valide é criado pelo administrador | não entra (Marcus, 11/10) |
| 43 | Botão de mostrar e esconder a senha (o olho no campo) | Login/Sign Up Template, Modern Login Page | Escolha | Ajuda quem digita no balcão. Pequeno, mas é comportamento: entra com a lógica, se você quiser | feito na 045 (Marcus, 10/10) |
| 44 | Carrossel com vários slides no painel da marca | Login/Sign Up Template (pontos embaixo) | Escolha | Um painel parado diz o essencial; carrossel tira a atenção do formulário | entra (Marcus, 11/10) |
| 45 | Foto, ilustração ou degradê no painel da marca | Sign In Page UI, Sign Up Page UI, Modern Login Page | Regra | `design-system.md` 14.9. O painel mostra as quatro situações de validade | entra (Marcus, 11/10) |

## Pastas (issue 039)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 64 | Busca, ordenação pelo cabeçalho e paginação na lista de pastas | Ventor "Category" (Behance) | Escolha | Uma farmácia tem poucas pastas; a lista inteira cabe numa tela | entra (Marcus, 11/10); feito na 076 |
| 65 | Ativar e desativar pasta ("Active" e "Deactive") | Ventor "Category" | Dado e Regra | O contrato não tem pasta inativa, e o selo verde e vermelho é de validade | entra (Marcus, 11/10); feito na 076 |
| 66 | Caixa de seleção por linha e excluir várias de uma vez | Ventor "Category" | Escolha | Excluir pasta é raro, e só a vazia pode | entra (Marcus, 11/10); feito na 076 |
| 67 | Gravar criar, renomear e excluir | | Lógica | Hoje muda só na tela, até recarregar. `POST`, `PATCH` e `DELETE /folders` já estão no contrato || feito na 057 (fase de lógica, 10/10) |
| 68 | Mover vários produtos de uma pasta para outra de uma vez | `screen-map.md` | Dado | Hoje a pasta muda no editar produto, um de cada vez. Precisaria de um endpoint de troca em lote | entra (Marcus, 11/10); feito na 069 |
| 69 | "Sem pasta" como linha da tabela e como filtro do estoque | | Dado | O filtro `pasta` não aceita "nenhuma". O cartão diz que produto sem pasta também aparece no estoque | entra (Marcus, 11/10); feito na 068 |

## Adicionar e editar pessoa (issue 040)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 70 | Convite por e-mail, em vez de senha inicial | User Page, HR Management (Behance) | Dado | O banco não guarda e-mail de usuário (contrato v6). Quem administra cria a pessoa e passa a senha | não entra (Marcus, 11/10) |
| 71 | Foto da pessoa | User Page, HR Management | Dado | Não há upload (item 28). A lista usa as iniciais | entra (Marcus, 11/10) |
| 72 | Telefone, endereço e dados pessoais da pessoa | User Page, HR Management | Dado e Escolha | O banco tem só nome, usuário, cargo e ativo. E o Valide não é sistema de RH | entra (Marcus, 11/10) |
| 73 | Obrigar a trocar a senha no primeiro acesso | | Dado | Precisaria de um campo no banco ("senha provisória"). Hoje a janela diz para passar a senha à pessoa | não entra (Marcus, 11/10) |
| 74 | Gravar adicionar, editar e bloquear | | Lógica | Muda só na tela, até recarregar. `POST /users` e `PATCH /users/:id` estão no contrato; os erros pedidos ao Pedro estão na v14 || feito na 058 (fase de lógica, 10/10) |

## Movimentações (issue 041)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 75 | Contagem nos botões de tipo ("Entradas 12", "Saídas 58") | Inventar (contagem em cada botão de situação) | Dado | Precisaria de uma contagem por tipo no `GET /movements`, como o `/products/facets` | entra (Marcus, 11/10); feito na 073 |
| 76 | Escolher datas livres no período | Sales Analytics (issue 036) | Escolha | Três períodos fixos, como em Perdas (item 50) | entra (Marcus, 11/10); feito na 073 |
| 77 | Exportar as movimentações em planilha | SaaS Data Table ("Export") | Escolha e Dado | Útil para conferir com o caixa ou o contador; não há endpoint | entra (Marcus, 11/10); feito na 073 |
| 78 | Buscar ou filtrar por produto nesta tela | | Escolha | O histórico de um produto fica na aba Histórico dele; o `productId` já existe no contrato se quiser trazer para cá | feito na 050 (Marcus, 10/10) |
| 79 | Desfazer ou corrigir uma movimentação | | Regra | O histórico do banco é imutável. Corrigir é registrar outra movimentação | entra (Marcus, 11/10); feito na 073 |
| 80 | "Movimentações" no menu lateral | | Escolha | Fica como aba do Estoque, como no Inventar; o menu já tem cinco itens (item 61) | entra (Marcus, 11/10); feito na 066 |

## Entrada geral (issue 042)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 81 | Várias entradas seguidas com a lista do que já foi conferido ao lado | Sistemas de caixa (o pedido ao lado da busca) | Lógica | Útil para receber uma caixa com vários produtos. Hoje cada entrada volta para a busca | entra (Marcus, 11/10); feito na 074 |
| 82 | Cadastrar o produto ali mesmo, com o código bipado já preenchido | | Escolha | Hoje "Cadastrar produto" leva ao cadastro inteiro, e o código precisa ser digitado de novo | feito na 049 (Marcus, 10/10) |
| 83 | Abrir sozinho quando a busca pelo nome acha um produto só | | Escolha | Só o código exato abre direto: pelo nome, um resultado único ainda pode ser o produto errado | entra (Marcus, 11/10); feito na 074 |
| 84 | Som ou vibração ao bipar | Apps de leitura de código (Behance) | Lógica | Confirma a leitura sem olhar a tela | entra (Marcus, 11/10); feito na 074 |

## Ajuda (issue 043)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 85 | "Ainda com dúvida? Fale com a gente" (chat, e-mail ou telefone de suporte) | Knowledge Base Landing Page, Pharmly ("Help & Support") | Dado | O piloto não tem canal de suporte definido. Quando tiver, entra no fim da página | entra (Marcus, 11/10) |
| 86 | Passo a passo com imagens ou vídeo | | Escolha | Respostas curtas com link para a tela; imagem envelhece a cada mudança de tela | não entra (Marcus, 11/10) |
| 87 | Ilustração no topo e ícone em cada cartão de assunto | Knowledge Base Landing Page, FAQ Section | Regra | `design-system.md` 14.9 | não entra (Marcus, 11/10) |
| 88 | Onde fica a exportação em cada sistema de farmácia, por nome do sistema | | Dado | Depende de saber quais sistemas as farmácias do piloto usam (farmácia parceira ainda não definida). Hoje a resposta dá os nomes comuns da opção | não entra (Marcus, 11/10) |
| 89 | "Ajuda" na barra de baixo do celular | | Escolha | A barra tem cinco itens; no celular a Ajuda fica no menu da conta | entra (Marcus, 11/10); feito na 066 |

## Notificações (issue 044)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 90 | Escolher por onde avisa: celular, computador, e-mail | Pharmly (push, desktop, e-mail) | Dado | O Valide só tem o sino, e o banco não guarda e-mail (contrato v6). Junta com o item 57 | entra (Marcus, 11/10) |
| 91 | Gravar as preferências | | Dado e Lógica | Contrato v16 proposto; o banco precisa de lugar para guardar (Antônio) | entra (Marcus, 11/10) |
| 92 | Horário de silêncio ("não avisar à noite") | | Escolha | Com aviso só no sino, não há o que silenciar | não entra (Marcus, 11/10) |
| 93 | Avisos da farmácia toda, escolhidos pelo administrador | | Escolha | Fica por pessoa: o balconista não precisa do aviso de importação que o dono quer | entra (Marcus, 11/10) |

## Câmera e cadastro com código (issue 049)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 94 | Ler pela câmera no iPhone (Safari) e no Firefox | | Escolha | Esses navegadores não leem código de barras sozinhos; o botão não aparece neles. Cobrir exige uma biblioteca de leitura (ex.: ZXing, uns 400 KB) | entra (Marcus, 11/10); feito na 074 |

## Calendário de vencimentos (issue 052)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 95 | Visão de semana e de dia, com os lotes dentro da grade | Kalee (agenda por hora) | Escolha | Validade não tem hora; o mês com a lista do dia ao lado basta | entra (Marcus, 11/10) |
| 96 | Filtrar o calendário por pasta ou situação | | Escolha | Com um a dois lotes por dia, o filtro tiraria pouco | entra (Marcus, 11/10) |
| 97 | Calendário no menu lateral ou na Home | | Escolha | Fica como aba do Estoque; a Home já tem o gráfico por semana | entra (Marcus, 11/10); feito na 066 |

## Validades pendentes grava (issue 053)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 98 | "Desfazer" na linha "Salvo" | | Dado | Não há endpoint para apagar lote; corrigir é pelo produto, quando a edição de lote gravar | entra (Marcus, 11/10); feito na 072 |
| 99 | Guardar no navegador o que foi salvo enquanto a API não existe | | Regra | Sem a área ligada, recarregar traz a fila de volta. Guardar no navegador mostraria como salvo o que o servidor nunca recebeu | entra (Marcus, 11/10); feito na 071: registro num cookie, só no modo de demonstração (Marcus, 12/10) |
| 100 | Data de fabricação na fila | | Escolha | A fila pede só o que o status precisa; fabricação é opcional e fica na entrada e no cadastro | entra (Marcus, 11/10); feito na 072 |

## Entrada e saída gravam (issue 054)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 101 | "Registrar outra saída" na própria tela, sem voltar ao produto | | Escolha | A saída volta ao produto, onde o resultado aparece; a entrada geral já volta à busca, que é onde se faz várias seguidas | entra (Marcus, 11/10); feito na 072 |
| 102 | "Desfazer" na faixa de confirmação | | Dado | Não há estorno no contrato; corrigir uma saída errada seria um AJUSTE, que não tem tela (ponto aberto 7) | entra (Marcus, 11/10); feito na 072 |

## Cadastrar e editar produto gravam (issue 055)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 103 | Abrir o produto recém-cadastrado, em vez de voltar à lista | | Dado | Sem a API o produto não é guardado e a página dele daria 404. Com o Pedro ligado, pode passar a abrir o produto | entra (Marcus, 11/10); feito na 071 |
| 104 | Voltar à entrada geral depois de cadastrar o produto que veio de lá (`?codigo=`) | | Escolha | O próprio cadastro já tem "Lote e validade": o lote que chegou entra ali | entra (Marcus, 11/10); feito na 072 |
| 105 | Avisar código interno (SKU) repetido | | Dado | O banco não tem SKU, nem regra de unicidade para ele | entra (Marcus, 11/10); feito na 072 |

## Importação envia, mapeia e confirma (issue 056)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 106 | Ler o arquivo no navegador para mostrar as colunas reais no modo simulado | | Regra | Ler o arquivo e reconhecer as colunas é do servidor (Thin Client, CLAUDE.md seção 3). No simulado, o Mapear mostra a importação de demonstração | entra (Marcus, 11/10); feito na 075 |
| 107 | "Baixar lista de erros" no resultado | | Dado | Saiu: levava a "#". O contrato não tem a lista de linhas recusadas | entra (Marcus, 11/10); feito na 075 |
| 108 | Cancelar uma importação em andamento | | Dado | Não há endpoint para cancelar | entra (Marcus, 11/10); feito na 075 |
| 109 | Enviar arquivo acima de 4 MB | | Dado | Pede o envio direto do navegador para a API, o que depende do cookie entre domínios (ponto do deploy) ou de outro caminho com o Pedro | entra (Marcus, 11/10); feito na 075 |

## Pastas gravam (issue 057)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 110 | Excluir pasta com produtos, levando-os para outra pasta na mesma janela | Ventor "Category" (excluir com destino) | Dado | O contrato recusa a exclusão de pasta com produto; mover junto pediria algo como `DELETE /folders/:id?moveTo=` | entra (Marcus, 11/10); feito na 076 |

## Pessoas gravam (issue 058)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 111 | Avisar a pessoa da senha inicial ou da senha nova | | Dado | O banco não guarda e-mail nem telefone; quem administra passa a senha pessoalmente, como a janela já diz | entra (Marcus, 11/10) |

## Configurações gravam (issue 059)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 112 | Buscar o endereço pelo CEP | | Escolha | Pede um serviço de CEP de fora (ViaCEP ou parecido); o endereço muda pouco e se digita uma vez | feito na 063 (ViaCEP, 11/10) |
| 113 | Sair das outras sessões ao trocar a senha | | Dado | O contrato não tem como encerrar as outras sessões da pessoa | entra (Marcus, 11/10) |

## Marcar aviso como lido grava (issue 060)

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 114 | Marcar um aviso como lido sem abrir, ou voltar a não lido | | Escolha | A referência só tem "marcar todos"; abrir já marca o aviso | entra (Marcus, 11/10) |

## Ajustes do escopo (issue 063)

Vieram da lista de escopo que o Marcus colou em 11/10.

| # | O que | De onde | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 115 | Segundo telefone da empresa | Lista de escopo | Escolha | O contrato tem um `phone` só; um segundo pediria campo novo no banco | entra (Marcus, 11/10) |
| 116 | Matriz e filiais de verdade | Lista de escopo | Dado | O cadastro só pergunta "Matriz ou Filial". Várias unidades numa conta mudam o modelo inteiro (o banco nem tem empresa); é conversa com o Pedro e o Antônio | entra (Marcus, 11/10) |
| 117 | Saída obrigatoriamente do lote que vence primeiro (FEFO rígido) | Lista de escopo | Escolha | Hoje a saída já marca esse lote e a pessoa pode trocar (o lote da mão pode ser outro). Bloquear seria regra do servidor | não entra (Marcus, 11/10) |
| 118 | Moeda e idioma configuráveis | Lista de escopo | Escolha | Piloto no Brasil: real e português fixos. Recomendo não fazer | não entra (Marcus, 11/10) |

## Técnico e de sistema

| # | O que ficou de fora | De onde veio | Por quê | Detalhe | Decisão |
| --- | --- | --- | --- | --- | --- |
| 31 | `exit-form.tsx` com 231 linhas (limite 200) | Validação da 015 | Escolha | Caiu de 248 na 028. O próximo corte é a lista de lotes virar componente | feito na 047: 150 linhas (Marcus, 10/10) |
| 32 | Sombra `shadow-xs` no botão principal | Validação da 015 | Escolha | A regra de sombra fala de card. Decidir junto com a marca | entra (Marcus, 11/10); feito na 066 |
| 33 | Fuso da conta (`Company.timezone`) nas contas de "hoje" | Issue 016 | Dado | Hoje usa `America/Sao_Paulo` fixo. Pauta 2.6 e ponto 11 do contrato | não entra (Marcus, 11/10) |
| 34 | Gravação em geral (todo formulário) | | Lógica | Foco visual primeiro, lógica depois (pedido de 09/10) || feito nas 053 a 060 (fase de lógica, 10/10) |
| 46 | "Selecionar só esta página" ou "todos os N" | Data Table UX/UI (Behance) | Escolha | A lista de vencidos cabe numa página só; vira necessário se passar de 200 lotes | entra (Marcus, 11/10); feito na 069 |
| 47 | Descartar só parte da quantidade de um lote, em lote | | Escolha | A retirada em lote tira o lote inteiro. Parte de um lote continua na baixa do produto | feito na 048 (Marcus, 10/10) |
| 48 | Imprimir a lista para retirar da prateleira | | Escolha | O balconista pode querer o papel na mão ao percorrer as gôndolas | feito na 048 (Marcus, 10/10) |
| 49 | Endpoint de descarte em lote | | Dado | Contrato v11: `POST /movements/out/batch`, tudo ou nada. Falta o aceite do Pedro | entra (Marcus, 10/10) |
| 50 | Escolher datas livres no período de Perdas | Sales Analytics ("Last Year" com calendário) | Escolha | Três períodos fixos: 30 dias, 90 dias e 12 meses | entra (Marcus, 11/10) |
| 51 | Painel de filtros de Perdas (por pasta, fornecedor, motivo) | Sales Analytics (filtros à esquerda) | Escolha | Sem o recorte, a tela responde "quanto perdi". Pasta e fornecedor ficariam para uma segunda versão | entra (Marcus, 11/10) |
| 52 | Exportar Perdas em planilha ou PDF | SaaS Data Table ("Export") | Escolha | Útil para o contador; não há endpoint | feito na 051, só planilha; PDF pela impressão do navegador (Marcus, 10/10) |
| 53 | "Consumo interno" como perda | | Escolha | Ficou fora: é custo, mas não é perda de estoque. Se entrar, muda o total | entra (Marcus, 11/10) |
| 54 | Variação "+12%" em verde ou vermelho | Sales Analytics | Regra | Verde e vermelho são de validade; a variação fica em texto neutro | entra (Marcus, 11/10) |
| 55 | Quem pode ver Perdas | | Dado | Pergunta 6 ao Pedro. Hoje aparece para todos, inclusive o balconista | entra (Marcus, 11/10) |
| 56 | Botões de ação no próprio aviso ("Revisar", "Aprovar") | HR Management Dashboard | Escolha | Os avisos do Valide não pedem aprovação; cada um tem "Abrir" | entra (Marcus, 11/10) |
| 57 | Ligar e desligar o envio de avisos ("Push Notification") | HR Management Dashboard | Dado | Não há preferência de aviso no contrato (item 39) | entra (Marcus, 11/10) |
| 58 | Filtrar avisos (todos, não lidos, por tipo) | | Escolha | Com poucos avisos por dia, a lista basta | feito na 050 (Marcus, 10/10) |
| 59 | "Marcar como lido" de verdade | | Lógica | Hoje só muda na tela. `PATCH /notifications/:id/read` existe; "todos" pede um endpoint (ponto 15) | feito na 060 (fase de lógica, 10/10); "todos" manda um por aviso até o `read-all` existir |
| 60 | Pedido de compra a partir do estoque abaixo do mínimo | Gyle ("Stock Alert" com "Order") | Escolha | O Valide não faz compra; a lista mostra quanto falta | entra (Marcus, 11/10) |
| 61 | "Avisos" no menu lateral | | Escolha | Fica no sino ("Ver todos os avisos"); o menu já tem cinco itens | entra (Marcus, 11/10); feito na 066 |
| 62 | Ilustração na página 404 | 404 Page Design Concepts, Space 404 (Behance) | Regra | `design-system.md` 14.9; o "404" grande faz o papel | entra (Marcus, 11/10) |
| 63 | Busca de produto na página 404 | | Escolha | Os atalhos levam ao Estoque, onde está a busca | não feito: nenhuma 404 bem avaliada no Behance tem busca (10/10) |

## Telas que ainda não existem

Levantamento de 09/10. Ainda vão ser feitas, cada uma com pesquisa no Behance antes; ficam aqui para o Marcus priorizar ou cortar.

| # | Tela | Para quê | Decisão |
| --- | --- | --- | --- |
| T1 | Perdas | Quanto se perdeu por vencimento, avaria e roubo, por período (argumento comercial para o dono) | feita na 036 (10/10) |
| T2 | Retirar vencidos em lote | A Home manda "retirar da prateleira", mas a baixa é produto a produto | feita na 035 (10/10) |
| T3 | Avisos e estoque abaixo do mínimo | Regra 7 do negócio; hoje os avisos só existem no sino | feita na 037 (10/10) |
| T4 | Página 404 geral | Hoje só o produto tem "não encontrado" | feita na 038 (10/10) |
| T5 | Entrada geral com leitura de código | Itens 20 e 23 | feita na 042 (10/10), com o leitor do caixa; câmera continua no item 20 |
| T6 | Pastas sem porta de entrada | A rota existia, mas nada levava a ela | feita na 039 (10/10) |
| T7 | Calendário de vencimentos | Levantamento de 10/10, item F | feita na 052 (10/10), com dado simulado e contrato v17 proposto |
