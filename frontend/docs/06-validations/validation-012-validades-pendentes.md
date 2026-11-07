# Validação: Issue 012 - Validades pendentes

**Issue:** `docs/04-issues/012-validades-pendentes.md`
**Plano:** `docs/05-plans/plan-012-validades-pendentes.md`
**Data:** 09/10/2026
**Resultado:** passou

## Antes e depois

| | Antes | Depois |
| --- | --- | --- |
| 1440 | `redesign-hierarquia/antes/validades-pendentes-1440.png` | `redesign-hierarquia/depois/validades-pendentes-1440.png` |
| 360 | `redesign-hierarquia/antes/validades-pendentes-360.png` | `redesign-hierarquia/depois/validades-pendentes-360.png` |
| Escuro | | `redesign-hierarquia/depois/validades-pendentes-1440-escuro.png` |
| Fim da fila | | `redesign-hierarquia/depois/validades-pendentes-fim-da-fila-1440.png` |

Antes: o maior elemento da tela era "0 de 18", em 36px, num card ao lado. Depois: o nome do produto em foco é o maior texto depois do título, e o progresso é uma linha sob o título.

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Nome do produto em foco é o maior texto depois do título | passou | Capturas |
| Progresso e valor parado atualizam; pular não conta | passou | Chrome controlado por script: "0 de 18 · R$ 10.060" → lote e data preenchidos, Enter → "1 de 18 · R$ 8.767" (o Cetaphil valia R$ 1.293,60) → "Pular este" → continua "1 de 18 · R$ 8.767" |
| Nada com informação em `fg-disabled` | passou | Valores da lista "A seguir" em `fg-muted`. Ver ressalva sobre placeholder abaixo |
| Teclado: Enter salva, foco volta ao lote | passou | Mesmo teste: `document.activeElement` é o campo do lote depois do Enter e depois de pular |
| Fila concluída sem verde | passou | Ícone neutro; o foco vai para o título |
| Claro, escuro, 1440, 1366, 768, 360, sem rolagem horizontal | passou | Emulação em 360 sem erro de console |
| `npm test`, `tsc`, lint | passou | 57 testes, zero erro, zero aviso |

## Corrigido durante a validação

**Texto falso no fim da fila.** Pulando todos os produtos, a tela dizia "Você informou a validade de 0 produtos e deixou 18 para depois. Agora o painel consegue acompanhar esse estoque." Agora são três finais: tudo preenchido ("Fila concluída"), parte pulada (diz que os pulados continuam na fila) e tudo pulado ("Fim da fila", sem dizer que o painel acompanha). Afirmar que o painel acompanha um estoque sem validade é o mesmo erro de mostrar verde onde não há dado.

## Ressalva para a issue 015

O texto de exemplo dentro dos campos (`placeholder`) usa `fg-disabled`, com contraste perto de 2,4:1, em todos os formulários. O WCAG trata placeholder como texto. Não é desta tela: é do componente `Input`, e entra na passada das demais telas.

## Fora do plano

Nenhum arquivo fora da lista. O formulário caiu de 224 para 189 linhas.

## Security Review

Sem dado sensível, permissão ou credencial.

## UX Review

- [x] Uma pergunta, uma ação primária ("Salvar e ir para o próximo")
- [x] Produto em foco no nível 1, progresso no nível 3
- [x] Navegação por teclado preservada
- [x] Estado final reconhece sem exagero e sem afirmar o que não aconteceu
- [x] Sem travessão
