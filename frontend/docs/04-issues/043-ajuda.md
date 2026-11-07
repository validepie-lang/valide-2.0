# Issue 043: Ajuda

**Origem:** levantamento de telas e abas que faltam (10/10, item E). O Pharmly e o Vault têm "Ajuda" no menu; o Valide não tinha onde explicar a importação, as quatro situações ou quem pode fazer o quê, e a importação é o passo que mais trava quem começa.
**Status:** executada e validada

## Referências

Behance, buscas "help center", "faq page", "faq accordion", "knowledge base" e "help and support dashboard", por apreciações, todos os tempos. Central de ajuda é pouco publicada e pouco apreciada no Behance: as buscas trazem logotipos de clínica, campanhas e páginas de site. As mais próximas, com a avaliação que têm:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| [Knowledge Base Landing Page](https://www.behance.net/gallery/68655703/Knowledge-Base-Landing-Page) | 230 curtidas, 2.938 visualizações | A busca larga no topo; os assuntos em cartões logo abaixo, cada um com uma linha do que tem dentro |
| [FAQ Section](https://www.behance.net/gallery/177186831/FAQ-Section) | 144 curtidas, 3.034 visualizações | A pergunta numa linha com "+" à direita; aberta, a resposta embaixo e o "+" vira "−"; uma de cada vez visível sem rolar |
| Pharmly e Vault (issue 027 e levantamento de 10/10) | 356 e 221 curtidas | "Ajuda" no grupo de baixo do menu, junto de Configurações, longe das telas de trabalho |

O que fica de fora delas: a ilustração e o fundo colorido da Knowledge Base, e a ilustração da FAQ Section (`design-system.md` 14.9); o ícone dentro de cada cartão de assunto.

## Faz

- Rota `/ajuda`. Porta de entrada no trilho lateral, embaixo, antes do tema (como o grupo "General" do Vault), e no menu da conta, que também existe no celular
- Busca no topo que filtra as perguntas enquanto se digita; sem resultado, diz o que fazer
- Quatro assuntos em cartões, que levam à seção: Começar, Validades, Entrada e saída, Pessoas e acesso
- Perguntas que abrem e fecham (`<details>` do navegador: teclado e leitor de tela de graça), com respostas curtas e o link para a tela onde se faz
- Conteúdo tirado das regras que já valem (`business-rules.md`, contrato, telas): nada prometido que a tela não faz

## Não faz

Itens 85 a 89 em `08-project/ficou-de-fora.md`.
