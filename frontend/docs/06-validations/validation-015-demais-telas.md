# Validação: Issue 015 - Demais telas e passada final

**Issue:** `docs/04-issues/015-demais-telas.md`
**Plano:** `docs/05-plans/plan-015-demais-telas.md`
**Data:** 09/10/2026
**Resultado:** passou, com uma ressalva (teste dos dois segundos, abaixo)

## Antes e depois

Capturas em `redesign-hierarquia/antes/` e `redesign-hierarquia/depois/`. As capturas finais de todas as telas em 1366 por 768, com uma prancha das onze, estão em `depois/1366x768/`.

| Tela | Antes | Depois |
| --- | --- | --- |
| Login | `login-1440.png` | `login-1440.png`, `login-1440-escuro.png`, `login-360.png` |
| Cadastro de empresa | `cadastro-empresa-estrutura-1440.png`, `cadastro-empresa-produtos-1440.png` | os mesmos nomes, mais `cadastro-empresa-estrutura-360.png` |
| Cadastro de produto | `novo-produto-1440.png` | `novo-produto-1440.png`, `novo-produto-1440-escuro.png`, `novo-produto-360.png` |
| Baixa | `baixa-1440.png` | `baixa-1440.png`, `baixa-360.png` |
| Pastas | `pastas-1440.png` | `pastas-1440.png`, `pastas-360.png` |
| Sem permissão | | `sem-permissao-1440.png` |

## Critérios da issue

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Sem degradê, ícone em quadrado decorativo ou sombra em card estático | passou | Varredura no código. Sobram o fundo do item ativo no trilho e a marca do logo, que são funcionais, e a sombra das camadas flutuantes (menus) |
| Nada com informação em `fg-disabled`; placeholder com 4,5:1 | passou | `fg-disabled` só em controle desabilitado, que o WCAG isenta, e numa seta decorativa marcada `aria-hidden`. Placeholder: 5,68:1 no claro, 6,25:1 no escuro (eram 2,53 e 2,66) |
| Nenhum exemplo que imite valor numérico | passou | Saíram os exemplos de estoque mínimo e máximo, custos, preço e quantidades (cadastro, lote, baixa, fila) |
| Cadastro pede usuário, não e-mail | passou | Captura da etapa 3 |
| Claro, escuro, 1440, 1366, 768, 360 | passou | Emulação em 360 sem erro de console e sem rolagem horizontal |
| `npm test`, `tsc`, lint | passou | 57 testes, zero erro, zero aviso |

## Seção 10 da SPEC, no app inteiro

| Critério | Resultado | Onde |
| --- | --- | --- |
| Um elemento de nível 1 e uma ação primária por tela | passou | Prancha de 1366: Home (valor em risco, "Ver produtos em risco"), Estoque ("Importar produtos"), Produto ("Registrar saída"), Fila ("Salvar e ir para o próximo"), Importar (uma por passo), Configurações ("Salvar alterações"), Login ("Entrar"), Cadastro ("Continuar"), Novo ("Salvar produto"), Baixa ("Registrar saída"), Pastas ("Criar pasta") |
| Teste dos dois segundos com três pessoas | **não feito** | Precisa de gente de fora olhando a captura da Home em 1440. Fica para o Marcus fazer com a equipe ou com a farmácia parceira |
| Todo indicador numérico usa `Metric` | passou | Home, produto, revisão da importação. Os números da baixa ("Como o estoque fica") e do resumo do Mapear são linhas de uma conta, não indicadores |
| Todo gráfico segue a seção 4.5 | passou | Um gráfico só, o da Home (issue 008) |
| Sem vidro, recorte, degradê, ícone em quadrado, `eyebrow`, sombra em card | passou | Varredura no código. As classes saíram do `globals.css` na 006 |
| Vermelho só em Vencido e erro que impede continuar; amarelo e verde só em status | passou | Cor de status só em `StatusChip`, `StatusIcon`, `Metric`, `lot-fields` (prévia do lote) e na lista da Home |
| Texto com informação a 4,5:1 | passou | Ver acima |
| Validade em dd/mm/aaaa; indicador em reais inteiros; quantidade com unidade | passou | Na baixa, "14 disponíveis" e "Disponível neste lote: 14" ganharam a unidade. A única quantidade sem unidade é a da revisão da importação, quando o arquivo não traz a coluna de unidade |
| Coluna numérica à direita, com algarismo tabular | passou | Estoque, lotes, histórico, revisão |
| Toda funcionalidade de antes continua acessível | passou | O que saiu não fazia nada: "Esqueci a senha", "Enviar uma foto", "Enviar logotipo", "Desmarque qualquer linha" |
| Antes e depois em 1440 e 360 | passou | `redesign-hierarquia/` |
| 1366 por 768 | passou | `depois/1366x768/` |
| Claro e escuro | passou | Capturas `-escuro` em cada issue |

## Corrigido durante a validação

- **"Sem permissão" centralizado dentro da coluna.** Sem o card ele ainda ficava no meio, sob um título e abas alinhados à esquerda. O `EmptyState` ganhou `align="start"`, que o `NoPermission` usa.
- **Código quebrado no hífen.** Em 360, o subtítulo da baixa quebrava "MED-1040" em "MED-" e "1040". O código agora não quebra (arquivo que entrou na execução, anotado no plano).
- **Exemplo do nome cortado.** Em 360, o campo cortava "Ex.: Dipirona Sódica 500mg, 20 comprimidos". Ficou "Ex.: Dipirona Sódica 500mg".
- **Saída com hífen.** A saída prevista na baixa aparecia como "- 5". Agora é "−5 un", com o sinal de menos (U+2212), como no resto do app.

## Também mudou

- **Lote vencido na baixa:** dizia "vence em 26/09/2026". Agora diz "venceu em".
- **"vence primeiro" na baixa:** era pílula cheia em cor de ação, competindo com o botão. Agora é texto neutro, como na tabela de lotes.

## Fora do plano

`src/app/(app)/estoque/[id]/baixa/page.tsx`, pelo código que quebrava no hífen. Registrado em "Entrou na execução".

## Para depois

- `exit-form.tsx` tem cerca de 240 linhas, acima das 200 do `CLAUDE.md`. A SPEC manda não mudar a estrutura da baixa. Quebrar o resumo "Como o estoque fica" num componente próprio é o corte natural.
- O botão principal tem `shadow-xs`. A regra fala de card, não de botão, então ficou. Vale decidir junto com a marca.
