# Issue 062: Logo do Valide

**Origem:** o Marcus pediu um prompt para criar o logo no Claude (11/10/2026) e recebeu o briefing com as regras da marca (sem símbolo de farmácia, sem cor de status, petróleo e menta, funcionar a 16 e 40 px). Mandou primeiro o conceito "Fila" (publicado em `022175c`) e, no mesmo dia, a versão final: um V com três barras que diminuem, nos arquivos valide-marca.svg, valide-marca-escuro.svg, valide-logo-escuro.svg e valide-favicon.svg.
**Status:** executada e validada.

## Faz

- `Logo` em `src/components/layout/logo.tsx` com a arte enviada, nome já em curvas, cor por `currentColor`: marca em petróleo (`text-primary`) e nome em `text-fg` no claro; marca em menta e nome em `text-deep-fg` sobre o escuro
- Trilho: só a marca (V e barras), 28 px de altura
- Favicon `src/app/icon.svg`: só o V, petróleo, e menta quando o navegador está no escuro
- `src/app/apple-icon.png` (180 px): o V em menta sobre petróleo

## Achado na tela

- No painel escuro do login e do cadastro, o SVG do logo esticava na coluna flex e ficava centralizado. Resolvido com `self-start` em `auth-showcase.tsx`
