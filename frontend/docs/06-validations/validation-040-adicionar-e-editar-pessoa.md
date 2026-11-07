# Validação: Issue 040 - Adicionar e editar pessoa

**Data:** 10/10/2026
**Resultado:** passou

## Antes e depois

- **Antes:** "Adicionar pessoa" e "Editar" não abriam nada. Não havia onde bloquear o acesso de quem sai da farmácia, nem onde o administrador trocasse a senha de quem esqueceu, que é o que o login orienta
- **Depois:** as duas ações abrem a janela da 039, com os campos do "Add Company" do Ventor (Behance): nome, usuário de acesso, senha e cargo com o resumo do que ele pode. Bloquear e liberar ficam na edição, com confirmação

## Critérios

| Critério | Resultado |
| --- | --- |
| Adicionar vazio aponta nome, usuário e senha | ok |
| Usuário que já existe, com espaço ou com acento é recusado com o motivo | ok, e coberto por teste (`user-draft.test.ts`, 8 casos) |
| Senha com menos de 8 caracteres não passa; na edição, em branco mantém a atual | ok |
| A dica embaixo do cargo muda com o cargo escolhido | ok |
| Editar a si mesmo: cargo travado com o motivo, sem "Bloquear acesso", senha só em Meu perfil | ok |
| Bloquear pede confirmação e a linha passa a "Acesso bloqueado" | ok |
| Foco no nome ao abrir; Esc fecha e devolve o foco ao "Editar" da linha | ok, pelo teclado |
| Mudanças avisadas ao leitor de tela (`role="status"`) | ok |
| Janela cabe em 360 (710 de 780 px), ações uma por linha, "Bloquear" por último | ok |
| 1440 claro e escuro, 768 e 360 sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (65) e `next build` | passam |

## Corrigido na conferência

- Editar a si mesmo oferecia "Nova senha" sem pedir a atual: virou o caminho para Meu perfil, que pede
- A janela passou de 200 linhas: as regras foram para `src/lib/utils/user-draft.ts`, com teste

Capturas em `telas-novas/040/`. Pedidos ao servidor no contrato, v14.
