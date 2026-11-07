# Validação: Issue 025 - Esqueletos de carregamento e design system na direção A

**Data:** 09/10/2026
**Resultado:** passou

## Como foi conferido

Esqueleto não aparece sozinho em captura (a tela carrega rápido em dev). Para fotografar, uma rota temporária renderizou cada `loading.tsx` direto; ela foi apagada antes do commit. Capturas em `direcao-a/antes/025` e `direcao-a/depois/025`, comparadas com a tela real da mesma largura.

| Tela | Antes | Depois |
| --- | --- | --- |
| Home | faixa de 4 segmentos, lista sem card, gráfico solto | card do valor em risco, 4 cartões com faixa, duas listas em card com barra, gráfico em card com eixo |
| Detalhe | indicadores soltos, títulos fora do card | cartão de situação com faixa neutra e indicadores dentro; Lotes, Histórico e Ficha em card |
| Validades pendentes | card sem faixa, "A seguir" solto | faixa de Sem validade, "A seguir" em card com rodapé |
| Importar | passo Origem sem card | card com a área de arrastar tracejada sobre `page` |

## Achados durante a validação

- **Rolagem horizontal em 360 na Home** (documento com 409px): os rótulos do eixo do gráfico, oito de 36px, não encolhiam. Corrigido com `min-w-0` nas fatias e espaço menor abaixo de `sm`. Depois: 360
- **Barras do gráfico largas demais:** o servidor de desenvolvimento tinha parado de gerar classes novas depois de um pânico do Turbopack (o perfil do Chrome do `capturar-celular.mjs` foi gravado dentro do projeto, e o Tailwind tentou ler o socket dele). Não era erro de código. Reiniciado o servidor, `max-w-14` passou a valer. **Lição:** a pasta de saída do `capturar-celular.mjs` fica sempre no scratchpad, nunca dentro do `frontend/`

## Checagem

- `npx tsc --noEmit`, lint e `npm test` passam
- Claro e escuro em 1440; 768; 360 sem rolagem horizontal nas quatro telas
