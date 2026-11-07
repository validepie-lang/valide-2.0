# CLAUDE.md: Valide (Frontend)

Manual operacional do Claude Code neste repositório. Leia por completo antes de escrever qualquer linha de código.

---

## 1. A regra que vem antes de todas

**Este projeto segue uma esteira de produção. Não se começa pelo código.**

```
Ideia → Discovery → PRD → SPEC → Issues → Plan → Execute
      → Validate → Security Review → UX Review → GitHub → Documentação
```

O método completo está em `docs/01-references/workflow.md`. Leia antes de agir.

Regras derivadas, e não negociáveis:

1. **Nunca codar antes de PRD e SPEC** em funcionalidade séria (múltiplos arquivos, regra de negócio, dado sensível, permissão, manutenção futura).
2. **Sempre planejar antes de implementar.** O Plan vem antes do Execute, sempre.
3. **Uma issue por vez.** Terminou uma, para e valida. Não avança sozinho.
4. **Nunca mexer em arquivo fora da lista do plano.** Se aparecer necessidade, pare e atualize o plano.
5. **Pesquisar a base antes de criar.** Se já existe componente, hook ou serviço parecido, reutiliza.
6. **Validar antes de avançar.**
7. **Atualizar a documentação ao terminar.**

**Caminho curto** (Plan, Execute, Validate apenas) vale só para: ajuste de texto, espaçamento, ícone, ou bug pontual com causa já identificada. Nada que mude comportamento ou toque em mais de um arquivo.

---

## 2. O que é o Valide

SaaS multi-tenant que coloca uma camada de controle de validade em cima do estoque que a farmácia já tem.

Farmácias perdem dinheiro porque controlam vencimento em papel. O Valide transforma isso em um painel com estados claros: vencido, a vencer, no prazo, sem validade informada.

**O Valide não substitui o sistema que a farmácia já usa.** Por isso a entrada de dados principal é importar o catálogo existente, não cadastrar produto a produto.

Contexto completo: `docs/00-context/project-overview.md`

---

## 3. Escopo desta pasta

O repositório é compartilhado pelos três. Esta pasta, `frontend/`, é **somente frontend**. O backend do Pedro fica em `backend/`, o banco do Antônio em `banco/`, e nada fora de `frontend/` é editado a partir daqui.

### Regras duras

1. **Não crie backend.** Nada de rota de API do Next que persista dado, servidor Express, ou conexão com banco.
2. **Não crie schema, migration, ORM ou query SQL.**
3. **Não invente autenticação real.** Login é tela e sessão mockada até o endpoint existir.
4. Quando algo depender de dado do servidor: adicionar a função na camada de serviço com mock tipado e registrar o endpoint em `docs/01-references/api-contract.md`. Nunca implementar o servidor.
5. **Se uma tarefa exigir backend, pare e avise.** Não improvise.

### Thin Client, Fat Server

O front captura intenção e exibe resposta. Regra crítica, permissão, cálculo sensível e isolamento entre contas ficam no servidor. Isso não é só boa prática aqui, é a divisão de trabalho da equipe.

---

## 4. Stack

Next.js (App Router), TypeScript estrito, Tailwind com tokens em CSS variables, shadcn/ui, lucide-react, Recharts. Deploy na Vercel. npm.

Não adicionar biblioteca sem justificar em uma linha no commit. Não trocar Tailwind por CSS-in-JS. Não instalar biblioteca de UI concorrente.

Detalhes: `docs/01-references/architecture.md`

---

## 5. Cor: a regra que não se negocia

Paleta completa em `docs/01-references/design-system.md`.

### Regra 1. As cores de status são semânticas e fixas

| Status | Sólido | Fundo do chip | Texto do chip |
| --- | --- | --- | --- |
| Vencido | `#D64545` | `#FBE7E7` | `#B23A3A` |
| A vencer | `#E0A020` | `#FCEEDB` | `#8A610D` |
| No prazo | `#3C9D53` | `#E7F5EA` | `#2F7D46` |
| Sem validade | `#9FAEB8` | `#F1F3F5` | `#5C6F7C` |

Vermelho, amarelo e verde só comunicam validade. Nunca botão, badge, gráfico decorativo ou fundo de card.

**Uma exceção, e só uma (08/10):** erro que impede o usuário de continuar (campo inválido, login recusado, linha da importação que não entra) usa vermelho, pelo token `--error`, que aponta para os mesmos valores de `--status-expired`. Nunca um segundo vermelho. Vermelho quer dizer "problema que exige ação". Aviso e sucesso são neutros, e botão destrutivo continua neutro.

