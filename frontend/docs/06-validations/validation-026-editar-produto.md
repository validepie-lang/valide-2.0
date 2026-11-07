# Validação: Issue 026 - Editar produto

**Data:** 09/10/2026
**Resultado:** passou

Capturas em `telas-novas/026/`: `estoque_p1_editar` (produto com dois lotes) e `estoque_p16_editar` (sem lote), em 1440 claro e escuro, 768 e 360; e a fila aberta em `?produto=p34`.

## Conferido

- **Edição preenchida:** nome, código, código de barras, pasta, marca, fornecedor, unidade, mínimo, máximo e os três valores vêm do produto. Dinheiro no formato de digitação ("7,42")
- **Lotes só leitura:** com lote, a mesma tabela do detalhe (barra de estado, distância na cor do estado) e "Registrar saída"; sem lote, "Nenhum lote informado. O produto está como Sem validade." e "Informar validade"
- **Ações:** "Cancelar" volta ao produto; "Salvar alterações" nunca desabilitado (Primer). No cadastro, os rótulos continuam "Voltar sem salvar" e "Salvar produto", e o card "Lote e validade" continua com os campos
- **Links corrigidos:** "Editar produto" leva a `/estoque/[id]/editar`. A fila com `?produto=` abre no produto pedido (p16, p18, p20, p34, nenhum deles o primeiro). A baixa de produto sem lote manda o `?produto=`
- **Produto inexistente:** `/estoque/zzz/editar` mostra "Produto não encontrado", como o detalhe e a baixa
- **Sem rolagem horizontal** em 360. Sem erro no console

## Achado e corrigido

O botão do card de lotes caía sob o texto em 1440, porque o bloco de texto ocupava a linha toda. Passou para a direita do cabeçalho, como a ação dos outros cards; no celular, largura total abaixo do texto.

## Checagem

`npx tsc --noEmit`, lint e `npm test` (57) passam.
