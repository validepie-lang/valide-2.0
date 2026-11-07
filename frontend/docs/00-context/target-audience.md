# target-audience.md: Para quem estamos construindo

Este documento existe para uma decisão prática: toda vez que houver dúvida sobre densidade de informação, tamanho de fonte, escolha de palavra ou quantidade de cliques, a resposta vem daqui.

---

## Quem usa, no dia a dia

### Balconista ou responsável pelo estoque (cargo Balconista)

O usuário que mais abre o sistema.

- Usa no computador do caixa, muitas vezes uma máquina antiga, tela pequena, resolução baixa
- Está em pé, com fila esperando, e o sistema é interrupção do trabalho real
- Não tem familiaridade com software além do sistema de PDV que já usa
- Faz as mesmas duas ou três ações repetidamente: consultar, dar baixa, cadastrar entrada
- **Não vai ler instrução, tutorial ou texto de ajuda.** Se a tela não for óbvia, ele desiste e volta ao papel

**O que isso exige da interface:**

- Ação principal sempre visível, nunca escondida em menu
- Fluxo de baixa em poucos cliques, com o lote correto já sugerido
- Navegação por teclado no que é repetitivo, porque quem preenche 400 itens não usa mouse
- Alvo de clique generoso
- Confirmação antes de ação destrutiva, porque erro no balcão acontece

### Farmacêutico ou proprietário (cargos Farmacêutico e Administrador)

Abre menos, mas é quem decide se o sistema fica ou sai.

- Quer saber quanto está perdendo, em reais, e o que fazer a respeito
- Consulta no celular fora do balcão, à noite, no fim de semana
- Pensa em dinheiro e em risco, não em funcionalidade
- É quem assina a assinatura e quem cancela

**O que isso exige da interface:**

- O número que importa em destaque: valor parado em produtos vencidos e a vencer
- Dashboard legível no celular de verdade, não só "responsivo no papel"
- Caminho direto do número para a ação: clicar no indicador leva para a lista filtrada

### Gestor de rede ou franquia

Fora do escopo desta versão. Consulta dados consolidados entre contas. Registrado aqui porque a arquitetura multi-tenant já precisa comportar isso.

---

## Quem se beneficia sem usar

**Cliente final da farmácia.** Menos perda por vencimento significa mais disponibilidade de produto e preço mais competitivo. Aparece no discurso do projeto de extensão e no pitch comercial.

---

## O que este público não é

Não são usuários de produto de tecnologia. Isso significa:

| Não fazer | Fazer |
| --- | --- |
| Jargão técnico: sincronizar, instância, endpoint, tenant | Palavra do balcão: produtos, lotes, conta da empresa |
| "Ops! Algo deu errado" | "Não foi possível salvar o produto. Verifique a conexão e tente de novo." |
| Ícone sozinho, sem rótulo | Ícone com rótulo |
| Tela densa, tudo de uma vez | Uma pergunta por tela |
| Tutorial e onboarding longo | Interface que dispensa explicação |
| Cor como único sinal | Cor mais ícone mais texto |

---

## Contexto de uso que muda decisões de design

**Ambiente barulhento e com interrupção.** O usuário sai da tela no meio da tarefa e volta depois. Formulário longo precisa preservar o que foi digitado.

**Máquina fraca e conexão instável.** Tela pesada, animação e carregamento longo derrubam a experiência. Estado de carregando precisa ser skeleton, não spinner solto que parece travamento.

**Aversão a mudar de ferramenta.** A farmácia já tem sistema e já tem processo, mesmo que em papel. O Valide precisa provar valor na primeira semana ou vira mais uma aba aberta que ninguém abre.

**Trabalho de preenchimento inicial.** Depois de importar o catálogo, o cliente enfrenta centenas de validades em branco. Essa é a hora em que ele desiste, se a interface não conduzir. Ver `01-references/import-strategy.md`.

---

## O teste que vale para qualquer tela

Um balconista que nunca viu o sistema consegue, sem perguntar nada a ninguém:

1. Descobrir o que está vencendo
2. Dar baixa em um produto
3. Entender o que fazer quando algo dá errado

Se a resposta for não para qualquer um dos três, a tela não está pronta.
