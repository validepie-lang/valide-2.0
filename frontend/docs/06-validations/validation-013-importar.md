# Validação: Issue 013 - Importar

**Issue:** `docs/04-issues/013-importar.md`
**Plano:** `docs/05-plans/plan-013-importar.md`
**Data:** 09/10/2026
**Resultado:** passou

## Antes e depois

Capturas em `redesign-hierarquia/antes/` e `redesign-hierarquia/depois/`.

| Passo | Antes | Depois |
| --- | --- | --- |
| Origem | `importar-1440.png`, `importar-360.png` | `importar-1440.png`, `importar-360.png` |
| Mapear | | `importar-mapear-1440.png` |
| Revisar | `importar-revisar-1440.png`, `importar-revisar-360.png` | `importar-revisar-1440.png`, `importar-revisar-1024.png`, `importar-revisar-360.png`, `importar-revisar-1440-escuro.png` |
| Resultado | `importar-resultado-1440.png` | `importar-resultado-1440.png`, `importar-resultado-360.png` |

- **Origem:** antes eram três cards, com "Escolher arquivo" secundário e um "Como funciona" repetindo as etapas que estavam logo acima. Agora é uma coluna, com uma ação primária e o cadastro manual como link.
- **Revisar:** antes eram três cards de indicador, o 14 em amarelo e as linhas com erro pintadas de rosa. Agora são três números direto na página e o vermelho fica só no ícone e no texto da linha que não entra.
- **Resultado:** antes tinha quadrado verde, barra parada em 98% e bloco escuro com degradê e sombra. Agora é uma confirmação neutra e uma seção com o botão primário.

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Uma ação primária por passo | passou | Capturas: Escolher arquivo, Continuar para a revisão, Importar 800 produtos, Começar a informar validades |
| Sem amarelo ou verde; vermelho só na linha que não entra | passou | HTML renderizado da revisão: nenhuma classe `status-soon` ou `status-ok` no conteúdo |
| Sem fundo colorido na linha; nada com informação em `fg-disabled` | passou | Mesmo HTML: zero `bg-error-bg`, zero `bg-status-expired-bg`, zero `text-fg-disabled`. "sem nome no arquivo" e "Ignorar" passaram para `fg-muted` |
| Etapa atual sublinhada, distinta de chip e aba | passou | Só Origem e Mapear são links na revisão; a atual tem `aria-current="step"`; a concluída diz "concluída" ao leitor de tela |
| Revisão em 360 sem rolagem horizontal, ação visível | passou | Emulação: documento com 360 de largura, sem erro de console; cada item mostra Criar, Atualizar ou Ignorar |
| Claro, escuro, 1440, 1366, 1024, 768, 360 | passou | `capturar.sh`, `capturar-celular.mjs` e capturas em 1366 e 1024 |
| `npm test`, `tsc`, lint | passou | 57 testes, zero erro, zero aviso |

## Corrigido durante a validação

- **"Importar  800  produtos" com espaço duplo.** O botão põe espaço entre os filhos, e o número com algarismo tabular virou um filho à parte. O texto agora vai num único `span`.
- **Tabela espremida em 768.** O nome do produto quebrava em três linhas e o aviso em seis. A tabela agora só aparece a partir de `lg` (1024); abaixo dessa largura a revisão é lista.
- **Frase repetida no resultado.** A seção começava com "Seus produtos entraram", que é a descrição da página logo acima.
- **Script de captura no celular.** O `capturar-celular.mjs` separava `nome=url` em todos os `=` e perdia o `?passo=`. Agora separa só no primeiro.

## Textos que prometiam o que não existe

| Antes | Depois | Por quê |
| --- | --- | --- |
| "Desmarque qualquer linha que não deva entrar" | sai | Não existe caixa de marcar. Desmarcar depende do contrato |
| "Até 5.000 linhas por envio" | "CSV ou Excel (XLSX)" | O limite ainda não foi decidido (pauta 2.3) |
| "Não entram até você resolver" | "Ficam de fora desta importação" | Não há como resolver nesta tela; a correção é pela lista de erros no fim |

## Fora do plano

Nada. O `capturar-celular.mjs` é ferramenta da skill de design, não código do produto.

## Para depois

- Filtrar e desmarcar linhas na revisão estão no `screen-map.md` e nunca foram construídos. Desmarcar precisa de campo novo no contrato. Fica como ponto para o Pedro
- No Mapear em 360, o campo de seleção não ocupa a largura toda. A SPEC manda não mudar a estrutura desse passo; fica para a 015
