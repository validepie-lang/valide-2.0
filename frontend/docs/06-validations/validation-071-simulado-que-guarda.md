# Validação 071: O modo de demonstração guarda o que foi gravado

**Data:** 12/10/2026
**Como:** Chrome headless por script (`cdp071.mjs`, `cdp071b.mjs` e `cdp071c.mjs`), em 1440, começando sem cookies.
**Capturas:** `telas-novas/071/`

## Resultado

| Critério | Resultado |
| --- | --- |
| Cadastrar abre o produto (103) | Cadastrando "Paracetamol 750mg Demonstração", a tela foi para `/estoque/produto-simulado-…?salvo=novo`, com o produto e "Produto cadastrado. Cadastrar outro". Recarregando, continua lá; a busca do Estoque acha 1 produto |
| Lote | Entrada do lote PD2026 (12 un, vence em 20 dias) no produto novo: o cartão Estoque mostra 12 un e o lote A vencer |
| Saída | 6 un da Dipirona: de 76 para 70 depois de recarregar |
| Nota | A nota gravada continua depois de recarregar (3 notas) |
| Mudança de pasta | O produto novo foi para Genéricos e continua lá |
| Início | O valor em risco foi de R$ 8.688 para R$ 8.680 (mais 36 do lote novo, menos 44,52 da saída do lote vencido da Dipirona) |
| Movimentações | A entrada e a saída gravadas aparecem no topo de Movimentações, com "Marcus Campos"; o Dorflex foi de 28 para 52 un |
| Tamanho | Cinco ações ocupam 2.013 caracteres do cookie (o limite é 3.500); acima disso as mais antigas saem (teste de unidade) |
| Apagar | Em Meu perfil, "5 ações guardadas neste navegador"; "Apagar o que a demonstração guardou" volta para "Nada guardado" e as notas da Dipirona voltam a 2 |
| Cookie adulterado | `valide_demo=%7Blixo`: o Início abre normalmente, como se não houvesse registro |
| `tsc`, lint, testes | Sem erro; 173 testes passam (7 novos) |

## Observação

Num primeiro roteiro longo, o script parou de responder depois de apagar e navegar; repetido sozinho, o mesmo passo navegou em 2,6 s. É o caso já conhecido do Chrome por script segurando a navegação, não da tela.
