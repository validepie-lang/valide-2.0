# Issue 053: Validades pendentes grava

**Origem:** fase de lógica, parada desde 09/10. O Marcus pediu em 10/10 ("Fazer os formulários gravarem"), e a ordem combinada começa pela fila de validades: é o trabalho repetitivo de quem acabou de importar o catálogo, e até aqui "Salvar e ir para o próximo" só avançava a tela.
**Status:** executada e validada. **Depende do Pedro:** com `products` em `NEXT_PUBLIC_API_LIVE`, o lote vai para `POST /products/:id/lots`. Sem a área ligada, o servidor simulado confere e responde como o do Pedro, mas não guarda: recarregar a página traz a fila de volta.

## Referências

A tela não muda: o desenho da issue 031 (Quizai e English Learning App, Behance) continua. Esta issue é comportamento, e o Behance mostra a tela, não o que acontece ao salvar. Como na 026 e na 046, o comportamento vem do design system público do GitHub:

| Fonte | O que se usa |
| --- | --- |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | "The default behavior of the web is to perform validation when the user attempts to submit the form"; depois da primeira tentativa, validar enquanto se digita. "An invalid field should always have a message explaining why the value does not pass validation." "The first invalid input should be focused." A mensagem de erro toma o lugar da dica do campo |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) | "If there is an error saving the data, the user's data should be preserved in the form and they should be given feedback about the failure." Mudança que não fica evidente na tela ganha uma mensagem na própria página (InlineMessage), não um toast. "Do not disable or hide a form's save button" |
| [Primer, Loading](https://primer.style/product/ui-patterns/loading) | Os campos podem parar de aceitar mudança enquanto o envio acontece, para não restar dúvida sobre o que foi salvo; o botão que dispara não fica semanticamente desabilitado |

## Faz

- "Salvar e ir para o próximo" (e Enter) envia o lote por server action (`src/lib/actions/lots.ts`) para a camada de serviço (`createLot` em `services/lots.ts`), como a Retirar vencidos já faz com o descarte. Nada de backend no front
- Validação ao salvar: número do lote, validade completa e quantidade maior que zero. Quantidade em branco vale o estoque atual do produto, e a dica do campo diz isso
- Com erro: a mensagem embaixo do campo (no lugar da dica), o foco no primeiro campo errado; a partir daí a mensagem some assim que o campo fica certo
- Salvando: o botão vira "Salvando…", os campos ficam só leitura e um segundo Enter não envia de novo; "Pular este" espera
- Salvou: vai para o próximo, e uma linha no cartão confirma o que foi gravado ("Salvo: Dipirona 500mg, lote L2291, vence em 30/11/2026"), lida pelo leitor de tela
- Falhou: o que foi digitado fica. Código de lote repetido (`409 LOT_CODE_TAKEN`) aparece no campo do lote; o resto, numa faixa acima dos botões com a mensagem do servidor, que já diz o que fazer
- Peças para as próximas issues da fase: `ActionResult` e `actionFailure` (`src/lib/actions/result.ts`), o formato único de resposta das server actions; `Field` passa a dar `id` à mensagem, para o campo apontar para ela (`aria-describedby`)
- Regras em `lib/utils/lot-draft.ts`, com teste

## Não faz

Itens 98 a 100 em `08-project/ficou-de-fora.md`.