### Regra 2. Produto sem lote nunca aparece como verde

Confundir "não sei a validade" com "está no prazo" dá ao usuário uma segurança que ele não tem. É o pior erro que esta interface pode cometer. O contador de "No prazo" nunca inclui produto sem lote.

### Regra 3. A cor da marca nunca ocupa o papel de status

Cobalto (Ardósia até 10/10, Petróleo por um dia em 11/10) é ação primária, link, chip de filtro ativo, barra de progresso, ícone de destaque. A cor de assinatura (lavanda, `--signature`) só aparece sobre superfície escura (trilho, cartão cheio, painel do login), nunca ao lado de chip de status.

### Regra 4. Zero hex solto

Sempre token (`bg-surface`, `text-fg-muted`, `bg-status-expired`). Se falta um token, ele entra no design system primeiro.

### Regra 5. Status nunca só por cor

Sempre cor **mais** ícone **mais** rótulo.

---

## 6. Idioma e escrita

- **Código em inglês:** variável, função, componente, arquivo, tipo, commit
- **Interface em português do Brasil**
- **Rota em português**, porque o usuário vê na barra de endereço
- **Nunca use travessão (em-dash)** em texto nenhum. Use vírgula, dois pontos, parênteses ou ponto
- Sem jargão técnico na interface: nada de tenant, endpoint, sincronizar, instância
- Sem tom robótico: nada de "Ops!", nada de "Algo deu errado"
- Botão diz o que acontece: "Salvar produto", nunca "OK"
- Erro diz o que fazer: "Não foi possível salvar o produto. Verifique a conexão e tente de novo."
- Vocabulário fixo de status: **Vencido, A vencer, No prazo, Sem validade**. Sem sinônimo, nunca

---

## 7. Estrutura

```
src/
  app/
    (auth)/          login, cadastro de empresa
    (app)/           área logada, com shell de navegação
  components/
    ui/              primitivos shadcn customizados
    layout/          shell, navegação, cabeçalho
    dashboard/       cards de indicador, gráficos
    products/        tabela, formulário, baixa
    import/          wizard, mapeamento, revisão
  lib/
    services/        camada de dados
    mocks/           dados fake tipados
    types/           tipos do domínio
    utils/           expiry, format, cn
docs/
  00-context/  01-references/  02-prd/  03-specs/
  04-issues/   05-plans/       06-validations/
  07-decisions/  08-project/
```

- Arquivo em `kebab-case`, componente em `PascalCase`
- Componente com mais de 200 linhas deve ser quebrado
- Server Component por padrão. `"use client"` só com estado, evento ou hook de browser

---

## 8. Camada de dados

Todo acesso a dado passa por `src/lib/services/`. **Nenhuma tela importa mock diretamente.**

```ts
export async function getProducts(filters?: ProductFilters): Promise<Paginated<Product>> {
  return mockGetProducts(filters) // TODO: trocar por fetch quando a API existir
}
```

Todo endpoint consumido está em `docs/01-references/api-contract.md`. Manter esse documento desatualizado é o erro mais caro do projeto: ele é o que o Marcus entrega ao Pedro.

**Toda tela trata quatro estados:** carregando, vazio, erro e sem permissão. Tela que só trata o caminho feliz não está pronta.

---

## 9. Acessibilidade mínima

- Contraste AA: 4.5:1 para corpo, 3:1 para texto grande
- Status com cor mais rótulo ou ícone
- Todo input com `<label>` associado
- Fluxo essencial navegável por teclado. Na fila de validades, isso é obrigatório: quem preenche 400 itens não usa mouse
- Alvo de toque de 44px em mobile

---

## 10. Responsividade

Três larguras: **360px**, **768px**, **1440px**.

Desktop é o cenário principal (balconista no computador do caixa). O dono da farmácia consulta o dashboard no celular. Tabela no mobile vira lista de cards, nunca scroll horizontal. **Uma exceção (12/10, issue 068, decisão do Marcus):** a tabela do Estoque rola para o lado no celular, com a coluna do produto parada, uma dica "Arraste a tabela para o lado" e a região com foco de teclado. As outras tabelas continuam virando lista.

---

## 11. Definition of Done

Uma issue só está pronta quando:

