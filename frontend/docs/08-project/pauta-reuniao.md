# pauta-reuniao.md: Pontos para levar à equipe

Documento vivo. Cada reunião fecha itens, e o que ficar aberto continua aqui com a data de quando entrou.

Atualizado em 17/09/2026 por Marcus (frontend).

---

## 1. Decisões já fechadas (não precisam voltar à pauta)

| Decisão | Definição | Fechada em |
| --- | --- | --- |
| Cálculo do status de validade | Backend calcula e devolve pronto. Frontend calcula localmente só para feedback imediato no formulário | 16/09 |
| Janela de "a vencer" | 30 dias como padrão, configurável por conta | 16/09 |
| Valores monetários | Centavos, número inteiro. Nunca float | 16/09 |
| Endpoint de dashboard | Uma chamada agregada, `GET /dashboard` | 16/09 |
| Paginação | Offset simples para o MVP | 16/09 |
| Entrada de dados | Importar catálogo do sistema que a farmácia já usa. Cadastro manual vira caminho secundário | 16/09 |
| Preenchimento de validade | O cliente informa. A importação traz o catálogo, não a validade | 16/09 |

---

## 2. Perguntas abertas para o Pedro e o Antônio

### 2.0. Fechado com o Pedro em 16/09: B24, B27, B28 e B30

Documento enviado em `docs/08-project/pedido-backend-b24-b27-b28-b30.md`. As três decisões que estavam em aberto foram aceitas, e o contrato subiu para a v3:

1. **`Company.soonThresholdDays`**, inteiro, padrão 30. Aceito.
2. **`Product.active`**, booleano. Produto que sumiu da origem vira inativo. Aceito.
3. **`GET /products/pending-expiry` descartado.** A fila usa `GET /products?status=unknown&sort=value_desc`. Aceito.

Frontend já ajustado: tipos, mocks, camada de serviço e as três telas que tocam nesses campos. Nada mais trava as fases 3 e 4 do meu lado.

**Ainda falta do Pedro:** a entrega em si, na ordem combinada. B24 primeiro, depois B28, depois B27 e B30.

### 2.0.1. Avisar o Pedro: a sessão mudou depois do aceite dele

Decidido em 16/09, depois que ele já tinha respondido. **Muda a implementação do B24.**

A sessão passa a viver em **cookie httpOnly gravado pelo backend**, em vez de token no corpo do login. Token no corpo obriga o frontend a guardá-lo, e todo lugar do navegador é legível por JavaScript: um script injetado, vindo por exemplo de um nome de produto malformado numa planilha importada, levaria a sessão junto.

Nome combinado: `valide_session`, com `HttpOnly`, `Secure`, `SameSite` e prazo de validade. O frontend já está implementado assim, sem header `Authorization` em lugar nenhum.

**Ponto de infraestrutura para decidir antes do deploy, com o Pedro e quem cuidar da hospedagem:** para o cookie valer entre o domínio do frontend e o da API, ou os dois ficam no mesmo site, ou o cookie precisa de `SameSite=None; Secure` com CORS liberando credenciais. Não pode cair na semana da entrega.


Todas travam a construção da tela de importação. Sem elas, o frontend constrói no escuro e refaz depois.

**2.1. Qual campo identifica que um produto já existe?**

Na reimportação o sistema precisa decidir entre criar e atualizar. Proposta do frontend: id externo primeiro, depois código de barras, depois SKU. Precisa de confirmação, porque a tela de revisão mostra essa decisão ao usuário linha por linha.

**2.2. O que acontece com produto que sumiu da origem?**

Cliente importa de novo e um produto não vem mais. Apaga do Valide ou marca como inativo?

Recomendação do frontend: **marcar como inativo**. Esse produto pode ter lote e validade que o cliente preencheu à mão, e apagar destrói trabalho dele. Perder o trabalho do cliente é o caminho mais rápido para ele abandonar o sistema.

**2.3. Qual o limite de linhas por importação?**

Precisa de um número para o frontend avisar antes de o usuário subir um arquivo grande demais. Melhor avisar antes do que falhar no meio.

**2.4. Formato aceito no arquivo.**

Proposta: aceitar CSV e XLSX, sem modelo fixo obrigatório, e resolver o resto no passo de mapeamento de colunas. Cada sistema exporta de um jeito, então exigir um modelo único derruba metade dos clientes na porta.

---

**2.5. Produto que vence hoje: Vencido ou A vencer?** Resolvido em 08/10: **Vencido**, como na migration do banco. Ver `technical-decisions.md`, 08/10/2026.

Entrou em 17/09, ao cobrir a regra de validade com teste automatizado.

O frontend hoje trata o dia do vencimento como último dia válido: um lote que vence hoje aparece como **A vencer**, não como Vencido. Faz sentido para farmácia, mas é uma escolha, não uma consequência óbvia da regra.

