# Plan: Issue 002 - Perfis, login e descarte conforme o banco

**Issue:** `docs/04-issues/002-perfis-e-login-do-banco.md`
**Data:** 07/10/2026
**Status:** aprovado ("pode seguir construindo", Marcus, 07/10)
**Etapa da esteira:** 6 de 12

---

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| uso de `UserRole` e `ROLE_LABEL` | tipos, sessão de demonstração, perfil, usuários, menu da conta | sim, o menu passa a mostrar os três cargos sem mudança |
| uso de `user.email` | perfil e usuários. `Company.email` é contato da empresa e fica | não |
| simulação de cargo | `?cargo=operador` repetido em empresa, usuários e pastas | sim, vira um helper só |
| verificação de permissão no front | nenhuma função. Cada página compara string | crio `src/lib/utils/permissions.ts` |
| tela de sem permissão | `NoPermission` | sim, sem mudança |
| quem registra descarte nos mocks | `mocks/movements.ts` distribui usuário por índice: vencimento cai no u1, avaria no u3 | sim. Basta u3 ser Farmacêutico, os mocks de movimento não mudam |

## 2. Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/lib/utils/permissions.ts` | quais motivos são descarte, quais cargos descartam, e `demoRole` |

## 3. Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/lib/types/index.ts` | `UserRole`, `User`, `ROLE_LABEL` |
| `src/lib/mocks/session.ts` | equipe com três cargos, `login`, uma pessoa bloqueada |
| `src/app/(auth)/login/page.tsx` | campo Usuário |
| `src/app/(app)/configuracoes/page.tsx` | campo Usuário só leitura |
| `src/app/(app)/configuracoes/usuarios/page.tsx` | lista, bloqueio, matriz de três cargos |
| `src/app/(app)/configuracoes/empresa/page.tsx` | `demoRole` |
| `src/app/(app)/estoque/pastas/page.tsx` | `demoRole` |
| `src/app/(app)/estoque/[id]/baixa/page.tsx` | lê o cargo e passa ao formulário |
| `src/components/products/exit-form.tsx` | esconde motivos de descarte para Balconista, rótulo Justificativa |
| `docs/01-references/api-contract.md` | v6 |
| `docs/00-context/business-rules.md` | seção 5 |
| `docs/01-references/screen-map.md` | seção 11 |
| `docs/00-context/target-audience.md` | nome dos cargos nas personas |

## 4. Permissões

O banco só define uma regra: descarte é de Farmacêutico ou Administrador. Para o resto, o Farmacêutico recebe o mesmo que o Balconista, e o que era só de administrador continua só de administrador. É o menor privilégio, e fica marcado no contrato como proposta.

A interface esconde, o servidor bloqueia. O front não é a barreira: `POST /movements/out` com motivo de descarte precisa devolver `403` para Balconista.

## 5. Endpoints

| Método | Rota | Mudança |
| --- | --- | --- |
| POST | `/auth/login` | `{ login, password }` |
| POST | `/users` | substitui `/users/invite`: `{ name, login, password, role }` |
| PATCH | `/users/:id` | aceita `active` |
| DELETE | `/users/:id` | sai. Bloquear no lugar de apagar |
| POST | `/movements/out` | `403` para descarte vindo de Balconista |

## 6. Riscos

- O cadastro de empresa ainda pede e-mail do administrador. Fica de fora de propósito, porque a própria existência da empresa está em aberto
- A validação da fase 1 cita `?cargo=operador`. É registro histórico e não é editada
