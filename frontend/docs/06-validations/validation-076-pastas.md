# Validação 076: Pastas com busca, ordem, páginas, desativar, excluir várias e excluir levando os produtos

**Data:** 13/10/2026
**Como:** Chrome headless por script (`cdp076.mjs`, um passo por vez), em 1440 e em 360, começando sem cookies (modo de demonstração).
**Capturas:** `telas-novas/076/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Busca (64) | `?busca=GENERICOS` mostra só Genéricos (sem acento e sem maiúscula). Busca sem resultado: "Nenhuma pasta com “xyz”" com "Limpar busca"; "Sem pasta" some na busca |
| Ordem pelo cabeçalho (64) | `?ordem=products_desc`: Genéricos e Medicamentos (20), Higiene e beleza (12), Dermocosméticos e Suplementos (10), Infantil (8), com o nome desempatando; o cabeçalho Produtos fica com `aria-sort="descending"` e o próximo clique inverte |
| Páginas (64) | 25 por página; o rodapé só aparece quando há mais de 25 (testado no `folder-list.test.ts`: 30 pastas, a página 2 tem 5, a página 9 vira a 2) |
| Desativar (65) | "Pasta Infantil desativada. Ela não aparece mais para escolher; 8 produtos continuam nela."; a linha ganha o selo neutro "Desativada" e o botão vira "Ativar" |
| Some das escolhas (65) | Cadastro: Sem pasta, Medicamentos, Genéricos, Dermocosméticos, Higiene e beleza, Suplementos. Mover de pasta e filtro do Estoque: sem Infantil |
| Os produtos continuam (65) | `/estoque?pasta=f5` lista os produtos de Infantil (Leite Nan Comfor 1, …); a edição do `p69` mostra "Infantil (desativada)" escolhida |
| Ativar (65) | "Pasta Infantil ativada. Ela volta a aparecer para escolher." |
| Excluir com produtos (110) | "Excluir a pasta Suplementos? Ela tem 10 produtos. Escolha para onde eles vão: nenhum produto é apagado." Destinos: Sem pasta e as pastas ativas, sem a própria. Para Medicamentos: "Pasta Suplementos excluída. 10 produtos foram para Medicamentos."; Medicamentos foi de 20 para 30 produtos e de 10 para 12 vencidos e a vencer |
| Excluir várias (66) | Criadas "Vazia A" e "Vazia B", marcadas com Infantil: faixa "3 pastas marcadas"; janela "Excluir 2 pastas? Vazia A e Vazia B. Estão vazias: nenhum produto muda. Infantil tem produtos e fica. Para excluir, use Excluir na linha e escolha para onde os produtos vão."; "Excluir as 2": "2 pastas excluídas.", Infantil continua com 8 |
| Recarregar | Desativar, criar e excluir continuam depois de recarregar (registro da demonstração) |
| Celular | 360: largura 360, caixa à esquerda de cada linha, selo "Desativada" e ações só com ícone (nome no texto para leitor de tela) |
| Escuro | 1440 escuro: selo, faixa das marcadas e caixas legíveis (`escuro-1440.png`) |
| Teclado | Tab chega em "Buscar pasta"; digitar "infan" e Enter filtra; Tab até Excluir da linha e Enter abre a janela com o foco em "Os produtos vão para" (sem a própria pasta nem as desativadas); Esc fecha e o foco volta ao Excluir |
| `tsc`, lint, testes | Sem erro; 224 testes passam (12 novos: busca, ordem, página, escolhas, divisão das marcadas, endereço, pastas no registro) |

## Defeitos achados no teste e corrigidos

- Ao trocar "Desativar" por "Ativar" os botões da linha andavam, porque o texto é mais curto: o botão tem largura fixa da tela grande em diante
- No celular, "Desmarcar" caía sozinho para a linha de baixo da faixa das marcadas: os dois botões agora andam juntos
- O roteiro de teste parecia travar depois de gravar: era a saída perdida no cano ao encerrar. Passou a gravar cada passo direto em arquivo
