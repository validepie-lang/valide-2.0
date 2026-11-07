# Issue 010: Estoque

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seção 5.2
**Status:** executada e validada
**Depende de:** 006, 007, 009
**Etapa da esteira:** 5 de 12

---

## Objetivo

A pergunta da tela é "o que eu tenho, e o que está perto de vencer". A tabela é o nível 1. Tudo que não ajuda a responder isso fica a um clique.

## Escopo

### Faz

- **Ação primária "Importar produtos"**; "Adicionar produto" vira secundária. No celular, as duas numa linha: "Importar produtos" e um botão de ícone com nome acessível
- **Sem descrição** sob o título. Ela repetia o rodapé "o que vence primeiro fica no topo"
- **Faixa de filtro**: busca, botão "Mais filtros" com o número de filtros ativos, e "Limpar filtros". Abaixo, os chips dos quatro estados, com contagem
- **"Mais filtros"**: painel com Pasta, Fornecedor, Marca e Origem, aplicado por formulário (o filtro continua vivendo na URL). Fecha com Esc e clique fora
- **Filtro de vários estados na URL**: `status=expired,soon`, que o botão da Home usa. Os dois chips aparecem ativos
- **Colunas padrão**: Produto, Validade (data e distância), Situação, Quantidade (com unidade, à direita). **Seletor de colunas**: Código interno, Pasta, Lote, Estoque mínimo, Custo parado, desligadas por padrão
- **Sai** o selo "no mínimo" (aparecia em 13 de 20 linhas e fala de reposição, não de validade), a segunda linha com código e marca, e a linha de chips de pasta
- **Celular**: card com produto e chip na primeira linha; validade e quantidade na segunda
- **Contrato v10**: `status` com vários valores, `supplier`, `brand`, `source` em `GET /products`; `GET /products/facets` novo

### Diferenças em relação à SPEC, com motivo

1. **Endpoint novo `GET /products/facets`.** A SPEC dizia "nenhum endpoint novo", mas filtrar por fornecedor e marca precisa da lista de valores que existem. Sem isso o filtro seria um campo de texto livre, que obriga o balconista a lembrar a grafia exata do fornecedor.
2. **A escolha de colunas fica num cookie, não no `localStorage`.** Com cookie o servidor já desenha a tabela com as colunas escolhidas. Com `localStorage` a tabela apareceria com as padrão e trocaria depois de carregar. Continua sendo só preferência: sem o cookie, valem as padrão.

### Não faz

- Ordenação por clique no cabeçalho (fora da SPEC)
- Seleção de vários estados pelos chips: o chip continua sendo um estado só; vários estados vêm de link (o da Home)

## Critérios de aceite

- [ ] Um único botão cheio: "Importar produtos"
- [ ] Quatro colunas por padrão; o seletor liga e desliga as outras e a escolha volta ao recarregar
- [ ] `/estoque?status=expired,soon` mostra os 27 produtos vencidos e a vencer, com os dois chips ativos
- [ ] Fornecedor e marca filtram; pasta e origem continuam filtrando
- [ ] Quantidade com unidade, alinhada à direita, tabular
- [ ] Nenhum selo "no mínimo" na lista
- [ ] Teclado: painel de filtros e seletor de colunas abrem, fecham com Esc e devolvem o foco
- [ ] Claro e escuro, 1440, 1366, 768, 360; sem rolagem horizontal da página
- [ ] `npm test`, `tsc`, lint
