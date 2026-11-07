# Issue 003: Linguagem visual a partir da referência MT

**SPEC de origem:** nenhuma. Pedido do Marcus em 07/10/2026: "ainda não estou gostando muito desse visual", com a referência em `docs/01-references/visual-ref/`.
**Status:** executada
**Depende de:** nenhuma
**Etapa da esteira:** 5 de 12

---

## Objetivo

Trocar a linguagem visual do Valide pela da referência MT, adaptada a controle de validade, sem mexer em nenhuma regra de cor de status.

## Escopo

### Faz

- Tokens novos nos dois temas: um matiz azul-ardósia, acento céu, vidro azul, trilho escuro
- Mona Sans no lugar da Inter
- Shell: trilho lateral de ícones no desktop, barra superior com busca, barra inferior escura no celular
- Primitivos: card, botão, logo, componente de dinheiro com centavos esmaecidos
- Home redesenhada: herói com quatro blocos de estado, pilha de filas de trabalho, próximos a vencer com recorte de canto, movimentações em lista, atalhos

### Não faz

- Não redesenha estoque, produto, importação, fila de validades, configurações e login. Elas herdam os tokens e o shell; o acabamento fino é a issue seguinte
- Não muda nenhum dado, serviço, rota ou contrato
- Não muda as cores de status nem as regras da seção 5 do `CLAUDE.md`

## Critérios de aceite

- [ ] Nenhum hex fora de `globals.css` (exceto `themeColor`, exceção já documentada)
- [ ] Verde, amarelo e vermelho só aparecem comunicando validade
- [ ] Produto sem validade continua neutro e fora de "No prazo"
- [ ] Texto sobre o vidro azul passa AA
- [ ] Home funciona em 360, 768 e 1440, claro e escuro
- [ ] Pilha de abas navegável por teclado, com `aria-expanded`
- [ ] As outras telas não quebram com os tokens novos
- [ ] `tsc`, lint e testes passam
