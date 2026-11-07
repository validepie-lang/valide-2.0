# Plan: Issue 015 - Demais telas e passada final

**Issue:** `docs/04-issues/015-demais-telas.md`
**Data:** 09/10/2026
**Status:** aprovado ("pode seguir", Marcus, 09/10)
**Etapa da esteira:** 6 de 12

## Arquivos a modificar

| Caminho | O que muda |
| --- | --- |
| `src/app/(auth)/layout.tsx` | Fundo da página, sem degradê e sem círculos |
| `src/app/(auth)/login/page.tsx` | Card com borda, logo no tom padrão, "Esqueceu a senha?" como instrução, placeholders |
| `src/app/(auth)/cadastro-empresa/page.tsx` | Card com borda, logo no tom padrão |
| `src/components/auth/signup-steps.tsx` | Usuário no lugar de e-mail do administrador; "cadastrar" no lugar de "convidar"; sem ícone em quadrado; placeholders |
| `src/components/ui/field.tsx` | Placeholder em `fg-muted` |
| `src/components/ui/empty-state.tsx` | Ícone sem quadrado |
| `src/components/ui/error-state.tsx` | Ícone sem quadrado |
| `src/components/ui/no-permission.tsx` | Sem card, alinhado à esquerda |
| `src/components/products/product-form.tsx` | Placeholders |
| `src/components/products/lot-fields.tsx` | Placeholders |
| `src/components/products/exit-form.tsx` | "venceu em" no vencido; "vence primeiro" neutro; placeholders |
| `src/components/products/quick-fill-form.tsx` | Placeholders |
| `src/app/(app)/estoque/page.tsx` | Estado vazio sem ícone em quadrado |
| `src/app/(app)/estoque/pastas/page.tsx` | Lista sem ícone em quadrado; placeholder |
| `docs/01-references/design-system.md` | Regra do placeholder |
| `docs/01-references/screen-map.md` | Login e cadastro |
| `docs/06-validations/validation-015-demais-telas.md` | novo, com a conferência da seção 10 tela por tela |

### Entrou na execução

| Caminho | Por quê |
| --- | --- |
| `src/app/(app)/estoque/[id]/baixa/page.tsx` | Em 360 o código "MED-1040" quebrava no hífen, no subtítulo |

## Reutilizado

`Card`, `Field`, `Input`, `LinkButton`, `EmptyState`, `Logo`, `WizardProgress`, `formatDate`.

## Como verificar

- Capturas antes e depois das cinco telas em 1440 e 360, claro e escuro, e 1366 por 768
- Varredura no código: `gradient`, `shadow-` fora de camada flutuante, `place-items-center rounded-md` com ícone, `fg-disabled` fora de estado desabilitado
- Contraste do placeholder calculado nos dois temas
