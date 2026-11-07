---
name: design-valide
description: Direção visual e auditoria de layout do Valide: hierarquia em três níveis, padrão único de dado, linguagem revista em 08/10. Use ao desenhar ou refazer o visual de qualquer tela, ao revisar se algo está assimétrico, desalinhado, bagunçado ou quebrando no celular, e antes de dizer que uma mudança visual está pronta.
---

# Design do Valide

Esta skill existe porque "capricha no visual" não vira tela boa sozinho. Vira tela boa quando cada decisão é verificável e quando alguém **olha a tela renderizada** em três larguras antes de dizer que terminou. Ler o código não pega assimetria.

## Leia antes

1. `docs/01-references/visual-ref/README.md`: a referência MT e o que levamos e descartamos
2. `docs/01-references/design-system.md`: seções 2 (status), 13 (grade e simetria) e **14 (hierarquia e padrão de dados, a que manda)**
3. `docs/03-specs/redesign-hierarquia.md`: a pergunta, o nível 1 e a ação primária de cada tela
4. `CLAUDE.md`, seção 5: as regras de cor que não se negociam

## A linguagem, em uma tela

- **Três níveis de leitura, um nível 1 por tela.** Teste dos dois segundos: olhou, desviou, sabe dizer o número mais importante? Hierarquia por tamanho, peso, espaço e posição. Cor por último.
- **Uma ação primária por tela**, botão cheio. O resto é contorno ou link.
- **Um matiz só**, azul-ardósia. As únicas cores saturadas são as de validade, e o vermelho também marca erro que impede continuar (`--error`, mesmo vermelho). Aviso e sucesso são neutros.
- **Indicador sempre em `Metric`:** rótulo 13px `fg-muted`, número, contexto 13px. Sem ícone em quadrado, sem fundo, número nunca colorido.
- **Gráfico:** base `chart-base`, destaque `chart-focus` só onde o dado pede, valor escrito na barra, título com a conclusão. Sem rosca.
- **Menos contêiner.** Card (14px, borda, sem sombra) só para o que é clicável, tabela, lista e formulário. Indicador e gráfico ficam na página, sob título de seção. Sombra só em camada flutuante.
- **Inter na interface, Mona Sans (`font-display`) só no título e no herói.** `.tnum` em número; nunca em código com hífen (lote, SKU, CNPJ).
- **Data de validade em dd/mm/aaaa**, como na embalagem. Dinheiro em indicador sem centavos.
- **Trilho escuro** à esquerda no desktop, barra escura embaixo no celular.

## Regras de grade e simetria

Estas saíram de defeitos reais encontrados na auditoria de 07/10/2026.

0. **Antes da grade, a hierarquia.** Se dois blocos têm o mesmo peso e nenhum domina, simetria não salva a tela.
1. **Tudo começa na margem do título.** Nada centralizado com `mx-auto max-w-*` dentro da área logada, exceto estado vazio. A fila de validades estava centralizada e o título não.
2. **Coluna curta não termina antes da metade da longa.** Se termina, o conteúdo está mal distribuído: junte cards soltos numa ficha só, ou suba um resumo para uma faixa no topo. Foi o caso do detalhe do produto.
3. **Cards da mesma linha têm a mesma altura** (`h-full` no card, grade sem `items-start`), a não ser que sejam colunas independentes; aí `lg:items-start` e nada de esticar card para preencher.
4. **Linha de chips nunca quebra.** Se não cabe, rola na horizontal dentro do próprio trilho (`overflow-x-auto`, `shrink-0`, `whitespace-nowrap`). Chip sozinho numa segunda linha é o sinal mais claro de tela bagunçada.
5. **Rótulo nunca é truncado** em bloco de indicador. Se não cabe, o ícone sobe para cima dele.
6. **Controle que parece clicável funciona.** Se ainda não funciona, não pode parecer botão.
7. **Painel de duas colunas é grade em linhas, não duas colunas soltas.** Cada linha com a mesma altura dos dois lados, e os cards esticam (`h-full`, conteúdo que cresce com `flex-1` e `mt-auto` no rodapé). Com colunas soltas, nenhuma borda da direita alinha com a esquerda e a tela parece torta, mesmo com cada card certo. A Home do Valide caiu nisso em 07/10.
8. **Hover não move bloco que está em fileira.** Levantar um bloco 2px no hover parece desalinhamento numa captura ou numa demonstração. Use cor de fundo e borda.
9. **Confira também em 1024 e 1280**, não só nas três larguras do `CLAUDE.md`. É onde a grade de 12 colunas aperta: a Home só divide em duas colunas a partir de `xl`.
10. **Texto que cita a interface acompanha a interface.** "O botão no topo" deixou de ser verdade quando o tema foi para o trilho.

