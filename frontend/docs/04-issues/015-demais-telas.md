# Issue 015: Demais telas e passada final

**SPEC de origem:** `docs/03-specs/redesign-hierarquia.md`, seções 5.7 e 10
**Status:** executada e validada
**Depende de:** 006 a 014
**Etapa da esteira:** 5 de 12

---

## Objetivo

Levar a nova base às telas que ainda não passaram pelo redesign: login, cadastro de empresa, cadastro de produto, baixa e pastas. A SPEC manda não mudar a estrutura delas. Depois, conferir o app inteiro contra os critérios da seção 10 e corrigir o que sobrou.

## Escopo

### Faz

**Login e cadastro de empresa**
- Sai o fundo em degradê com os dois círculos decorativos; fica o fundo da página. O card perde a sombra e ganha borda, como todo card estático
- Login: "Esqueci a senha" estava em cinza apagado e não fazia nada. Vira a instrução que vale neste modelo, em que quem administra cria e troca senhas: "Esqueceu a senha? Peça a quem administra a conta da farmácia."
- Cadastro: o administrador entra com **usuário**, não e-mail (contrato v6: o banco não tem e-mail). "Convidar o resto da equipe" vira "cadastrar", porque convite não existe
- Cadastro, última etapa: saem os ícones em quadrado das duas opções

**Texto de exemplo nos campos (`placeholder`)**
- Cor de `fg-disabled` (2,53:1 no claro, 2,66:1 no escuro) para `fg-muted` (5,68:1 e 6,25:1). O WCAG trata placeholder como texto
- Com contraste certo, exemplo que imita dado parece campo já preenchido, e a pessoa pula o campo (NN/g, "Placeholders in Form Fields Are Harmful"). Então:
  - número que imita valor sai: estoque mínimo e máximo, custos, preço, quantidades
  - exemplo de nome ou código ganha "Ex.:" na frente
  - máscara de formato fica (CNPJ, CEP, telefone)
  - exemplo que não ajuda sai: dados de outra farmácia no cadastro, "••••••••" na senha

**Estados e listas**
- `EmptyState`, `ErrorState`, estado vazio do estoque e lista de pastas: ícone solto, sem quadrado
- `NoPermission` sem card e alinhado à esquerda, na mesma margem do conteúdo da tela

**Baixa**
- Lote vencido dizia "vence em 26/09/2026". Agora diz "venceu em"
- "vence primeiro" deixa de ser pílula cheia em cor de ação e vira texto neutro, como na tabela de lotes do produto

### Não faz

- Não muda a estrutura de nenhuma das cinco telas
- Não quebra `exit-form.tsx` (236 linhas): a SPEC manda não mudar a estrutura da baixa. Fica anotado

## Critérios de aceite

- [ ] Nenhum degradê, ícone em quadrado decorativo ou sombra em card estático no app
- [ ] Nenhum texto com informação em `fg-disabled`; placeholder com ao menos 4,5:1 nos dois temas
- [ ] Nenhum texto de exemplo que imite valor numérico
- [ ] Cadastro de empresa pede usuário, não e-mail, para o administrador
- [ ] Critérios da SPEC seção 10 conferidos tela por tela, com o resultado na validação
- [ ] Claro e escuro, 1440, 1366, 768, 360
- [ ] `npm test`, `tsc`, lint
