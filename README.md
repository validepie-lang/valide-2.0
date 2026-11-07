# Valide

SaaS de gestão de estoque com foco em controle de validade para farmácias.

Projeto Integrador de Extensão I, Análise e Desenvolvimento de Sistemas, UNIFAN, 2026.2.

Farmácias perdem dinheiro porque controlam vencimento em papel. O Valide coloca uma camada de controle de validade sobre o estoque que a farmácia já tem, com quatro estados claros: **Vencido**, **A vencer**, **No prazo** e **Sem validade**.

---

## Como este repositório é organizado

Um repositório, três pastas, um dono por pasta.

| Pasta | O que é | Responsável | Status |
| --- | --- | --- | --- |
| `frontend/` | Aplicação Next.js, telas e componentes | Marcus | em desenvolvimento |
| `backend/` | API e regras de negócio | Pedro | a criar |
| `banco/` | Modelagem e scripts do banco de dados | Antônio | a criar |

Quem cuida de QA e testes é o João, e Gabriel e Eduardo cuidam da parte de extensão com a farmácia parceira.

**A regra é simples: cada um edita a própria pasta.** Como ninguém mexe no arquivo do outro, conflito de merge praticamente não acontece, mesmo com os três trabalhando ao mesmo tempo.

---

## Como trabalhar no dia a dia

**Primeira vez aqui? Leia `CONTRIBUINDO.md` antes.** Ele tem o passo a passo de acesso, a divisão de pastas e o que o backend precisa saber sobre o contrato de API.

```bash
git pull --rebase        # antes de começar, sempre
# ... trabalhe na sua pasta ...
git add .
git commit -m "feat: descrição curta em inglês"
git push
```

Duas recomendações que evitam dor de cabeça:

1. **Puxe antes de começar e antes de subir.** O `--rebase` mantém o histórico em linha reta, sem commit de merge a cada sincronização.
2. **Se o push for recusado**, é porque alguém subiu algo antes. `git pull --rebase` e tente de novo. Não force push: `git push --force` apaga o trabalho do outro sem aviso.

---

## O contrato entre frontend e backend

O documento que liga o trabalho do Marcus ao do Pedro é o contrato de API:

**`frontend/docs/01-references/api-contract.md`**

Ele lista cada endpoint que o frontend consome, com formato de entrada e de saída. O frontend já está construído contra esse contrato, usando dados falsos no lugar das respostas reais. Quando um endpoint ficar pronto no backend, é só o frontend trocar o dado falso pela chamada de verdade.

Mudou alguma coisa no contrato? Avise antes de implementar. É o documento mais caro de manter desatualizado no projeto.

---

## Documentação do projeto

Toda a documentação vive em `frontend/docs/`, porque nasceu junto com o frontend:

| Pasta | O que tem |
| --- | --- |
| `00-context/` | O que é o Valide, para quem, e as regras de negócio |
| `01-references/` | Contrato de API, arquitetura, design system, regras de segurança |
| `02-prd/` a `06-validations/` | A esteira de produção: requisito, especificação, tarefa, plano, validação |
| `07-decisions/` | Toda decisão técnica, de UX e de segurança, com data e motivo |
| `08-project/` | Plano de execução por fase e pauta das reuniões de equipe |

Para entender o projeto rápido, comece por `frontend/docs/00-context/project-overview.md`.

---

## Rodando o frontend

Precisa de Node 22 ou superior.

```bash
cd frontend
npm install
npm run dev     # sobe em http://localhost:3000
npm test        # roda os testes
```
