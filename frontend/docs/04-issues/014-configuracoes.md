# Issue 014: Configurações

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seção 5.6
**Status:** executada e validada
**Depende de:** 006, 008
**Etapa da esteira:** 5 de 12

---

## Objetivo

Configurações é tela de formulário: a pergunta é "como mudo meus dados". Hoje as três abas usam duas colunas de cards. O formulário fica à esquerda e um painel lateral à direita. Meu perfil tem um card "Sua conta" separado dos dados, e Empresa espalha cinco cards com um único "Salvar" no meio da página. Na tela há dois botões que não fazem nada: "Enviar uma foto" e "Enviar logotipo".

## Escopo

### Faz

- **Uma coluna, alinhada à esquerda, até 720px**, nas três abas. Formulário em coluna única é preenchido mais rápido e com menos erro (Baymard; NN/g). Na Empresa, campos curtos e ligados entre si dividem a linha (Logradouro e Número, Bairro e Cidade), como no endereço impresso. A largura do campo segue o tamanho da resposta (CNPJ, CEP, senha)
- **Seções separadas por título, espaço e um fio**, sem card. Componente `SettingsSection`
- **Meu perfil:**
  - **Seus dados** tem o avatar, o nome e, como linhas só de leitura, usuário, empresa e cargo. Até hoje o usuário vinha num campo que parecia editável, e empresa e cargo ficavam num card à parte
  - Depois vêm **Senha** (três campos empilhados) e **Aparência**
- **Empresa:**
  - Um formulário com um "Salvar alterações" no fim. Seções: Dados cadastrais, Endereço e contato, Janela de a vencer, Preferências
  - A moeda tem uma opção só e vira linha de leitura
  - A caixa cinza "muda na hora" vira texto de apoio que diz a verdade: muda ao salvar
- **Usuários:**
  - "Quem tem acesso" e depois "O que cada cargo pode", uma abaixo da outra. Lista e tabela continuam em card, porque precisam de superfície
  - O cargo vira selo neutro (era fundo de acento)
  - Na tabela de permissões, o ✓ e o − saem do círculo
- **Saem** "Enviar uma foto" e "Enviar logotipo": não existe envio no contrato. O avatar com iniciais fica. Os dois voltam quando houver endpoint
- Botão principal alinhado à esquerda, sob os campos, onde o olho termina de preencher
- Esqueleto de carregamento novo

### Não faz

- Não muda permissão, regra de cargo nem os campos do contrato
- Não liga os botões de salvar (seguem em mock)

## Critérios de aceite

- [ ] Uma ação primária por aba: Salvar alterações (perfil e empresa), Adicionar pessoa (usuários)
- [ ] Nenhum card em volta de formulário de configuração; nenhum botão que não faz nada além dos de salvar em mock
- [ ] Coluna até 720px, alinhada à esquerda
- [ ] Sem perfil de administrador, Empresa e Usuários continuam mostrando "sem permissão"
- [ ] Claro e escuro, 1440, 1366, 768, 360, sem rolagem horizontal
- [ ] `npm test`, `tsc`, lint
