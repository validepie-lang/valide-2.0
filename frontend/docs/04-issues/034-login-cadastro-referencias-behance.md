# Issue 034: Login e cadastro a partir de referências do Behance

**Pedido do Marcus (09/10):** construir o sistema a partir de referências bem avaliadas do Behance.
**Status:** executada e validada

## Referências

Behance, buscas "login page saas", "sign up page web" e "login screen dashboard", por apreciações, todos os tempos:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Login/ Sign Up UI/UX Page Template Design](https://www.behance.net/gallery/182557681/Login-Sign-Up-UIUX-Page-Template-Design) | 175 curtidas, 12.170 visualizações | Tela dividida; a metade da marca mostra o que o produto faz, com uma frase de valor; logo acima do título, alinhado à esquerda; "Don't have an account? Create an account" numa linha |
| [Sign In Page UI](https://www.behance.net/gallery/205765337/Sign-In-Page-UI) | 105 curtidas, 10.062 visualizações | Tela dividida; formulário direto no fundo, sem card; botão de largura inteira |
| [Sign Up Page UI Design](https://www.behance.net/gallery/145940023/Sign-Up-Page-UI-Design) | 177 curtidas, 6.519 visualizações | O mesmo arranjo no cadastro |
| [Modern Login Page UI Concept](https://www.behance.net/gallery/231746377/Modern-Login-Page-UI-Concept) | 112 curtidas, 6.811 visualizações | Tela dividida |

## Faz

- Layout de autenticação em duas metades a partir de 1024: o formulário à esquerda, num fundo liso; a marca à direita, na cor do cartão principal da Home (`feature`). Abaixo de 1024, só o formulário
- Painel da marca: logo, "Saiba o que vence antes de virar perda.", e as quatro situações de validade, cada uma com o que fazer. Sem foto, ilustração ou degradê
- Login e cadastro sem card: logo acima, alinhado à esquerda, e o formulário direto no fundo; "Sua empresa ainda não usa o Valide? Cadastrar empresa" numa linha

## Não faz

Itens 42 a 45 em `08-project/ficou-de-fora.md`: entrar com Google, mostrar a senha, carrossel, foto no painel.
