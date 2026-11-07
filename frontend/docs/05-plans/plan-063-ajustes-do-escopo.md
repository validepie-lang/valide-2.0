# Plano 063: Ajustes do escopo

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/lib/utils/cep.ts` e `cep.test.ts` (novos) | `cepDigits`, `parseViaCep` |
| `src/lib/services/cep.ts` (novo) | `lookupCep`: ViaCEP com limite de 5 s |
| `src/components/ui/cep-input.tsx` (novo) | Campo de CEP que busca ao chegar a 8 números e preenche os campos pelos ids |
| `src/components/auth/signup-address.tsx` (novo) | `StepAddress` sai de `signup-steps.tsx` (que passava de 200 linhas), com CEP e site |
| `src/components/auth/signup-steps.tsx`, `src/app/(auth)/cadastro-empresa/page.tsx` | Import do passo de endereço |
| `src/components/settings/company-fields.tsx` | Inscrição municipal, site, CEP com busca, opção de 7 dias |
| `src/lib/utils/settings-draft.ts` e `.test.ts` | `cityRegistration` e `website` no rascunho, na validação e no `PATCH` |
| `src/components/products/entry-search.tsx`, `camera-scan.tsx` | `mode` entrada ou saída |
| `src/app/(app)/estoque/saida/page.tsx` e `loading.tsx` (novos) | Saída geral |
| `src/app/(app)/page.tsx`, `src/app/(app)/estoque/movimentacoes/page.tsx` | Botão "Registrar saída" |
| Documentos | contrato v22, `para-o-pedro.md`, `architecture.md` (ViaCEP), `ficou-de-fora.md`, validação |
