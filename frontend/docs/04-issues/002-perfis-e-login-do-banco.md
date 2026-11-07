# Issue 002: Perfis, login e descarte conforme o banco

**SPEC de origem:** nenhuma. Alinhamento do frontend ao schema do banco entregue pelo Pedro e pelo Antônio em 07/10/2026.
**Status:** executada
**Depende de:** nenhuma
**Etapa da esteira:** 5 de 12

---

## Objetivo

Adotar no frontend as partes do banco que não conflitam com nada já decidido: os três perfis de acesso, o login por nome de usuário, o bloqueio de funcionário sem apagar histórico e a regra de que só Farmacêutico e Administrador fazem descarte.

## Contexto

O banco tem cinco tabelas: `perfil_acesso`, `usuarios`, `produtos`, `lotes_estoque` e `historico_movimentacao`. Comparado ao contrato v5, ele:

- tem **três perfis** (Balconista, Farmacêutico, Administrador), e o front tinha dois (`admin`, `operator`)
- faz login por **`login`** (nome de usuário, único) e **não tem e-mail** de usuário
- tem `usuarios.ativo`, para bloquear quem saiu da farmácia sem apagar o que a pessoa registrou
- diz que **descarte só é aceito de Farmacêutico ou Administrador**

O banco também não tem empresa, custo, pastas, importação nem notificações. Isso **não** entra nesta issue: são conflitos de escopo que dependem de conversa com o backend.

## Escopo

### Faz

- `UserRole` passa a ser `admin`, `pharmacist` e `clerk`
- `User` troca `email` por `login` e ganha `active`
- Login pede usuário em vez de e-mail
- Perfil mostra o usuário de acesso, só para leitura
- Usuários: lista mostra o usuário de acesso e quem está com acesso bloqueado; matriz de permissão com três cargos e a linha de descarte
- Baixa: Balconista não vê os motivos de descarte (vencimento e avaria), e a tela diz a quem pedir
- O parâmetro de demonstração `?cargo=` passa a aceitar `balconista` e `farmaceutico`
- Contrato v6 e regras de negócio atualizados

### Não faz

- Não mexe em empresa, custo, pastas, importação, notificações nem nos motivos Roubo e Consumo interno
- Não troca os IDs para número
- Não mexe no cadastro de empresa, que depende da decisão sobre empresa
- Não atualiza o pedido B24 a B30 nem a página publicada para o Pedro (precisam andar juntos, fica para o Marcus decidir)

## Critérios de aceite

- [ ] Nenhum `operator` ou `Operador` sobra em `src/`
- [ ] Login não pede e-mail
- [ ] Com `?cargo=balconista`, a baixa não oferece Vencimento nem Avaria e explica por quê
- [ ] Com `?cargo=farmaceutico`, a baixa oferece todos os motivos e as telas de administrador mostram "sem permissão"
- [ ] A matriz de permissões tem três cargos, e o descarte aparece como Farmacêutico e Administrador
- [ ] Os dados de demonstração respeitam a regra: nenhum descarte registrado por Balconista
- [ ] `npx tsc --noEmit` sem erro, `npm run lint` sem warning, `npm test` passa
- [ ] Conferido na tela em 1440 e 360, claro e escuro
