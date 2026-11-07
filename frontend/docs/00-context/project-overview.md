# project-overview.md: O que é o Valide

## Em uma frase

SaaS multi-tenant que coloca uma camada de controle de validade em cima do estoque que a farmácia já tem.

## O problema real

Farmácias e comércios similares perdem dinheiro porque o controle de vencimento é feito em papel. Isso impede consulta rápida, impede priorizar o que vence primeiro, e vira prejuízo direto quando o produto passa da data na prateleira.

## A solução

Um painel com estados claros de validade: vencido, a vencer, no prazo, e mais um quarto estado para produto sem validade informada. Dentro disso: cadastro e classificação de produtos, controle por lote, baixa com motivo, e a regra FEFO (primeiro a vencer, primeiro a sair).

## O que o Valide não é

**Não é um ERP e não substitui o sistema que a farmácia já usa.** Esse posicionamento decide várias coisas de produto:

- A entrada de dados principal é importar o catálogo existente, não cadastrar produto a produto
- A interface não compete com o sistema de PDV, ela resolve o que ele não faz
- O vocabulário é de controle de validade, não de gestão comercial completa

## Contexto do projeto

**Acadêmico:** Projeto Integrador de Extensão I, Análise e Desenvolvimento de Sistemas, UNIFAN, semestre 2026.2. Professor Anderson Barbosa, mentor Ismael Ribeiro.

**Comercial:** o produto nasce para ser vendido por assinatura para várias farmácias, e depois para outros segmentos com o mesmo problema (bebidas, delicatessen). Por isso a arquitetura é multi-conta desde o MVP.

## Equipe

| Pessoa | Papel |
| --- | --- |
| Marcus Campos | Frontend e prototipação |
| Pedro | Backend e API |
| Antônio | Banco de dados e modelagem |
| João | QA e testes |
| Guilherme | Consultoria, requisitos e análise |
| Gabriel | Gestão do projeto |
| Eduardo | Comercial e pitch |

## Escopo deste repositório

**Somente frontend.** Backend e banco vivem em repositórios separados. Ver as regras duras em `CLAUDE.md`.

## Identidade

Paleta Cobalto sobre papel desde 11/10/2026 (issue 064), escolhida pelo Marcus entre quatro azuis; antes Ardósia, e Petróleo por um dia. A neutralidade deixava a interface genérica; o petróleo vem da família de cor dos projetos de saúde e farmácia mais bem avaliados do Behance, e continua servindo a bebidas e delicatessen, porque não é símbolo de farmácia. Ver `docs/04-issues/061-identidade-petroleo.md`.

A identidade não pode ser presa ao universo farmacêutico. Nada de cruz verde, símbolo de farmácia, ou texto estrutural dizendo "sua farmácia".

**Farmácia parceira:** Farmácia Preço Popular (definida em 11/10/2026). É a farmácia dos dados de exemplo.

**Logo:** desde 11/10/2026, um V (o visto de validar) com três barras que diminuem (o estoque baixando); cobalto no claro e lavanda no escuro. Tipografia: Instrument Sans.

## Marcos do cronograma

| Data | Entrega |
| --- | --- |
| 10/10/2026 | Protótipo navegável e arquitetura |
| 24/10/2026 | Autenticação e estrutura multi-tenant |
| 07/11/2026 | Cadastro, classificação e consulta funcionando |
| 14/11/2026 | MVP integrado com validade, dashboard e baixa |
| 21/11/2026 | Testes, validação e pitch comercial |
| A definir | Documentação, portfólio e apresentação final |

## Documentos relacionados

- Público e perfis: `00-context/target-audience.md`
- Regras de negócio: `00-context/business-rules.md`
- Como trabalhamos: `01-references/workflow.md`
