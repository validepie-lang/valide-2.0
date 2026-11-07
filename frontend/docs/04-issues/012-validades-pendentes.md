# Issue 012: Validades pendentes

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seção 5.4
**Status:** executada e validada
**Depende de:** 006, 007
**Etapa da esteira:** 5 de 12

---

## Objetivo

Tela de trabalho repetitivo: quem preenche 18 ou 400 produtos precisa ver o produto em foco e os três campos antes de tudo. Hoje o maior elemento da tela é o "0 de 18" do painel lateral, em 36px, maior que o nome do produto que se está preenchendo.

## Escopo

### Faz

- **Progresso em uma linha discreta sob o título**, com barra fina: "3 de 18 preenchidos · R$ 8.412 ainda parados". O valor diminui conforme a fila anda, porque é o que ainda não está sendo acompanhado
- **Nível 1: o produto em foco**. Nome primeiro, em `section`; abaixo, código, pasta e marca; depois estoque e valor parado. Os três campos, a prévia da situação, os botões e a dica de teclado continuam como estão
- **"A seguir" sem card**, como lista simples ao lado no desktop e abaixo no celular, com o valor em `fg-muted` (era `fg-disabled`, cerca de 2,4:1)
- **Sai** o chip "Sem validade" do produto em foco (todo item da fila é Sem validade), o número de 36px, a frase que repetia a descrição da página, e o recuo errado da lista (o `md:p-6` do `Card` vencia o `p-0`)
- **Fila concluída** com ícone neutro: verde é No prazo, não "terminou"
- Estoque atual no campo de quantidade com unidade ("Estoque atual: 14 un")
- Esqueleto de carregamento novo
- O formulário passa de 224 para menos de 200 linhas: progresso, "A seguir" e fila concluída em arquivos próprios

### Não faz

- Não muda o comportamento: Enter salva e avança, Tab entre campos, foco volta ao lote
- Modo tabela continua sendo o estoque filtrado em Sem validade (fora da SPEC)

## Critérios de aceite

- [ ] O nome do produto em foco é o maior texto depois do título da página
- [ ] O progresso e o valor parado atualizam a cada "Salvar e ir para o próximo" e "Pular este" (pular não conta como preenchido)
- [ ] Nenhum texto com informação em `fg-disabled`
- [ ] Teclado: Enter salva e avança; o foco volta ao campo do lote
- [ ] Fila concluída sem verde
- [ ] Claro e escuro, 1440, 1366, 768, 360, sem rolagem horizontal
- [ ] `npm test`, `tsc`, lint
