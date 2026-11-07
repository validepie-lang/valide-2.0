# Issue 046: Aviso ao sair com alterações não salvas

**Origem:** item 17 de `ficou-de-fora.md`, liberado pelo Marcus em 10/10.
**Status:** executada e validada

## Referências

O Behance mostra a tela, não o comportamento. Para o comportamento, o mesmo design system público usado na issue 026:

| Fonte | O que se usa |
| --- | --- |
| [Primer, Saving](https://primer.style/ui-patterns/saving) (GitHub) | Proteger o que a pessoa preencheu ao sair da página sem salvar; confirmação com o verbo da ação |

## Faz

- `UnsavedGuard` em `components/ui`: envolve o formulário e percebe o que foi digitado
- Link do próprio Valide com alteração pendente abre a janela "Sair sem salvar?", com o foco em "Continuar preenchendo"; "Sair sem salvar" segue para o link
- Fechar a aba ou recarregar: o aviso do navegador
- Links que já dizem que descartam ("Voltar sem registrar", "Voltar sem salvar", "Cancelar") passam sem perguntar (`data-discard`)
- Em: cadastrar e editar produto, entrada (pelo produto e geral), saída, Meu perfil e Empresa

## Não faz

- Cadastro da empresa: cada etapa é uma página, e o "Continuar" é um link; o aviso pararia o próprio assistente. Volta com a fase de lógica
- Validades pendentes: cada produto é salvo ao avançar, não há meio formulário a perder
