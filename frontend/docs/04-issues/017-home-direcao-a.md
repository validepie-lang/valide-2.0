# Issue 017: Home na direção visual A

**Origem:** canvas "Valide: direções visuais" (https://claude.ai/artifact/RLXcrJF58R4R5ih9H2qR49), direção A escolhida pelo Marcus em 09/10/2026
**Status:** executada e publicada às pressas para uma apresentação; SPEC da direção ainda a escrever
**Etapa da esteira:** caminho curto aprovado pelo Marcus ("já pode colocar e subir pra produção")

## Objetivo

O Marcus achou o visual pós-redesign "péssimo, muito fraco": sem cor, inacabado, sem identidade, tipografia fraca. Das três direções do canvas, escolheu a A, "Painel de controle".

## O que mudou

- `Card` ganha sombra curta (`shadow-card`) para separar do fundo. Vale para todas as telas
- Tokens novos: `--elevation-card`, `--status-expired-tint`, `--status-soon-tint`, `--chart-soon`, `--chart-soon-focus`; `--text-hero` de 48 para 60px
- Home: cabeçalho com a data e o nome da farmácia; valor em risco num card com a divisão entre vencidos e a vencer; quatro cartões de status com faixa de cor no topo e fundo tingido nos dois urgentes; lista nova "Retirar da prateleira" (vencidos) ao lado de "Vencem nos próximos 30 dias"; gráfico com as semanas dentro da janela em âmbar

## Decisões revistas

- **Sombra em card estático** (14.6 do design system, 08/10): volta, curta. O card sem sombra se confundia com o fundo
- **Gráfico sem cor de status** (14.5, 08/10): a semana dentro da janela de 30 dias é âmbar porque os lotes dela são A vencer. Fora dela, a base neutra

## Falta

- SPEC da direção A e a passada nas outras 12 telas, uma issue por vez
- Esqueleto de carregamento da Home ainda no desenho antigo
- `design-system.md` seções 14.5 e 14.6 a atualizar junto com a SPEC
