# security-rules.md: Regras de Segurança do Frontend

O Valide lida com dado de estoque de empresa e valores financeiros. Isso torna a etapa de Security Review obrigatória em qualquer issue que toque nesses pontos.

A integração com o sistema da farmácia, que traria credencial de terceiro, saiu do escopo do piloto em 17/09. As regras sobre isso continuam neste documento porque valem desde o primeiro dia em que ela voltar, e porque escrever depois é escrever tarde.

---

## Princípio: Thin Client, Fat Server

O frontend captura intenção e exibe resposta. Regra crítica, permissão, cálculo sensível e isolamento entre contas vivem no backend.

Tudo que estiver no código do navegador é **visível e alterável pelo usuário**. Qualquer proteção que dependa só do frontend não é proteção, é aparência de proteção.

---

## 1. Segredos

**Nunca no frontend:**

- Chave de API, token de serviço, senha, segredo de qualquer natureza
- Credencial do sistema de terceiro da farmácia
- String de conexão de banco

Quando a integração voltar: o formulário envia a credencial **uma vez** e o backend guarda. Depois disso a tela mostra apenas o estado da conexão, nunca o valor.

Variável de ambiente com prefixo `NEXT_PUBLIC_` vai para o navegador. Só entra aí o que pode ser público.

Nunca commitar `.env`.

---

## 2. Armazenamento no navegador

| Pode guardar | Não pode guardar |
| --- | --- |
| Preferência de tema | Token de sessão, de qualquer duração |
| Último filtro usado | Credencial de qualquer sistema |
| Rascunho de formulário não enviado | Dado de outra conta |
| Estado de interface colapsado | Qualquer dado que o usuário não deveria poder editar |

`localStorage` é editável pelo usuário. Nada que dependa de integridade fica lá.

**A sessão do Valide não fica no navegador de forma nenhuma.** Nem em `localStorage`, nem em `sessionStorage`, nem em estado do React. O backend grava um cookie `HttpOnly` no login, o navegador manda sozinho, e o JavaScript nunca alcança o token. Fechado em 16/09. O acesso ao cookie fica todo em `src/lib/api/session-token.ts`.

---

## 3. Isolamento entre contas

- O tenant vem **sempre do token**, nunca enviado pelo cliente
- O frontend não tem e não deve ter mecanismo para escolher ou trocar de conta
- Nenhum id de conta em parâmetro de URL, corpo de requisição ou estado do cliente

Essa é a proteção mais crítica do produto. Uma farmácia ver o estoque de outra encerra o projeto comercialmente.

Teste correspondente: backlog B54, isolamento entre contas.

---

## 4. Permissões

A interface **esconde**. O servidor **bloqueia**.

- Botão que o Operador não pode usar não aparece
- Rota que o Operador não pode acessar mostra a tela de sem permissão
- **E o servidor nega a requisição de qualquer forma**

Se a única barreira for o botão escondido, qualquer pessoa com o console aberto passa por ela.

---

## 5. Erros

Mensagem exibida ao usuário nunca vaza:

- Stack trace
- Nome de tabela, coluna ou serviço interno
- Id interno de registro
- Caminho de arquivo do servidor
- Detalhe de configuração

Erro na tela: o que aconteceu e o que fazer. Detalhe técnico vai para o log, não para o balconista.

**Login não revela se um e-mail existe.** A mensagem é sempre "E-mail ou senha incorretos", nos dois casos.

---

## 6. Dados em URL

Nenhum dado sensível em parâmetro de URL. URL vai para histórico do navegador, log de servidor e cabeçalho de referência.

Filtro, busca, página e aba ativa podem ir. Identificador de conta, credencial e dado pessoal, não.

---

## 7. Entrada do usuário

- Validar formato no frontend para dar feedback rápido, **e assumir que o servidor valida de novo**
- Nunca usar `dangerouslySetInnerHTML` com conteúdo vindo de dado. Se for inevitável, sanitizar antes
- Arquivo de importação é conteúdo não confiável: o backend processa, o frontend só envia e exibe o resultado
- Nome de produto vindo de importação é dado de terceiro. Renderizar como texto, nunca como HTML

---

## 8. Dependências

- Não adicionar biblioteca sem necessidade clara
- Preferir biblioteca com manutenção ativa
- `npm audit` antes de entregas importantes
- Script externo só de origem conhecida, e de preferência nenhum

---

## 9. Checklist de Security Review

Rodar em toda issue que toque em dado, credencial, permissão ou isolamento:

- [ ] Nenhuma chave, token ou credencial no código do front
- [ ] Nenhuma credencial em `localStorage` ou em estado do cliente
- [ ] Nenhuma regra crítica de negócio no cliente
- [ ] O tenant vem do token, nunca do cliente
- [ ] Permissão verificada na interface e no servidor
- [ ] Erro exibido não vaza dado interno
- [ ] Nenhum dado sensível em parâmetro de URL
- [ ] Login não revela se o e-mail existe
- [ ] Entrada do usuário validada, e nada renderizado como HTML
- [ ] Nenhuma dependência nova sem justificativa

Registrar o resultado em `docs/06-validations/` e, quando houver decisão nova, em `docs/07-decisions/security-decisions.md`.

---

## 10. Quando parar e avisar

Pare e avise o Marcus, em vez de improvisar, se uma tarefa exigir:

- Implementar autenticação de verdade neste repositório
- Guardar credencial no cliente
- Colocar regra de negócio crítica no frontend
- Permitir que o cliente escolha a conta
- Contornar uma verificação de permissão

Nenhuma dessas é problema de implementação. Todas são problema de arquitetura, e a resposta certa é conversar com o Pedro.
