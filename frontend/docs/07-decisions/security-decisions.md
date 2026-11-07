# security-decisions.md: Decisões de Segurança

Decisões que afetam dado, credencial, permissão ou isolamento entre contas. Mais recente no topo.

Regras vigentes em `01-references/security-rules.md`. Este arquivo registra o **porquê** de cada uma.

---

## 2026-09-16: Sessão em cookie httpOnly, nunca no navegador

**Decisão:** o backend grava um cookie `HttpOnly` no login. `POST /auth/login` deixa de devolver `token` no corpo, e o header `Authorization: Bearer` sai do contrato.

**Por quê:** o rascunho do contrato devolvia o token no corpo, o que obriga o frontend a guardá-lo. Todo lugar disponível no navegador para guardar é legível por JavaScript, então um único script injetado, vindo por exemplo de um nome de produto malformado numa importação, levaria a sessão junto. Com `HttpOnly` não existe o que vazar: o JavaScript não alcança o token.

**Consequência:** as telas buscam dado em Server Component, e o servidor repassa o cookie da requisição que chegou. Todo acesso ao cookie fica em `src/lib/api/session-token.ts`, um arquivo só. Nenhum componente do cliente toca em sessão.

**Fica combinado com o Pedro:** nome `valide_session`, com `HttpOnly`, `Secure`, `SameSite` e prazo de validade. E, antes do deploy, decidir se frontend e API ficam no mesmo site ou se o cookie precisa de `SameSite=None; Secure` com CORS liberando credenciais.

**Teste correspondente:** vale pedir ao João para conferir, com o DevTools aberto, que nenhuma tela expõe o token em `localStorage`, `sessionStorage` ou no estado do React.

---

## 2026-09-16: Thin Client, Fat Server como princípio do repositório

**Decisão:** o frontend captura intenção e exibe resposta. Regra crítica, permissão, cálculo sensível e isolamento entre contas ficam no backend.

**Por quê:** tudo que está no código do navegador é visível e alterável pelo usuário. Qualquer proteção que dependa só do frontend é aparência de proteção.

**No Valide isso é também divisão de trabalho:** o backend é do Pedro, o banco é do Antônio. Tarefa que exija regra de servidor aqui é sinal para parar e conversar, não para improvisar.

---

## 2026-09-16: Tenant vem do token, nunca do cliente

**Decisão:** o identificador da conta é inferido do token de autenticação. O frontend não envia, não escolhe e não tem mecanismo para trocar de conta.

**Por quê:** é a proteção mais crítica do produto. Uma farmácia ver o estoque de outra encerra o projeto comercialmente, e seria uma falha de dado de terceiros.

**Consequência:** nenhum id de conta em URL, corpo de requisição ou estado do cliente.

**Teste correspondente:** backlog B54, isolamento entre contas, com o João.

---

## 2026-09-16: Interface esconde, servidor bloqueia

**Decisão:** o que o cargo Operador não pode fazer não aparece na interface. **E** o servidor nega a requisição de qualquer forma.

**Por quê:** botão escondido é experiência, não segurança. Qualquer pessoa com o console aberto passa por ele.

**Consequência:** toda verificação de permissão existe em dois lugares, de propósito. Isso não é duplicação a ser eliminada.

---

## 2026-09-16: Credencial de sistema de terceiro nunca fica no cliente

**Decisão:** o formulário de integração envia a credencial da farmácia uma vez, o backend guarda, e a tela depois mostra apenas o estado da conexão: conectada, desconectada ou com erro. Nunca o valor.

**Por quê:** essa credencial dá acesso ao sistema de gestão da farmácia, que contém muito mais do que estoque. Vazamento ali é dano ao cliente, não ao Valide.

**Consequência:** nada de credencial em `localStorage`, em estado do React, ou exibida em campo de formulário depois de salva.

---

## 2026-09-16: Erro exibido não vaza detalhe interno

**Decisão:** mensagem de erro ao usuário nunca contém stack, nome de tabela ou coluna, id interno, caminho de arquivo ou detalhe de configuração.

**Por quê:** detalhe interno em mensagem de erro é material de reconhecimento para quem quer atacar o sistema. E é inútil para o balconista.

**Consequência:** erro na tela diz o que aconteceu e o que fazer. Detalhe técnico vai para o log.

---

## 2026-09-16: Login não revela se um e-mail existe

**Decisão:** a mensagem é sempre "E-mail ou senha incorretos", tanto para e-mail inexistente quanto para senha errada.

**Por quê:** mensagem diferente permite descobrir quais e-mails estão cadastrados, o que é o primeiro passo de um ataque por tentativa de senha.

---

## 2026-09-16: Arquivo de importação é conteúdo não confiável

**Decisão:** o arquivo enviado na importação é processado pelo backend. O frontend só envia e exibe o resultado. Dado vindo de importação é renderizado como texto, nunca como HTML.

**Por quê:** o conteúdo vem do sistema de um terceiro, e o Valide não controla o que tem lá dentro. Nome de produto com marcação HTML renderizado sem escape é injeção de script.

---

## 2026-09-16: Nenhum dado sensível em parâmetro de URL

**Decisão:** filtro, busca, página e aba ativa podem ir na URL. Identificador de conta, credencial e dado pessoal, não.

**Por quê:** URL vai para histórico do navegador, log de servidor e cabeçalho de referência quando o usuário clica em um link externo.

---

## Template para nova decisão

```
## AAAA-MM-DD: <título da decisão>

**Decisão:** o que foi decidido.

**Por quê:** o risco que isso evita.

**Consequência:** o que isso obriga no código daqui em diante.

**Teste correspondente:** se houver, o item do backlog de QA.
```
