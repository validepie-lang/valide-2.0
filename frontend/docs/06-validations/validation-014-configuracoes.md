# Validação: Issue 014 - Configurações

**Issue:** `docs/04-issues/014-configuracoes.md`
**Plano:** `docs/05-plans/plan-014-configuracoes.md`
**Data:** 09/10/2026
**Resultado:** passou

## Antes e depois

Capturas em `redesign-hierarquia/antes/` e `redesign-hierarquia/depois/`.

| Aba | Antes | Depois |
| --- | --- | --- |
| Meu perfil | `configuracoes-1440.png`, `configuracoes-360.png` | `configuracoes-1440.png`, `configuracoes-1440-escuro.png`, `configuracoes-360.png` |
| Empresa | `configuracoes-empresa-1440.png` | `configuracoes-empresa-1440.png`, `configuracoes-empresa-1366x768.png`, `configuracoes-empresa-360.png` |
| Usuários | `configuracoes-usuarios-1440.png` | `configuracoes-usuarios-1440.png`, `configuracoes-usuarios-360.png` |

- **Meu perfil:** antes eram dois cards de formulário à esquerda e dois de painel à direita. Agora é uma coluna: Seus dados (com usuário, empresa e cargo como texto só de leitura), Senha e Aparência.
- **Empresa:** antes eram cinco cards e um "Salvar" no meio da página, sem deixar claro se valia também para a coluna do lado. Agora é um formulário com um "Salvar alterações" no fim.
- **Usuários:** antes eram dois cards lado a lado. Agora a lista e a tabela de permissões ficam uma abaixo da outra, com selo de cargo neutro.

## Critérios de aceite

| Critério | Resultado | Como foi conferido |
| --- | --- | --- |
| Uma ação primária por aba | passou | Capturas: Salvar alterações (perfil e empresa), Adicionar pessoa (usuários). "Trocar senha" é secundário |
| Nenhum card em volta de formulário; nenhum botão que não faz nada além dos de salvar em mock | passou | Saíram "Enviar uma foto" e "Enviar logotipo"; os cards ficam só na lista e na tabela de usuários |
| Coluna até 720px, alinhada à esquerda | passou | Capturas em 1440 e 1366 |
| Sem administrador, Empresa e Usuários mostram "sem permissão" | passou | `?cargo=balconista` nas duas rotas |
| Claro, escuro, 1440, 1366, 768, 360, sem rolagem horizontal | passou | Emulação em 360: documento com 360 de largura, sem erro de console |
| `npm test`, `tsc`, lint | passou | 57 testes, zero erro, zero aviso |

## Corrigido durante a validação

- **Texto de apoio da janela de a vencer em três linhas.** O limite de largura estava no `Field` inteiro. Agora está numa `div` em volta da lista de escolha. A largura não foi para o próprio `Select` porque ele desenha a seta numa `div` externa, e a seta ficaria solta à direita.
- **Cargo repetido.** O bloco do avatar mostrava o cargo, que também está nas linhas de leitura logo abaixo. O bloco ficou só com o nome.
- **Botões de salvar no celular** ocupam a largura inteira, como no rodapé da importação.

## Também mudou

- Os campos de senha não têm mais "••••••••" como texto de exemplo: não dizia nada e usava a cor de baixo contraste do placeholder. Agora levam `autoComplete` (`current-password`, `new-password`), para o gerenciador de senhas do navegador preencher.
- CNPJ e CEP abrem o teclado numérico no celular (`inputMode="numeric"`), e o telefone usa `type="tel"`.
- "Mudar este número muda a contagem do painel inteiro na hora" virou "Ao salvar, a contagem do painel inteiro muda". Nada muda antes de salvar.

## Fora do plano

Nada.

## Para a 015

- **`NoPermission`:** é um card centralizado com ícone em quadrado, e dentro das configurações fica desalinhado da coluna à esquerda. O componente é usado no app inteiro, então o ajuste entra na passada final.
