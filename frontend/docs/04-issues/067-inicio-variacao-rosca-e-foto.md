# Issue 067: Início com variação semanal, rosca por pasta e foto

**Origem:** decisão do Marcus em 11/10/2026 sobre o que ficou de fora (itens 1, 3 e 4), depois de ver o protótipo no localhost. "Pode seguir" em 12/10.
**Status:** executada e validada.
**Depende de:** 066. O item 1 precisa do Pedro (contrato v23); até lá, dado simulado.

## Referências

| Projeto | Avaliação | O que veio dele |
| --- | --- | --- |
| [Pharmacy Management Admin Dashboard](https://www.behance.net/gallery/214668383/Pharmacy-Management-Admin-Dashboard-UI-Design) (Pharmly) | 356 curtidas, 9.294 visualizações | Variação em pílula no canto do indicador ("+2%", com seta). Cartão com foto de farmacêutico na prateleira, frase curta por cima e um botão claro ("Learn more"), na coluna estreita do painel |
| [Inventory management dashboard](https://www.behance.net/gallery/199203507/Inventory-management-dashboard) (Gyle) | 690 curtidas | Rosca com a distribuição por categoria e a legenda com os números ao lado |
| Vault (221 curtidas, issue 027) | | "desde a semana passada" escrito junto da variação |
| Foto: [farmacêutica na prateleira](https://unsplash.com/photos/byGTytEGjBo), National Cancer Institute | 10 milhões de visualizações no Unsplash, destaque | Uso gratuito pela Licença da Unsplash (uso comercial sem pedir licença, sem crédito obrigatório). Foi escolhida porque mostra o gesto que o Valide quer evitar fazer às cegas: tirar uma caixa da prateleira |

## Faz

- **Variação semanal (1):** pílula no cartão "Valor em risco" com seta e "+12% desde a semana passada". Cor neutra (texto do cartão), porque vermelho e verde são de validade (a regra só muda para a variação de Perdas, item 54, na 082). Sem valor da semana passada (conta nova), a pílula não aparece. Contrato v23: `valueAtRiskLastWeek` no `GET /dashboard`
- **Rosca por pasta (4):** cartão "Em risco por pasta" ao lado da foto, com o título dizendo a conclusão ("Medicamentos tem 4 dos 12 produtos em risco"), a rosca com o total no meio e a legenda com quantidade e porcentagem. Até cinco pastas; o resto vira "Outras pastas". Cada linha leva ao Estoque filtrado pela pasta e pelos estados em risco. Tons da tinta cobalto, nunca cor de status. Usa o `byFolder` que o contrato já tem
- **Foto (3):** cartão na coluna estreita, embaixo de "Retirar da prateleira", com a foto, "Dez minutos por semana na prateleira" e o botão "Ver como fazer", que leva à Ajuda (Entrada e saída, onde está "Como tiro os vencidos da prateleira?"). O texto fica numa faixa sólida da cor do trilho sobre a foto, sem degradê
- **Regras:** `design-system.md` 14.5 (rosca permitida só para a parte de cada pasta no risco) e 14.9 (uma foto por tela, em cartão de conteúdo, sem degradê). Cartão "Valor em risco" sai de `page.tsx` (214 linhas) para `value-at-risk-card.tsx`

## Não faz

- Variação nos quatro cartões de estado: o protótipo aprovado mostrava só no valor em risco, e quatro pílulas a mais voltariam à grade de blocos iguais (14.9)
- Foto da Farmácia Preço Popular: se ela mandar uma foto da própria prateleira, troca-se um arquivo
- Gráfico de pizza (fatia cheia): a rosca deixa o total no meio

## Critérios de aceite

- [x] Pílula com seta e porcentagem, e nada quando não há a semana passada
- [x] Rosca com cinco pastas no máximo, legenda com número e link que filtra o Estoque
- [x] Foto carregada otimizada, com texto legível nos dois temas e no celular
- [x] 360, 768 e 1440, claro e escuro, sem rolagem lateral
- [x] Teclado: a legenda e o botão da foto entram no Tab; a rosca não