O ponto é que o backend calcula o status oficial e o frontend calcula o mesmo status no formulário, para dar resposta imediata a quem digita. Se os dois discordarem, o mesmo produto aparece como A vencer na tela de cadastro e como Vencido na listagem, no mesmo dia. O usuário não tem como saber qual está certo.

Pergunta objetiva para o Pedro: **na sua conta, `daysUntil == 0` cai em qual status?** O frontend segue o que o backend definir.

**2.6. Em que fuso o banco decide que dia é hoje?** Entrou em 08/10, nos formatos de data.

A `vw_alerta_validade` compara a validade com a data de hoje. Se o servidor estiver em UTC, entre 21h e meia-noite de Brasília o banco já está no dia seguinte: um lote que vence amanhã vira Vencido três horas antes da hora, e o que vence hoje some do A vencer. O frontend tem o mesmo problema e vai corrigir do lado dele.

Pergunta objetiva para o Pedro e o Antônio: **o `CURRENT_DATE` da view usa o fuso de Brasília (`America/Sao_Paulo`) ou o do servidor?** Também: horários (`createdAt`) chegam como instante UTC de verdade? O contrato v8 pede isso.

---

## 3. Tarefa para o Gabriel e o Eduardo

**3.1. Descobrir qual sistema a farmácia parceira usa.**

Nome do sistema e do fornecedor.

**3.2. Descobrir se esse sistema exporta a lista de produtos em Excel ou CSV.**

Esta é a pergunta mais importante da lista inteira. Se a resposta for sim, o Valide tem caminho de entrada garantido e não depende de contrato com fornecedor nenhum. Se for não, a equipe precisa saber disso agora, não em novembro.

Como descobrir, em ordem de esforço:

1. Perguntar direto ao responsável da farmácia se ele consegue exportar um relatório de produtos
2. Pedir um arquivo de exemplo, mesmo com poucos itens, para o frontend testar o mapeamento de colunas com dado real
3. Procurar a documentação do sistema, se for um dos conhecidos do mercado

**3.3. Verificar se o sistema exporta lote e data de validade.**

Provavelmente não, e a razão está no diagnóstico do projeto: a farmácia controla validade em papel porque o sistema não faz isso. Se por acaso exportar, é um ganho grande, e o mapeamento de colunas já está preparado para receber esses campos.

**3.4. Só depois disso, avaliar contato com o fornecedor para API.**

A integração por API é o plano de longo prazo, não o caminho do MVP. Fechar acesso com terceiro não cabe no prazo de 14/11.

---

## 4. Pontos de risco para a equipe ter ciência

**4.1. A importação traz produto, não validade.**

Isso significa que depois de importar, o cliente ainda tem trabalho pela frente. O frontend está desenhando uma fila de preenchimento rápido para tornar esse trabalho suportável (um produto por vez, três campos, Enter avança, ordenado por maior valor parado primeiro).

A equipe precisa entender isso porque muda o discurso comercial: não é "seu estoque fica pronto sozinho", é "seu catálogo entra em minutos, e as validades você preenche uma vez".

**4.2. Depender de API de fornecedor é risco de cronograma.**

Sistemas de farmácia no Brasil raramente expõem API pública, e muitos são desktop com banco local. Por isso o frontend constrói a importação por arquivo primeiro, que funciona sem depender de ninguém, e deixa a API como segunda origem plugável no mesmo fluxo.

**4.3. Credenciais de sistema de terceiro são dado sensível.**

Quando a integração existir, a credencial da farmácia nunca pode ficar no navegador nem aparecer na tela depois de salva. O backend guarda, a interface mostra só o estado da conexão.

---

## 5. Decisões de design que a equipe precisa validar

**5.1. O card principal do dashboard mostra "valor em risco", em reais.**

Soma do custo dos produtos vencidos mais os a vencer. É o número que prova o valor do produto numa demonstração e que sustenta o pitch do Eduardo.

**5.2. Existe um quarto estado: "sem validade informada".**

Produto importado sem lote não é vencido, não é a vencer, e **não é "no prazo"**. Usa cor neutra, nunca verde. Mostrar verde ali daria ao dono da farmácia uma sensação de segurança que ele não tem.

**5.3. O dashboard tem sete blocos.** Resolvido em 08/10: depois de um feedback de design, a Home cai para quatro blocos (valor em risco, faixa de status, lotes que vencem em 30 dias, gráfico por semana). A rosca por pasta sai. Ver `03-specs/redesign-hierarquia.md`.

---

## 6. Ainda sem responsável definido

- **Logo e marca do Valide.** Trava todo material de apresentação. Até lá, placeholder textual
- ~~**Tipografia oficial.**~~ Resolvido em 08/10: Inter na interface, Mona Sans em título e número herói. Ver `design-system.md` seção 14.1
- **Farmácia parceira.** Definida em 11/10/2026: **Farmácia Preço Popular**. Destrava o diagnóstico (B02) e a validação (B15); falta descobrir qual sistema ela usa (3.1)
