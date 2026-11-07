# Validação: Issue 039 - Pastas

**Data:** 10/10/2026
**Resultado:** passou

## Antes e depois

- **Antes:** a tela existia desde a 015, mas nenhum link levava a ela. Lista em dois terços da largura, formulário de criar e um card "Como funciona" ao lado; Renomear sem efeito e Excluir apagado nas pastas com produto
- **Depois:** como a "Category" do Ventor (Behance): "Criar pasta" no cabeçalho, tabela de largura inteira com Pasta, Produtos e Vencidos e a vencer, ações no fim da linha. Criar, renomear e excluir em janela. Porta de entrada em "Mais filtros" do Estoque

## Critérios

| Critério | Resultado |
| --- | --- |
| "Gerenciar pastas" aparece para o administrador e some para o balconista | ok, conferido por script nos dois cargos |
| Criar pela tecla: Enter no botão abre a janela com o foco no campo | ok |
| Nome repetido (sem diferença de maiúscula) é recusado com o motivo | ok: "Já existe a pasta Genéricos. Escolha outro nome." |
| Esc fecha e devolve o foco a "Criar pasta" | ok |
| Clique fora da janela fecha | ok |
| Criar e excluir avisam o leitor de tela (`role="status"`) | ok |
| Pasta com produto: a janela explica e leva aos produtos | ok |
| Pasta vazia: confirmação com "Excluir pasta", botão neutro | ok |
| Balconista vê "Seu cargo não tem acesso" com saída | ok |
| 1440 claro e escuro, 768 e 360 sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint e `npm test` (57) | passam |

## Corrigido na conferência

- Em 768 o título "Vencidos e a vencer" quebrava em duas linhas: cabeçalho sem quebra
- Em 768 a tabela passava da borda do cartão: Renomear e Excluir só com o ícone até a tela grande (o nome continua para o leitor de tela)
- O nome da pasta ficava um pixel acima dos números da linha: o link virou bloco

Capturas em `telas-novas/039/`.
