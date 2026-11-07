# Issue 044: Notificações nas configurações

**Origem:** levantamento de telas e abas que faltam (10/10, item G), e item 39 de `ficou-de-fora.md`. As três referências de configurações têm uma seção de notificações; no Valide, os avisos chegavam no sino sem a pessoa poder escolher quais.
**Status:** executada e validada. **Depende do Pedro:** a preferência não existe no contrato nem no banco; a tela usa dado simulado e o endpoint vai como proposta (v16), como em Perdas.

## Referências

Behance, buscas "notification settings" e "notification preferences", por apreciações, todos os tempos, mais os projetos de configurações já baixados. As buscas trazem conceitos de iOS e apps de casa; a seção aparece dentro de painéis:

| Projeto | Avaliação | O que se usa |
| --- | --- | --- |
| Pharmly, tela Settings (issue 027) | 356 curtidas | Cada linha com o título em negrito, uma frase embaixo e o interruptor à direita; fio entre as linhas; tudo num card só |
| [User Page](https://www.behance.net/gallery/184520011/User-Page) | 547 curtidas, 28.865 visualizações | "Notification" como um item do menu de configurações, ao lado de perfil e equipe |
| [HR Management Dashboard](https://www.behance.net/gallery/185372253/HR-Management-Dashboard-Project), tela "Notification" (issue 037) | 1.074 curtidas | O caminho entre a lista de avisos e a escolha do que avisa |

O que não vem delas: o interruptor verde do Pharmly (verde é cor de validade; ligado usa a cor de ação) e as linhas de "push", "desktop" e "e-mail" (o Valide só tem o sino, e o banco não guarda e-mail).

## Faz

- Aba "Notificações" em Configurações (`/configuracoes/notificacoes`), entre Meu perfil e Empresa: é preferência de cada pessoa, não da farmácia
- Quatro interruptores, um por tipo de aviso que já existe: lotes que vencem na semana, estoque abaixo do mínimo, o que a equipe registrou, importação concluída
- Interruptor novo em `components/ui/switch.tsx`: a caixa de seleção do navegador com `role="switch"`, que funciona com teclado e leitor de tela sem nada a mais
- "Salvar preferências" no fim, como as outras seções
- Caminho a partir dos avisos: "Escolher o que avisa" no rodapé do sino e no cabeçalho da página Avisos
- Contrato v16, proposto: `GET` e `PUT /users/me/notification-preferences`

## Não faz

Itens 90 a 93 em `08-project/ficou-de-fora.md`.
