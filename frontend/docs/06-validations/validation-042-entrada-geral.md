# Validação: Issue 042 - Entrada geral com leitura de código

**Data:** 10/10/2026
**Resultado:** passou

## Antes e depois

- **Antes:** a entrada de lote só abria de dentro de um produto. Para receber uma caixa, era preciso achar o produto no Estoque, abrir e só então registrar
- **Depois:** "Registrar entrada" em Movimentações abre `/estoque/entrada`: bipa ou busca o produto, e o mesmo formulário da 028 aparece com o produto no topo

## Critérios

| Critério | Resultado |
| --- | --- |
| Ao abrir, o foco já está no campo de busca | ok, pelo script e pelo `autofocus` no HTML |
| Leitor do caixa simulado (código digitado e Enter): abre o produto direto, com o foco no número do lote | ok: `7891000000007` vai para `?produto=p1`, foco em `lote-1` |
| Código interno exato (`med-1040`, sem diferença de maiúscula) também abre direto | ok |
| Busca por nome lista os resultados; cada um abre o passo 2 | ok (`losartana`, `dor`) |
| Nada encontrado: explica e oferece "Cadastrar produto" | ok (`xyzzy`) |
| "Trocar produto" e "Voltar sem registrar" voltam à busca; a entrada pelo produto continua voltando ao produto | ok |
| 1440 claro e escuro, 768 e 360 sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (69) e `next build` | passam |

## Corrigido na conferência

- O exemplo do campo trazia um número de código de barras: "número de exemplo não existe" (design-system 14.10). Virou "Código de barras, código interno ou nome"
- Depois de bipar o foco ficava no início da página: agora vai para o número do lote

Capturas em `telas-novas/042/`.
