# Validação: Issue 029 - Estoque a partir de referências do Behance

**Data:** 10/10/2026
**Resultado:** passou

Capturas em `telas-novas/029/antes` e `depois` (1440 claro e escuro, 768, 360, e a página 4).

## Conferido no Chrome, por script

| URL | Rodapé | Ordem | Primeiros |
| --- | --- | --- | --- |
| `/estoque` | Mostrando 1–25 de 80 produtos | Validade, crescente | Torsilax, Maleato de Enalapril, Dipirona |
| `?pagina=4` | Mostrando 76–80 de 80 produtos | Validade | Chupeta Nuk, Termômetro, Magnésio |
| `?ordem=name_asc` | 1–25 de 80 | Produto, crescente | Absorvente Always, Advil, Álcool em Gel |
| `?ordem=expiry_desc` | 1–25 de 80 | Validade, decrescente | sem validade primeiro, depois o que vence por último |
| `?status=soon&ordem=quantity_asc` | 1–22 de 22 produtos com situação A vencer | Quantidade | Amoxil BD (4 un), Cataflam (5 un) |
| `?pagina=99` | redireciona para `?pagina=4` | | |
| `?busca=dipirona` | 1–2 de 2 produtos para "dipirona" | | |

- **Antes:** a página mostrava 40 dos 80 produtos, sem como ver o resto
- Busca, filtro e ordem sobrevivem à troca de página; trocar filtro, busca ou ordem volta à página 1; "Limpar filtros" mantém a ordem
- `aria-sort` na coluna ordenada; o link diz para que ordem vai ("ordenar de A a Z")
- 360 sem rolagem horizontal; paginação com alvo de 44px no celular

## Achado e corrigido

`?pagina=99` mostrava o estado de "estoque vazio" ("Comece trazendo seus produtos"). Agora redireciona para a última página.

## Fica registrado

`expiry_desc` põe os Sem validade antes de tudo (o mock trata "sem data" como a data mais distante). Quem decide de verdade é o servidor; a ordem do contrato não diz onde vai o Sem validade.

## Checagem

`npx tsc --noEmit`, lint e `npm test` passam.
