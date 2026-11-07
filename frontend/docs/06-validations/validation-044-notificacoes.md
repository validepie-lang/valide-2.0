# Validação: Issue 044 - Notificações nas configurações

**Data:** 10/10/2026
**Resultado:** passou, com dado simulado (a preferência não existe no contrato: v16 proposto)

## Antes e depois

- **Antes:** os avisos chegavam no sino sem a pessoa poder escolher quais (item 39 da lista do que ficou de fora)
- **Depois:** aba "Notificações" em Configurações, com um interruptor por tipo de aviso, e o caminho até ela no sino e em Avisos

## Critérios

| Critério | Resultado |
| --- | --- |
| Aba entre Meu perfil e Empresa, acesa no menu lateral das configurações e nas abas do celular | ok |
| Interruptor com `role="switch"`, nome vindo do título da linha e a frase como descrição | ok |
| Espaço liga e desliga com o foco no interruptor, com o anel de foco visível | ok (`O que a equipe registrou`: ligado para desligado) |
| Ligado na cor de ação, nunca em verde | ok, nos dois temas |
| Rodapé do sino: "Ver todos os avisos" e "Escolher o que avisa" | ok |
| Avisos: "Escolher o que avisa" no cabeçalho | ok |
| 1440 claro e escuro, 768 e 360 sem rolagem lateral | ok |
| `npx tsc --noEmit`, lint, `npm test` (69) e `next build` | passam |

Capturas em `telas-novas/044/`.
