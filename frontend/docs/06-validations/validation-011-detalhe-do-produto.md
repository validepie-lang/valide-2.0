# Validação: Issue 011 - Detalhe do produto

**Issue:** `docs/04-issues/011-detalhe-do-produto.md`
**Plano:** `docs/05-plans/plan-011-detalhe-do-produto.md`
**Data:** 08/10/2026
**Resultado:** passou

## Antes e depois

| | Antes | Depois |
| --- | --- | --- |
| 1440 | `redesign-hierarquia/antes/produto-1440.png` | `redesign-hierarquia/depois/produto-1440.png` |
| 360 | `redesign-hierarquia/antes/produto-360.png` | `redesign-hierarquia/depois/produto-360.png` |
| Escuro | | `redesign-hierarquia/depois/produto-1440-escuro.png` |
| 1366 × 768 | | `redesign-hierarquia/depois/produto-1366x768.png` |
| Produto sem lote | | `redesign-hierarquia/depois/produto-sem-lote-1440.png` |

Antes: quatro blocos do mesmo peso com ícone em quadrado, selo Vencido três vezes, "Vence primeiro" ao lado de uma data que já passou, ficha em card ao lado. Depois: a primeira coisa depois do título é "Lote L2291 venceu há 12 dias (26/09/2026). São 14 un nesse lote.", com o selo uma vez.

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| O primeiro conteúdo depois do título responde se há algo a resolver, e em qual lote | passou | Três casos capturados: Vencido (Dipirona), A vencer (Cataflam, "vence em 3 dias"), Sem validade (Dramin) |
| Selo do produto uma vez no topo; um por lote na tabela | passou | Saiu o chip do cabeçalho dos lotes |
| Sem card com ícone em quadrado; sem `StatTile` e `Money` no código | passou | Os dois arquivos removidos; busca: zero |
| Custo parado inteiro; ficha com centavos | passou | R$ 564 e R$ 7,42 |
| Produto sem lote diz isso e leva a informar | passou | Frase "Validade não informada" e ação principal "Informar validade" |
| Claro, escuro, 1440, 1366, 768, 360, sem rolagem horizontal | passou | Capturas; emulação em 360 sem erro de console |
| `npm test`, `tsc`, lint | passou | 57 testes, zero erro, zero aviso |

## Corrigido durante a validação

- **Os indicadores ganhavam da resposta.** Em 28px, "76 un", "R$ 564" e "2" eram maiores que a frase de situação (18px), e o olho ia neles primeiro. Desceram para 18px: a frase, com o selo colorido e logo abaixo do título, passou a dominar.
- **Produto sem lote tinha duas ações principais**, e "Registrar saída" levava a um aviso de que não há lote. Agora, sem lote, a ação principal é "Informar validade"; o botão do estado vazio virou secundário e a frase não repete o link.
- **No celular, dois botões empilhados** empurravam a resposta para baixo, com o secundário em cima. Viraram uma linha: a ação principal larga e "Editar" só com o ícone, com nome acessível.
- **Contexto vago no indicador de lotes** ("o primeiro dá a situação") virou dado: "1 Vencido, 1 No prazo".

## Fora do plano

Nenhum arquivo fora da lista. O detalhe caiu de 281 para cerca de 200 linhas com `LotSituation` e `LotsTable` separados.

## Security Review

Sem dado sensível, permissão ou credencial.

## UX Review

- [x] Teste dos dois segundos: a situação do lote é o que se lê primeiro
- [x] Uma ação principal, que acompanha a situação do produto
- [x] Status com cor, ícone e rótulo
- [x] Verbo no tempo certo (vence, venceu, venceu hoje)
- [x] Sem travessão
