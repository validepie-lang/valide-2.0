# architecture.md: Arquitetura do Frontend

---

## 1. Stack

| Camada | Escolha |
| --- | --- |
| Framework | Next.js, App Router |
| Linguagem | TypeScript, modo estrito |
| Estilo | Tailwind CSS com tokens em CSS variables |
| Componentes | Primitivos próprios em `src/components/ui/`, no padrão do shadcn/ui e ligados aos tokens do Valide |
| Ícones | lucide-react |
| Gráficos | Recharts |
| Deploy | Vercel |
| Pacotes | npm |

Não adicionar biblioteca sem justificar em uma linha no commit. Não trocar Tailwind por CSS-in-JS. Não instalar biblioteca de UI concorrente.

**Sobre o shadcn/ui:** o CLI não foi usado. Os primitivos foram escritos neste repositório seguindo a mesma API (variante por prop, `cn()`, `forwardRef`), já ligados aos tokens do Valide. Isso não é desvio de stack, porque shadcn não é biblioteca instalada, é código copiado para dentro do projeto. Quem for criar um primitivo novo segue o padrão dos que já existem em `src/components/ui/`, não roda `shadcn add`. Decisão em `07-decisions/technical-decisions.md`, confirmada em 16/09.

---

## 2. Princípio central: Thin Client, Fat Server

O frontend **captura intenção e exibe resposta**. Regra crítica, permissão, cálculo sensível e isolamento entre contas ficam no backend.

No Valide isso não é só boa prática, é a divisão de trabalho do projeto: o backend é do Pedro, o banco é do Antônio. Se uma tarefa exigir implementar regra de servidor aqui, **pare e avise**.

O que o frontend pode calcular localmente:

- Status de validade **para feedback imediato no formulário**, antes de salvar
- Formatação de moeda, data e quantidade
- Validação de formato: campo obrigatório, data coerente, quantidade positiva
- Estado da interface: filtro ativo, passo do wizard, tema

O que o frontend nunca calcula nem decide:

- O status de validade que vale como verdade (vem da API)
- Se um usuário pode fazer algo (a interface esconde, o servidor bloqueia)
- Totais e agregados do dashboard
- Regra de duplicata na importação

---

## 3. Estrutura de pastas

```
src/
  app/
    (auth)/
      login/
      cadastro-empresa/
    (app)/
      layout.tsx            shell com navegação
      page.tsx              Home / Dashboard
      estoque/
        page.tsx            listagem
        importar/
        validades-pendentes/
        novo/
        [id]/
          page.tsx
          baixa/
        pastas/
      configuracoes/
        page.tsx            perfil
        empresa/
        usuarios/
        integracoes/
  components/
    ui/                     primitivos shadcn customizados
    layout/                 shell, navegação, cabeçalho
    dashboard/              cards de indicador, gráficos
    products/               tabela, formulário, fluxo de baixa
    import/                 wizard, mapeamento, revisão
  lib/
    services/               camada de dados
    mocks/                  dados fake tipados
    types/                  tipos do domínio
    utils/                  expiry, format, cn
  styles/
docs/
```

### Regras de organização

- Um componente por arquivo. Arquivo em `kebab-case`, componente em `PascalCase`
- Componente com mais de 200 linhas deve ser quebrado
- Componente usado em mais de uma tela sobe para `components/`. Usado em uma só pode ficar junto da tela
- Server Component por padrão. `"use client"` só com estado, evento ou hook de browser

---

## 4. Camada de dados

Todo acesso a dado passa por `src/lib/services/`. **Nenhuma tela importa mock diretamente.**

```ts
// src/lib/services/products.ts
export async function getProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  if (isLive("products")) {
    return apiGetList<Product>("/products", { ...filters })
  }
  return mockGetProducts(filters)
}
```

Nenhuma tela sabe de onde o dado veio. Essa é a razão inteira da camada existir.

### A chave é por área, não por projeto

O Pedro entrega em ordem: B24 primeiro, depois B28, depois B27 e B30. Então ligar a API é por área, em `NEXT_PUBLIC_API_LIVE`:

```
NEXT_PUBLIC_API_URL=https://api.valide.app/api/v1
NEXT_PUBLIC_API_LIVE=auth,folders
```

Áreas: `auth`, `products`, `folders`, `dashboard`, `movements`, `notifications`, `imports`, `integrations`. Também aceita `all`. Sem `NEXT_PUBLIC_API_URL` tudo roda com dados de demonstração, então um deploy sem variável configurada não quebra nada.

Modelo em `.env.example`. Nunca commitar `.env.local`.

### O cliente de rede

`src/lib/api/client.ts` concentra tudo que é HTTP:

- Header `Authorization` montado a partir de `getSessionToken()`, um arquivo só, para trocar a origem do token depois sem caçar pelo código
- `cache: "no-store"` sempre. Dado de estoque é por conta, e cache entre requisições seria arriscar uma farmácia ver o que é de outra
- Tempo limite de 15 segundos, com `AbortController`
- Erro vira `ApiError` tipado, com `kind` (`network`, `timeout`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `invalid`, `server`)
- A mensagem exibida vem do `error.message` do contrato, que já chega em português. Se a resposta não seguir o contrato, entra uma mensagem nossa. O detalhe técnico fica no log do servidor, nunca na tela

### Falha essencial contra falha de enfeite

Nem toda falha merece derrubar a tela:

