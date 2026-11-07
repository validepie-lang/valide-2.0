# Issue 063: Ajustes do escopo (CEP, empresa, janela de 7 dias, saída pela Home)

**Origem:** o Marcus colou uma lista de escopo (11/10/2026) e pediu a comparação com o sistema. Dos pontos que faltavam no front, quatro eram pequenos; ele mandou seguir ("pode seguir").
**Status:** executada e validada.

## Referências

| Fonte | O que se usa |
| --- | --- |
| [Baymard Institute, "Autodetect City and State from the ZIP Code"](https://baymard.com/blog/zip-code-auto-detection) | O CEP preenche logradouro, bairro, cidade e estado; os campos continuam editáveis; se a busca falha, a pessoa digita, sem bloquear |
| Issue 042 (entrada geral, Inventar e Mobile App For Inventory, Behance) | A saída geral repete o passo 1 da entrada: um campo para bipar ou escrever o nome, código exato abre direto |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | A mensagem da busca fica junto do campo e é anunciada (`role="status"`), sem tirar o foco de onde a pessoa está |

## Faz

1. **CEP preenche o endereço** no cadastro da empresa e em Configurações > Empresa, pela ViaCEP (serviço público, chamado do navegador; não é a API do Pedro). Só preenche o que a ViaCEP devolve; o foco não muda; falhou, diz e deixa digitar
2. **Inscrição municipal e site** em Configurações > Empresa (o tipo `Company` já tinha `cityRegistration` e `website`); **site** também no cadastro. Site opcional, sem `https://` a tela completa
3. **Janela de 7 dias** em "Avisar com antecedência de"
4. **Registrar saída pela Home** e por Movimentações: `/estoque/saida` busca o produto (como a entrada geral) e abre a baixa que já existe (`/estoque/[id]/baixa`)

## Não faz

Itens 115 a 118 em `08-project/ficou-de-fora.md`.
