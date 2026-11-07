# Validação: Issue 049 - Câmera e cadastro com código

**Data:** 10/10/2026
**Resultado:** passou

- Chrome com câmera falsa mostrando um EAN-13 gerado (`7891000000007`): "Ler pela câmera" abriu a janela, leu o código e abriu a Dipirona com o foco no número do lote
- Com a imagem de teste padrão (sem código), a janela fica lendo, com a moldura e o resto escurecido
- `?busca=7890000000000` sem resultado: "Cadastrar produto" leva a `/estoque/novo?codigo=7890000000000`, e o campo vem preenchido; `?codigo=abc` deixa o campo vazio
- `npx tsc --noEmit`, lint, `npm test` e `next build` passam. Capturas em `telas-novas/049/`
