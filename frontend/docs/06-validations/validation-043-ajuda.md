# Validação: Issue 043 - Ajuda

**Data:** 10/10/2026
**Resultado:** passou

## Antes e depois

- **Antes:** nenhum lugar explicava como trazer os produtos, o que quer dizer cada situação ou quem pode fazer o quê. A única ajuda era o texto de cada tela
- **Depois:** `/ajuda`, com busca, quatro assuntos e 13 perguntas, cada uma com o link para a tela onde se faz. "Ajuda" no trilho lateral e no menu da conta

## Critérios

| Critério | Resultado |
| --- | --- |
| Cada resposta confere com a regra e a tela de hoje (fila do maior valor parado, Enter salva e avança, descarte só de Farmacêutico e Administrador, histórico que não se apaga, senha pelo administrador) | ok, conferido no código das telas |
| Pergunta abre e fecha pelo teclado (Enter no resumo), com o "+" virando "×" | ok |
| Busca sem acento: "validade" acha as 3 perguntas, com o assunto em cima de cada uma, e avisa o leitor de tela | ok |
| Busca sem resultado diz o que tentar | ok ("xyz") |
| Menu da conta: Meu perfil, Dados da empresa, Ajuda, Sair da conta | ok |
| No trilho, "Ajuda" fica acesa na página | ok |
| As quatro situações aparecem com o selo de cada uma (cor, ícone e rótulo) | ok |
| 1440 claro e escuro, 768 e 360 sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (69) e `next build` | passam |

## Corrigido na conferência

- No celular, o exemplo do campo era cortado: virou "Qual é a dúvida?"
- Os quatro cartões empilhados empurravam as perguntas para a segunda tela: duas colunas, com a contagem alinhada no rodapé
- A resposta aberta encostava na pergunta

## Fonte

As referências de central de ajuda no Behance são pouco apreciadas (230 e 144 curtidas). Ficou registrado na issue; o desenho segue o que elas têm em comum, sem a ilustração.

Capturas em `telas-novas/043/`.
