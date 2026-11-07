# Issue 009: Home em uma coluna e menu de avisos

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seções 5.1 e 5.8
**Status:** executada e validada
**Depende de:** 008
**Etapa da esteira:** 5 de 12

---

## Objetivo

Fechar a Home: de nove blocos para quatro, em três níveis de leitura, sem painel lateral. Os avisos saem da Home e vão para o sino, em todas as telas.

## Escopo

### Faz

- **Home em uma coluna principal.** Nível 1 e faixa de status em largura inteira; abaixo, lista (7 de 12 colunas) e gráfico (5 de 12). 48px entre seções no desktop, 32px no celular
- **"Vencem nos próximos 30 dias"**: cinco lotes A vencer, em card de lista clicável. Cada linha: produto, lote e quantidade com unidade, validade e distância. Link "Ver todos" para o estoque filtrado em A vencer
- **Gráfico sem card**, sob o título da seção, que é a conclusão
- **Menu de avisos no sino**: abre uma lista com os avisos, não lidos marcados, fecha com Esc e clique fora, devolve o foco ao sino. Contador em neutro, não no azul de acento
- **Saem:** pilha de filas, rosca por pasta, painel de avisos, atalhos, movimentações recentes, o card com recorte de canto. E do CSS: `.glass`, `.glass-tab`, `.notch-tr`, os tokens de vidro e `chart-1` a `chart-6`
- **Esqueleto de carregamento** da Home com a forma nova
- **Estados:** sem lote a vencer, a lista diz isso; sem lote nenhum nas próximas semanas, o gráfico dá lugar a uma frase
- **Contrato v9:** `expiringSoon` traz só `status = soon`, os cinco primeiros, com `unit`. `expiryByWeek` conta a partir de amanhã (o lote de hoje já é Vencido)

### Decisão tomada na execução, com justificativa

**A linha da lista não repete o chip "A vencer".** A SPEC listava o chip em cada linha. Como a lista só tem A vencer, o título já diz o estado, e cinco chips iguais seriam o "excesso de selos" que a auditoria condenou. É o mesmo raciocínio que a SPEC aplica ao chip "Sem validade" na fila (5.4). O título leva o ícone do estado, e o status continua com cor, ícone e rótulo. A urgência entre as linhas vem da distância ("vence em 4 dias").

### Não faz

- Não cria rota de histórico de movimentações (fora da SPEC)
- Não marca aviso como lido no servidor (fora da SPEC)

## Critérios de aceite

- [ ] Home com quatro blocos: valor em risco, faixa, lista, gráfico; nenhum painel lateral
- [ ] Um único botão cheio na tela
- [ ] Lista só com A vencer, cinco itens, quantidade com unidade
- [ ] Sino abre o menu de avisos em qualquer tela; teclado: abre com Enter, fecha com Esc e volta o foco
- [ ] Nenhum `.glass`, `.notch-tr`, `chart-1..6` no código
- [ ] Toda funcionalidade que saiu da Home tem caminho (tabela da SPEC 5.1)
- [ ] Claro e escuro, 1440, 1366, 768, 360
- [ ] `npm test`, `tsc`, lint