1. Cumpriu o plano, sem tocar em arquivo fora da lista
2. Zero hex solto
3. Trata carregando, vazio, erro e sem permissão
4. Funciona em 360px, 768px e 1440px
5. Funciona em tema claro e escuro
6. Fluxo principal navegável por teclado
7. Textos em português, sem travessão, com o vocabulário fixo
8. `npx tsc --noEmit` sem erro e lint sem warning
9. Endpoints registrados no contrato de API
10. Security Review e UX Review passaram
11. Validação registrada em `docs/06-validations/`
12. Documentação atualizada

---

## 12. Commits

`tipo: descrição curta em inglês`

Tipos: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`

Exemplo: `feat: add expiry status chip component`

**Uma issue, um commit.** Commit que junta três issues destrói a rastreabilidade que a esteira construiu.

Nunca comitar `.env`, segredo, ou `node_modules`.

---

## 13. Decisões fechadas

Registro completo em `docs/07-decisions/`.

- Janela de "a vencer": **30 dias**, configurável por conta. Constante em `src/lib/utils/expiry.ts`
- Status de validade calculado pelo backend. O front calcula localmente só para feedback no formulário
- Dinheiro em **centavos, inteiro**. Nunca float
- Dashboard em uma chamada agregada, `GET /dashboard`
- Paginação por offset
- Entrada de dados por importação de catálogo, com cadastro manual como caminho secundário
- Importação por arquivo construída antes da integração por API
- **A integração com o sistema da farmácia saiu do escopo do piloto (17/09).** Duas origens: planilha e cadastro manual. Volta como projeto futuro
- **Linguagem visual da referência MT (07/10), revista em 08/10:** ficam um matiz azul-ardósia e o trilho lateral escuro; saem vidro, recorte de canto, degradê, ícone em quadrado e caixa alta. Ver `design-system.md` seções 12 e 14
- **Hierarquia (08/10):** um elemento de nível 1 e uma ação primária por tela; indicador sempre no componente `Metric`; gráfico com base neutra e destaque pontual. SPEC em `docs/03-specs/redesign-hierarquia.md`
- **Tipografia (08/10):** Inter na interface, com algarismos tabulares em número (nunca em código como lote ou SKU); Mona Sans só em título de página e no número herói (`font-display`)
- **Paleta Cobalto sobre papel (11/10, issue 064):** substitui o petróleo da 061, que o Marcus não aprovou ao ver publicado. Tinta cobalto `#1a3a8f`, fundo de papel `#f5f4f0`, assinatura lavanda `#b7c8ff` só sobre o escuro. Fonte, logo e composição da 061 continuam
- **Identidade Petróleo (11/10, issue 061):** a paleta passa de azul-ardósia para petróleo com fundo de papel menta e menta só sobre o escuro; uma família tipográfica só, Instrument Sans, no lugar de Inter e Mona Sans; cartões de estado sem a faixa no topo e, na Home, 2 por 2. Pesquisa e números em `docs/04-issues/061-identidade-petroleo.md`. Substitui as linhas de paleta e tipografia acima e a faixa no topo do cartão de estado da direção A, abaixo. Logo definido em 11/10 (issue 062): o V de validar com três barras que diminuem, em `src/components/layout/logo.tsx` e `src/app/icon.svg`
- **Farmácia parceira (11/10):** Farmácia Preço Popular. É também o nome da farmácia nos dados de exemplo; CNPJ, razão social, endereço e e-mail do exemplo continuam fictícios até chegarem os reais
- **Direção visual A, "Painel de controle" (09/10):** card com sombra curta sobre o fundo; status com presença em três formas só (faixa no topo do cartão de estado, barra à esquerda da linha, fundo tingido nos cartões urgentes); Mona Sans negrito também no título de card e no número dos cartões de estado; semanas dentro da janela de A vencer em âmbar no gráfico. Mexe na força visual, não na hierarquia de 08/10. SPEC em `docs/03-specs/direcao-visual-a.md`, resumo em `design-system.md` seção 15

---

## 14. Decisões pendentes

Não invente resposta. Pergunte.

- **Regra de duplicata na importação.** Bloqueia a tela de revisão
- **Comportamento na reimportação** quando um produto some da origem
- **Limite de linhas por importação**

Acompanhamento: `docs/08-project/pauta-reuniao.md`

---

## 15. Quando parar e avisar

Pare, em vez de improvisar, se a tarefa exigir:

- Criar backend, banco ou autenticação real
- Guardar credencial no cliente
- Colocar regra crítica de negócio no frontend
- Permitir que o cliente escolha a conta
- Contornar uma verificação de permissão
- Decidir algo que está na lista de pendências acima
- Mexer em arquivo fora do plano aprovado

Nenhuma dessas é problema de implementação. Todas são conversa com o Marcus ou com a equipe.