## Regras de responsividade

| Situação | Regra |
| --- | --- |
| Item de flex em coluna com texto que não quebra | `min-w-0`, senão a página estoura 360 |
| Ações do cabeçalho de página | abaixo de `sm`, cada botão na largura inteira (`PageHeader` já faz) |
| Tabela | abaixo de `lg`, vira lista de cards. Nunca rolagem horizontal da página |
| Etapas de assistente | abaixo de `sm`, "Etapa 1 de 4" com barra segmentada |
| Ações de linha (renomear, excluir) | abaixo de `sm`, só ícone com `aria-label`, alvo de 44px |
| Duas colunas na Home | no celular viram uma, na ordem de importância (`contents` + `order-*`) |

## Auditoria: como olhar de verdade

Com o servidor rodando em `localhost:3000`:

```bash
S=.claude/skills/design-valide/scripts
$S/capturar.sh /tmp/auditoria / /estoque /estoque/p1        # 1440 claro e escuro, 768, 360
$S/prancha.sh /tmp/auditoria /tmp/auditoria/celular.png 6 240 home-360.png estoque-360.png estoque_p1-360.png
```

Depois leia as pranchas com a ferramenta de imagem. Seis telas de celular por prancha, duas de desktop.

**Celular: use a emulação, não o iframe.**

```bash
node $S/capturar-celular.mjs /tmp/auditoria 360 estoque-360.png=http://localhost:3000/estoque home-360.png=http://localhost:3000/
```

Captura a página inteira em 360 por emulação do Chrome, lista erro de console e avisa se o documento ficou mais largo que a tela. O `capturar.sh` ainda faz 360 por iframe, mas o iframe já travou uma tela no carregamento e não desenha o Recharts: confirme em `capturar-celular.mjs` antes de chamar algo de defeito.

**Armadilhas conhecidas da captura:**

- O Chrome no macOS não abre janela abaixo de ~500px. Por isso a emulação.
- **Iframe engana.** Tela presa no esqueleto ou gráfico vazio em 360 dentro do iframe não é defeito até ser confirmado pela emulação.
- **Painel que abre no clique** (menu, filtro) não aparece em captura estática. Teste com o Chrome controlado por script (`Input.dispatchKeyEvent` com `text: "\r"` para o Enter acionar botão).
- Sem `--blink-settings=preferredColorScheme=1`, o headless renderiza no escuro.

**Checklist de cada tela, nas três larguras:**

- [ ] Existe um elemento dominante? Qual?
- [ ] Tudo alinhado à margem do título?
- [ ] Alguma coluna termina muito antes da outra?
- [ ] Algum chip, botão ou rótulo quebrou de linha ou foi cortado?
- [ ] A página rola na horizontal em 360?
- [ ] Alguma cor fora do matiz que não seja de validade?
- [ ] Algum controle parece clicável e não faz nada?
- [ ] Algum texto descreve a interface de um jeito que não é mais verdade?
- [ ] Tema escuro: algum card sumiu no fundo, algum texto perdeu contraste?

Registre o que achar como tabela de inventário (onde, problema, correção), no formato de `docs/04-issues/004-acabamento-visual-e-mobile.md`. Corrija, **fotografe de novo** e só então diga que terminou.

## O que dá cara de interface gerada

Visto e removido neste projeto. Não traga de volta. Lista completa em `design-system.md` seção 14.9.

- Muitos blocos do mesmo peso, sem um dominante. Foi o defeito central da Home até 08/10
- A mesma contagem repetida em três lugares da mesma tela
- Ícone em círculo ou quadrado colorido em todo item, ou o mesmo ícone em toda linha
- Vidro, degradê, recorte de canto, sombra em todo card, raio grande. Vieram da referência MT e saíram em 08/10: referência de portfólio traz enfeite, leve a estrutura
- Rótulo em caixa alta espaçada
- Texto de apoio que repete o título
- Aba, chip e etapa com o mesmo desenho
- Faixa colorida no topo de cada card
- Botão ou chip que não faz nada
- Valor redondo e "Produto 1" em dado de demonstração (ver skill `mock-farmacia`)
- Ícone sem rótulo na navegação
