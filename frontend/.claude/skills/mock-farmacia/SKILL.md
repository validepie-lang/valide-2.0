---
name: mock-farmacia
description: Gera dados mock realistas de farmácia para o Valide, tipados e alinhados ao contrato de API. Use ao criar ou atualizar dados de demonstração para telas, gráficos e apresentação para a equipe ou para a farmácia parceira.
---

# Gerar dados mock de farmácia

O mock não é detalhe. Na apresentação para a equipe e na validação com a farmácia parceira, dado falso é a primeira coisa que alguém nota. Nome genérico tipo "Produto 1" e datas todas iguais destroem a credibilidade da demonstração.

## Antes de começar

Leia `docs/01-references/api-contract.md` para os tipos exatos. O mock precisa bater campo a campo com o que a API vai devolver, senão a integração vira retrabalho.

## Regras de qualidade

### Produtos

Use nomes reais de medicamento e item de farmácia, com dosagem e apresentação:

- Dipirona Sódica 500mg, 20 comprimidos
- Amoxicilina 500mg, 21 cápsulas
- Losartana Potássica 50mg, 30 comprimidos
- Soro Fisiológico 0,9%, 500ml
- Protetor Solar FPS 50, 120ml
- Fralda Geriátrica G, 8 unidades
- Termômetro Digital

Varie o tamanho do nome de propósito. Inclua pelo menos um nome bem longo, para testar quebra de texto na tabela e no card.

### Pastas de classificação

Nomes que uma farmácia usaria de verdade: Medicamentos, Genéricos, Dermocosméticos, Higiene, Infantil, Perfumaria, Materiais.

### Lotes e datas

Esta é a parte que mais importa. A regra:

- **Pelo menos 3 lotes vencidos**, com prazos diferentes: um venceu ontem, um há duas semanas, um há três meses
- **Pelo menos 5 lotes a vencer**, espalhados dentro da janela (padrão de 30 dias): um vence amanhã, outros ao longo das próximas semanas
- **O resto no prazo**, com validades de três meses a dois anos

As datas precisam ser calculadas a partir de hoje, nunca fixas no arquivo. Data fixa quebra a demonstração daqui a um mês.

```ts
const daysFromNow = (n: number) =>
  new Date(Date.now() + n * 86_400_000).toISOString()
```

Códigos de lote plausíveis: `L2291A`, `BX-4471`, `2026B0093`. Nunca `lote1`, `lote2`.

### Valores

Em **centavos, inteiro**, conforme o contrato. Preços coerentes com farmácia brasileira: dipirona genérica na faixa de R$ 8 a R$ 15, dermocosmético de R$ 60 a R$ 180. Preço de venda sempre acima do custo de compra.

### Volume

Entre 40 e 60 produtos. Menos que isso não exercita paginação nem filtro. Muito mais que isso pesa o arquivo sem ganho.

### Casos de borda obrigatórios

Inclua sempre:

- Um produto com nome muito longo
- Um produto sem código de barras
- Um produto sem pasta atribuída
- Um produto com estoque zerado
- Um produto abaixo do estoque mínimo (para acionar a notificação)
- Um produto com três lotes de status diferentes ao mesmo tempo

### Usuários e movimentações

Nomes brasileiros comuns: Ana Ribeiro, Carlos Menezes, Juliana Souza. Um Administrador e dois Operadores.

Movimentações com horário de comércio (entre 8h e 19h), espalhadas nos últimos 30 dias, com os cinco motivos representados (venda, avaria, roubo, vencimento, consumo interno). Venda deve ser a maioria, como na vida real.

## Organização dos arquivos

```
src/lib/mocks/
  products.ts
  folders.ts
  users.ts
  movements.ts
  notifications.ts
  dashboard.ts
```

O mock do dashboard deve ser **derivado** dos produtos, não escrito à mão. Se você digitar os números do dashboard separadamente, eles vão divergir da listagem e alguém vai notar na demonstração.

```ts
export const mockDashboard = buildDashboard(mockProducts)
```

## Ao terminar

Diga quantos produtos gerou, quantos em cada status, e confirme que os números do dashboard são derivados da lista de produtos.
