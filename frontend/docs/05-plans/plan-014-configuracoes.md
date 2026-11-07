# Plan: Issue 014 - Configurações

**Issue:** `docs/04-issues/014-configuracoes.md`
**Data:** 09/10/2026
**Status:** aprovado ("pode seguir", Marcus, 09/10)
**Etapa da esteira:** 6 de 12

## Arquivos a criar

| Caminho | O que é |
| --- | --- |
| `src/components/layout/settings-section.tsx` | `SettingsSection` (título, apoio, conteúdo, fio entre seções) e `ReadOnlyRows` (rótulo e valor só de leitura) |

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/(app)/configuracoes/page.tsx` | Uma coluna; Seus dados com usuário, empresa e cargo só leitura; sai "Enviar uma foto"; Senha empilhada; Aparência sem card |
| `src/app/(app)/configuracoes/empresa/page.tsx` | Um formulário em uma coluna, um "Salvar alterações" no fim; sai Logotipo; moeda vira leitura |
| `src/app/(app)/configuracoes/usuarios/page.tsx` | Lista e tabela uma abaixo da outra; selo de cargo neutro; ✓ e − sem círculo |
| `src/app/(app)/configuracoes/loading.tsx` | Esqueleto em uma coluna |
| `docs/01-references/screen-map.md` | Nota da revisão; logotipo fora até existir envio |
| `docs/06-validations/validation-014-configuracoes.md` | novo |

## Reutilizado

`Field`, `Input`, `Select`, `Button`, `Avatar`, `Card` (lista e tabela de usuários), `ThemeChoice`, `NoPermission`, `demoRole`, `FieldSkeleton`.

## Como verificar

- Capturas das três abas em 1440 claro e escuro, 1366, 768 e 360 (emulação)
- Empresa e Usuários com `?cargo=balconista`: continua "sem permissão"
- Teclado: Tab do primeiro campo ao "Salvar alterações" na ordem visual
