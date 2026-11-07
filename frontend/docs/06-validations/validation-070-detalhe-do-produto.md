# Validação 070: Detalhe do produto

**Data:** 12/10/2026
**Como:** Chrome headless por script (`cdp070.mjs`), em 1440 e 360, com envio de foto de verdade (`DOM.setFileInputFiles`).
**Capturas:** `telas-novas/070/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Abas | "Visão geral", "Histórico (1)" e "Notas (2)" na Dipirona |
| Notas (12) | Salvar vazio: "Escreva a nota antes de salvar." e o foco volta ao campo. Com texto: a nota entra no topo como "Marcus Campos · 12 out, 21:20", a lista vai a 3 e "Nota salva." é anunciado |
| Foto (13) | Sem foto, uma faixa baixa com "Enviar foto". Enviando um JPG: a foto aparece, "Trocar foto" e "Remover", "Foto enviada.". Remover: volta "Sem foto" e "Foto removida." |
| Estoque útil (14) | Dos 6 produtos vencidos, só o esparadrapo cai no caso: "Sem o lote vencido ES1182, ficam 4 un: abaixo do mínimo de 8 un." Os outros, com sobra depois do vencido ou já abaixo no total, ficam calados |
| Alterações (15) | "Camila Duarte mudou o preço de venda de R$ 14,00 para R$ 14,90", "Marcus Campos mudou o estoque mínimo de 18 un para 20 un", "Rafael Nogueira mudou a pasta de Sem pasta para Medicamentos", "Importação criou o produto pela planilha", cada uma com a data |
| Quem edita (18) | `?cargo=balconista`: sem "Editar produto", sem cartão de foto (não havia foto), as abas mantêm o cargo. `/editar` como Balconista: "Editar o cadastro do produto é uma tarefa de administrador ou farmacêutico". No Estoque: 0 caixas para o Balconista, 25 para o Farmacêutico |
| Celular | 360 sem rolagem lateral; abas cabem; editar vira só o ícone |
| Erros no navegador | Nenhum |
| `tsc`, lint, testes | Sem erro; 166 testes passam (11 novos) |

## Corrigido durante a validação

1. **Vãos entre situação, lotes e ficha:** a coluna da direita ficou mais alta com a foto e a grade repartia a sobra. A terceira linha agora fica com ela
2. **"Sem foto" num quadro de 4 por 3** empurrava o cartão Estoque para baixo: virou uma faixa baixa
3. **A frase de sem permissão** dizia "tarefa de administrador"; agora diz quem pode
4. **Nenhum exemplo do item 14:** o esparadrapo ganhou um segundo lote

## Observação

O simulado não guarda: a nota nova e a foto ficam na tela até recarregar (item 99, issue 071, ou o Pedro, contrato v26).
