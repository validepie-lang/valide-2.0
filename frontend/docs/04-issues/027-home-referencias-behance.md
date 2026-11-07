# Issue 027: Home reconstruída a partir de referências do Behance

**Pedido do Marcus (09/10/2026):** "continue usando referências da behance para construir todo o sistema, incluindo reconstruir a home". Nada inventado: cada escolha abaixo vem de um padrão que se repete em painéis bem avaliados.
**Status:** executada e validada
**Não muda:** paleta Ardósia, as quatro cores de status e o vocabulário (regras fixas do `CLAUDE.md`). A referência dá estrutura e padrão, não cor.

## Pesquisa

Behance, buscas "inventory management", "inventory dashboard" e "pharmacy dashboard", ordenadas por apreciações, todos os tempos. Abertos os painéis com tela real (os demais eram vitrine de marca):

| Projeto | Avaliação |
| --- | --- |
| [Inventory management dashboard](https://www.behance.net/gallery/199203507/Inventory-management-dashboard) (Gyle) | 690 curtidas, 3.845 visualizações |
| [Pharmacy Management Admin Dashboard UI Design](https://www.behance.net/gallery/214668383/Pharmacy-Management-Admin-Dashboard-UI-Design) (Pharmly) | 356 curtidas, 9.294 visualizações |
| [Warehouse Management Dashboard UI Design](https://www.behance.net/gallery/226571399/Warehouse-Management-Dashboard-UI-Design-Inventory) (Vault) | 221 curtidas, 6.359 visualizações |
| [Inventory Management Dashboard](https://www.behance.net/gallery/186045923/Inventory-Management-Dashboard) | 924 curtidas, 5.876 visualizações |

## Padrões que se repetem, e onde entram

| Padrão | Visto em | Na Home |
| --- | --- | --- |
| Fileira de indicadores no topo, o principal num cartão cheio e escuro, os outros brancos | Gyle, Pharmly, Vault | "Valor em risco" em cartão cheio na cor do trilho lateral (`deep`), como o Pharmly faz com a cor da barra; os quatro estados na mesma fileira |
| Título da página à esquerda, ação à direita | Vault ("Add New Product"), Gyle | Data e farmácia à esquerda; "Adicionar produto" à direita, secundário (a ação primária continua no cartão principal) |
| Gráfico largo à esquerda, lista estreita à direita | Pharmly, Gyle, Vault | Vencimentos por semana (8 colunas) e "Retirar da prateleira" (4 colunas) |
| Tabela em card com cabeçalho de colunas e "Ver todos" | Gyle ("Stock Alert"), Pharmly ("Latest Orders"), Vault | "Vencem nos próximos 30 dias" vira tabela: produto e lote, validade, distância, quantidade |
| O valor crítico da tabela em vermelho | Gyle (quantidade de alerta) | A distância vai na cor de texto do estado, como já é (direção A) |

## Não entra, e por quê

- **Variação "+2% desde a semana passada"** (Gyle, Pharmly, Vault): o contrato não tem série histórica do valor em risco. Inventar o número seria pior que não ter
- **Ícone em quadrado colorido no cartão, foto promocional, rosca** (Pharmly, Gyle): proibidos no `design-system.md` 14.5 e 14.9
- **Saudação "Good Morning"** (Gyle): o `design-system.md` 14.9 proíbe frase de boas-vindas; a data e o nome da farmácia ficam

## Faz

- `page.tsx` da Home na nova grade
- Cartão principal em `deep`, com botão claro (variante nova `inverse` no `Button`: fundo `deep-fg`, texto `deep`)
- `StatusSummary` aceita a fileira de quatro (sem mudar o 2 por 2 no celular)
- `LotList` ganha a forma de tabela a partir de `lg`
- Esqueleto da Home na nova grade

## Aceite

- [x] Cada bloco da Home corresponde a um padrão da tabela acima
- [x] Contraste do texto no cartão escuro de 4,5:1 ou mais, nos dois temas
- [x] Claro e escuro, 1440, 768 e 360 sem rolagem horizontal
- [x] `tsc`, lint, `npm test`