| Situação | Comportamento |
| --- | --- |
| O conteúdo principal da tela falhou | O erro sobe e a fronteira `error.tsx` mostra o que houve, com "Tentar de novo" |
| Um bloco secundário falhou | `optional()` devolve o valor de reserva, e o bloco diz que não carregou |
| A sessão é inválida (401) | Redireciona para o login |

**Serviço chamado dentro de um layout precisa de `optional()`.** `error.tsx` não pega erro de layout: o cabeçalho é renderizado no layout da área logada, então um serviço secundário falhando ali derruba todas as telas de uma vez. Foi exatamente o que aconteceu em teste: o sino de notificações fora do ar devolvia 500 em toda a aplicação.

**O valor de reserva não pode mentir.** Notificações que falharam viram `null`, não lista vazia, porque um painel vazio comunica "nenhuma notificação", que é outra informação. É o mesmo erro de confundir "não sei a validade" com "está no prazo".

### Fluxo de um dado

```
Tela  →  service  →  (hoje) mock   |   (amanhã) fetch na API
                 ←  tipo do domínio
```

### Regras

- Toda função de serviço tem tipo de retorno explícito, nunca inferido
- Todo endpoint consumido está registrado em `api-contract.md`
- Erro de rede vira erro tratado, não exceção solta na tela
- Sem `any`

### A única chamada para fora da API do Pedro: CEP (issue 063)

`src/lib/services/cep.ts` busca o endereço na ViaCEP (`https://viacep.com.br/ws/<cep>/json/`), serviço público e gratuito, direto do navegador. Manda só o CEP, nada da conta nem da sessão. Limite de 5 segundos; falhou, a pessoa digita o endereço. Se um dia a API do Pedro oferecer CEP, a troca é só nesse arquivo.

---

## 5. Estados obrigatórios de tela

Toda tela trata quatro estados. Tela que só trata o caminho feliz não está pronta.

| Estado | O que mostra |
| --- | --- |
| Carregando | Skeleton com a forma do conteúdo, nunca spinner solto |
| Vazio | Ícone, uma frase, e o botão da ação que resolve |
| Erro | O que falhou em português, e um botão de tentar de novo |
| Sem permissão | Explica que o cargo atual não tem acesso, sem beco sem saída |

---

## 6. Estado da aplicação

Escala de escolha, sempre a mais simples que resolve:

1. **Estado local** (`useState`) para o que pertence a um componente
2. **URL** para filtro, busca, paginação e aba ativa. Isso torna a tela compartilhável e sobrevive ao recarregar
3. **Context** para sessão (usuário, conta, cargo) e tema
4. **Server Component** para dado que não precisa de interatividade

Sem Redux, sem Zustand, sem MobX nesta versão. Se o estado ficar complexo a ponto de pedir isso, primeiro reveja se não dá para mover para a URL ou para o servidor.

---

## 7. Roteamento e proteção

- `(auth)` é o grupo público: login e cadastro de empresa
- `(app)` é o grupo protegido, com o shell de navegação
- A guarda de rota verifica a sessão antes de renderizar
- A guarda de cargo esconde o que o Operador não pode acessar

Repetindo, porque importa: **esconder não é bloquear.** O servidor é quem nega.

---

## 8. Tema

- Tokens em CSS variables, com `:root` para claro e `.dark` para escuro
- Tailwind aponta para as variables, nunca para hex
- A preferência do usuário fica em `localStorage`, com o padrão seguindo o sistema
- Toda tela precisa funcionar nos dois temas

---

## 9. Responsividade

Três larguras de referência: **360px**, **768px**, **1440px**.

- Desktop é o cenário principal, o balconista usa no computador do caixa
- O dono da farmácia consulta o dashboard no celular
- Tabela no mobile vira lista de cards, nunca scroll horizontal
- Formulário longo vira coluna única

---

## 10. Convenções de nome

| Coisa | Padrão | Exemplo |
| --- | --- | --- |
| Arquivo de componente | kebab-case | `status-chip.tsx` |
| Componente | PascalCase | `StatusChip` |
| Função e variável | camelCase | `getExpiryStatus` |
| Tipo e interface | PascalCase | `ExpiryStatus` |
| Constante global | SCREAMING_SNAKE | `DEFAULT_SOON_THRESHOLD_DAYS` |
| Rota | kebab-case em português | `/estoque/validades-pendentes` |

Código em inglês. Interface em português do Brasil. Rota em português porque é o que o usuário vê na barra de endereço.

---

## 11. Decisões conscientes

| Decisão | Por quê | Alternativa descartada |
| --- | --- | --- |
| Camada de serviço com mock | Permite construir sem esperar o backend, e trocar depois sem tocar em tela | MSW, mais fiel mas com mais setup para o mesmo ganho neste projeto |
| Tokens em CSS variables | Tema claro e escuro sem duplicar classe, e troca de marca em um lugar só | Cores direto no Tailwind config, que travaria o tema escuro |
| Dashboard em uma chamada agregada | A Home carrega rápido e não faz cinco requisições | Cinco endpoints separados |
| Dinheiro em centavos inteiro | Elimina erro de arredondamento | Float, que diverge entre front e back |
| Sem biblioteca de estado global | O estado do Valide cabe em local, URL e context | Redux ou Zustand, complexidade sem retorno aqui |
| Filtro na URL | Tela compartilhável e sobrevive ao recarregar | Estado local, que perde tudo ao atualizar |
