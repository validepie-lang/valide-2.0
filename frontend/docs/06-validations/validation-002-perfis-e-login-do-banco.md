# Validation: Issue 002 - Perfis, login e descarte conforme o banco

**Issue:** `docs/04-issues/002-perfis-e-login-do-banco.md`
**Plano:** `docs/05-plans/plan-002-perfis-e-login-do-banco.md`
**Data:** 07/10/2026
**Etapa da esteira:** 8 de 12

---

## Critérios de aceite

| Critério | Resultado | Como foi verificado |
| --- | --- | --- |
| Nenhum `operator` ou `Operador` em `src/` | passou | `grep -rni` em `src/`, zero ocorrências |
| Login não pede e-mail | passou | captura em 1440, campo Usuário com `autoComplete="username"` |
| Balconista não vê Vencimento nem Avaria na baixa | passou | `/estoque/p1/baixa?cargo=balconista` oferece Venda, Roubo e Consumo interno, e o campo explica a quem pedir |
| Farmacêutico vê todos os motivos e não entra em telas de administrador | passou | a baixa oferece os cinco motivos; pastas, empresa e usuários mostram "sem permissão" |
| Matriz com três cargos e linha de descarte | passou | captura em 1440 e 360 |
| Nenhum descarte de Balconista nos dados de demonstração | passou | vencimento é registrado por Marcus (Administrador) e avaria por Rafael (Farmacêutico) |
| `tsc`, lint e testes | passou | `npx tsc --noEmit` sem erro, `npm run lint` sem warning, `npm test` com 28 de 28 |
| 1440 e 360, claro e escuro | passou | Chrome headless; 360 via iframe |

## Problemas encontrados e corrigidos na validação

1. **Vão vazio no card de usuários em 1440.** O grid esticava a lista até a altura da matriz. Corrigido com `self-start` nos dois cards.
2. **Nomes cortados em 360.** O cargo ao lado do nome deixava "Mar..." e jogava o "Editar" do usuário bloqueado para outra linha. No celular, o cargo agora desce para baixo do nome.

## Segurança

- A regra do descarte é escondida na interface e **precisa** ser bloqueada no servidor. Registrado no contrato v6: `403` para `expiry` ou `damage` vindos de `clerk`.
- O `?cargo=` só muda o que a tela de demonstração mostra. Não existe sessão real, então não há o que contornar.

## Fica de fora, de propósito

- Cadastro de empresa ainda pede e-mail do administrador, porque a existência da empresa está em aberto (contrato, ponto 6)
- O pedido B24 a B30 e a página publicada para o Pedro ainda falam em `admin` e `operator`. Os dois precisam ser atualizados juntos
- O subtítulo de Configurações ainda cita "conexões com outros sistemas", resto da integração que saiu em 17/09. Fora do plano desta issue
