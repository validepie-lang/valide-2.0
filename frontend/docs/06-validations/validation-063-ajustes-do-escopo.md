# Validação 063: Ajustes do escopo

**Data:** 11/10/2026 · Teste por script no Chrome (`cdp063.mjs`), capturas em `telas-novas/063/`

| Caso | Resultado |
| --- | --- |
| C1 CEP 01310-100 em Configurações | "Endereço preenchido pelo CEP. Confira e informe o número."; Avenida Paulista, Bela Vista, São Paulo; o foco continua no CEP |
| C2 CEP 99999-999 | "Não achamos este CEP..."; o endereço que já estava não é apagado |
| C3 Janela | 7, 15, 30, 45, 60 e 90 dias |
| C4 Site "drogaria" | erro no campo: "Confira o site: falta o domínio, como suafarmacia.com.br." |
| C5 Site e inscrição municipal | salvos ("Dados da empresa salvos.") |
| K1 CEP no cadastro da empresa | preenche logradouro, bairro, cidade e estado (SP); campo Site presente |
| S1 Saída, busca "dipirona" | dois produtos, cada um leva a `/estoque/<id>/baixa` |
| S2 Saída, código 7891006870956 | abre direto `/estoque/p6/baixa` |
| S3 Saída sem resultado | "Nenhum produto para..." com "Ver o estoque" (na saída não se oferece cadastrar) |
| H1 e M1 | "Registrar saída" na Home (ao lado de "Adicionar produto") e em Movimentações (ao lado de "Registrar entrada") |
| 360 px | Home, cadastro (passo 2) e saída sem rolagem lateral, sem erro de console |
| `tsc`, lint, 130 testes, build | sem erro |

## Achados na tela

- **O endereço simulado não batia com o CEP:** 40140-130 é a Avenida Oceânica, e o exemplo dizia Rua Barão de Itapoã, Rio Vermelho. Com a busca, digitar o próprio CEP trocaria o endereço na demonstração. Corrigido para o CEP verdadeiro da rua na ViaCEP: 40140-060, Rua Barão de Itapoan, Barra
- `signup-steps.tsx` passava de 200 linhas: o passo de endereço foi para `signup-address.tsx`

## Também nesta entrega

O nome da farmácia de exemplo passou de "Drogaria São Pedro" para **Preço Popular**, a pedido do Marcus (11/10). CNPJ, razão social, endereço e e-mail continuam fictícios.
