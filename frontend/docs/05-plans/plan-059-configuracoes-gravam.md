# Plan: Issue 059 - Configurações gravam

**Issue:** `docs/04-issues/059-configuracoes-gravam.md`
**Data:** 10/10/2026
**Status:** aprovado (ordem da fase de lógica combinada com o Marcus em 10/10)
**Etapa da esteira:** 6 de 12

## 1. Pesquisa na base de código

| Procurei por | Encontrei | Vou reutilizar? |
| --- | --- | --- |
| peças de envio | `form-status.tsx`, `ActionResult`, `markSaved` (053 a 058) | sim; `markSaved` é usado pela primeira vez, porque estas telas ficam abertas |
| regra de senha | `MIN_PASSWORD` em `user-draft.ts` (040) | sim |
| leitura das preferências | `getNotificationPreferences` (044) | sim; a gravação entra em `services/settings.ts` |
| interruptor | `Switch` só com `defaultChecked` | sim, ganha estado de fora |

## 2. Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/lib/utils/settings-draft.ts` e `.test.ts` | senha, CNPJ, empresa |
| `src/lib/services/settings.ts`, `src/lib/actions/settings.ts` | nome, senha, empresa, preferências |
| `src/components/settings/profile-name-form.tsx`, `password-form.tsx` | Meu perfil |
| `src/components/settings/company-fields.tsx`, `company-form.tsx` | Empresa |
| `src/components/settings/notification-switches.tsx` | Notificações |

## 3. Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/(app)/configuracoes/page.tsx`, `empresa/page.tsx`, `notificacoes/page.tsx` | usam os formulários novos |
| `src/components/ui/form-status.tsx`, `switch.tsx`, `unsaved-guard.tsx` | `SavedNote`, fecho da falha, estado de fora, só `input` |
| `src/lib/api/client.ts` | `apiPut` |
| `src/lib/mocks/session.ts` | CNPJ de demonstração válido |
| docs: contrato (v21), ficou-de-fora (112 e 113) | |
