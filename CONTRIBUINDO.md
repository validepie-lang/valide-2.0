# Como trabalhar neste repositório

Guia para o Pedro (backend) e o Antônio (banco) começarem sem tropeçar. Leva uns dez minutos.

---

## 1. Primeira vez, na sua máquina

O repositório é **privado** e todos usam a mesma conta do GitHub, `validepie-lang`. Peça o acesso ao Marcus.

```bash
# 1. autentique a conta da Valide (abre o navegador, você confirma um código)
gh auth login --hostname github.com --git-protocol https --web --scopes repo

# 2. clone
git clone https://github.com/validepie-lang/valide.git
cd valide

# 3. assine os seus commits com o SEU nome, não com o da conta compartilhada
git config user.name "Seu Nome"
git config user.email "seu-email@exemplo.com"
```

**O passo 3 não é burocracia.** O push sai pela conta da Valide, igual para todo mundo. Se você pular essa configuração, o histórico inteiro fica sem dono e não dá para mostrar o que cada um fez. O Projeto Integrador avalia contribuição individual, e o `git log` é a evidência.

Se o clone falhar com "repository not found", é autenticação, não link errado. O GitHub responde isso em repositório privado em vez de admitir que ele existe.

---

## 2. Quem mexe em quê

| Pasta | Dono | O que tem |
| --- | --- | --- |
| `frontend/` | Marcus | aplicação Next.js, telas, documentação do projeto |
| `backend/` | Pedro | API e regras de negócio, ainda a criar |
| `banco/` | Antônio | modelagem e scripts, ainda a criar |

**Cada um edita só a própria pasta.** Como ninguém toca no arquivo do outro, conflito de merge praticamente não acontece, mesmo com os três trabalhando ao mesmo tempo. Se precisar que algo mude na pasta de outra pessoa, peça, não edite.

Para criar a sua pasta, é só criar dentro do repositório e subir. Não precisa pedir nada a ninguém.

---

## 3. A rotina de todo dia

```bash
git pull --rebase        # antes de começar a trabalhar
# ... trabalhe ...
git add .
git commit -m "feat: short description in english"
git pull --rebase        # antes de subir, de novo
git push
```

**Se o push for recusado**, alguém subiu algo antes de você. Rode `git pull --rebase` e tente de novo. É normal e acontece várias vezes por semana.

**Nunca use `git push --force`.** Ele apaga o trabalho de quem subiu antes, sem aviso e sem confirmação. Se você se enrolou com o histórico, chame o Marcus antes de forçar qualquer coisa.

**Nunca suba** arquivo `.env`, senha, chave de API, `node_modules` ou dump de banco com dado real. Se subir por engano, avise na hora: apagar depois não resolve, porque fica no histórico.

### Mensagem de commit

`tipo: descrição curta em inglês`, com tipo entre `feat`, `fix`, `refactor`, `docs`, `chore`, `style`.

Exemplo: `feat: add product listing endpoint`.

---

## 4. Para o Pedro: o contrato de API

Este é o documento mais importante da sua parte:

**`frontend/docs/01-references/api-contract.md`** (versão 5)

Ele lista cada endpoint que o frontend consome, com formato de entrada e de saída, campo por campo. **O frontend inteiro já está construído contra esse contrato**, usando dados falsos no lugar das respostas reais. Quando um endpoint seu ficar de pé, o frontend troca o dado falso pela chamada de verdade, sem redesenhar tela.

O que já foi acordado entre você e o Marcus em 16/09 e não deve mudar sem conversa:

- **Base:** `/api/v1`
- **Sessão em cookie httpOnly**, chamado `valide_session`, gravado pelo backend no login. O frontend nunca guarda token e nunca manda header `Authorization`. Isso foi decidido depois do seu aceite, então confira: muda a implementação do B24
- **Dinheiro em centavos**, número inteiro, nunca float
- **O tenant vem do token, nunca do cliente.** O frontend não manda id de empresa em lugar nenhum
- **O status de validade é calculado por você**, não pelo frontend. O frontend só recalcula localmente para dar resposta imediata enquanto a pessoa digita no formulário
- **Paginação por offset**, com `page` e `perPage`
- **Dashboard em uma chamada agregada**, `GET /dashboard`, não em seis chamadas separadas

**Ordem de entrega combinada:** B24 (autenticação) primeiro, depois B28, B27 e B30. O frontend não está bloqueado por nenhum deles, mas nessa ordem ele consegue ligar as telas uma a uma.

**Uma pergunta que precisa da sua resposta antes de virar código:** um lote que vence **hoje** é `A vencer` ou `Vencido`? O frontend trata o dia do vencimento como último dia válido, ou seja, `A vencer`, e isso está travado em teste automatizado. Se o seu cálculo discordar, o mesmo produto vai aparecer com um status na tela de cadastro e outro na listagem, no mesmo dia, e o usuário não tem como saber qual está certo. Está registrado na pauta, item 2.5.

**Mudou alguma coisa no contrato?** Avise o Marcus por escrito antes de implementar. Manter esse documento desatualizado é o erro mais caro do projeto, porque ele é o que liga os dois lados.

---

## 5. Para o Antônio: o que o banco precisa sustentar

A modelagem atual do domínio, do ponto de vista de quem consome, está em `frontend/docs/01-references/api-contract.md`, na seção de tipos. As entidades são: empresa, usuário, pasta, produto, lote, movimentação e importação.

Três pontos que valem atenção na modelagem:

1. **Multi-tenant.** Toda tabela de dado de cliente precisa de um vínculo com a empresa, e nenhuma consulta pode cruzar empresas. É a regra de segurança que a equipe não pode errar
2. **Produto pode existir sem lote**, e isso não é erro. É o caso comum depois de uma importação de catálogo: o sistema da farmácia dá o produto, mas não dá a validade. Esse produto é "Sem validade", que é um estado válido e diferente de "No prazo"
3. **Valor monetário em centavos**, inteiro

---

## 6. Onde ler mais

| Quer entender | Leia |
| --- | --- |
| O que é o Valide e para quem | `frontend/docs/00-context/project-overview.md` |
| As regras de negócio | `frontend/docs/00-context/business-rules.md` |
| O contrato de API | `frontend/docs/01-references/api-contract.md` |
| Regras de segurança acordadas | `frontend/docs/01-references/security-rules.md` |
| Por que cada decisão foi tomada | `frontend/docs/07-decisions/` |
| O que está pendente com a equipe | `frontend/docs/08-project/pauta-reuniao.md` |
| O cronograma por fase | `frontend/docs/08-project/plano.md` |

---

## 7. Rodando o frontend, se você quiser ver

Precisa de Node 22 ou superior.

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
npm test        # 28 testes da regra de validade
```

Ele sobe com dados de demonstração, sem depender de backend nenhum. Dá para clicar em tudo.
