# Issue 056: Importação envia, mapeia e confirma

**Origem:** fase de lógica, quarta da ordem combinada com o Marcus em 10/10. Ele mandou seguir em 10/10 ("pode seguir").
**Status:** executada e validada. **Depende do Pedro:** com `imports` em `NEXT_PUBLIC_API_LIVE`, o arquivo vai para `POST /imports`, o mapeamento para `PATCH /imports/:id/mapping` e a confirmação para `POST /imports/:id/confirm`. A regra de duplicata continua em aberto (ponto 1 do contrato), mas não trava esta issue: quem decide criar ou atualizar é o servidor, e a tela só mostra o que ele devolve. Sem a área ligada, o arquivo escolhido é conferido e a importação de demonstração segue.

## Referências

| Fonte | O que se usa |
| --- | --- |
| [File Upload UI](https://www.behance.net/gallery/79882483/File-Upload-UI) (Behance, issue 032) | A área tracejada com "arraste ou escolha" e os formatos aceitos embaixo |
| [Upload Files Design](https://www.behance.net/gallery/97389819/Upload-Files-Design-Freebie) (Behance, issue 032) | Depois de escolher, o arquivo numa linha com nome e tamanho, enquanto envia |
| [Primer, Forms](https://primer.style/product/ui-patterns/forms) | Validar ao enviar; mensagem no campo; foco no primeiro errado |
| [Primer, Saving](https://primer.style/product/ui-patterns/saving) e [Loading](https://primer.style/product/ui-patterns/loading) | Falhou, o escolhido fica; "Salvando…" no botão |

## Faz

- Origem: "Escolher arquivo" abre o seletor do sistema, e arrastar para a área também envia. Antes de enviar, a tela recusa o que não é CSV nem XLSX, arquivo vazio e arquivo acima de 4 MB, dizendo o que fazer. Enviando, o arquivo aparece numa linha com o tamanho e "Enviando e lendo as colunas…"
- O limite de 4 MB é da plataforma, não da regra de linhas (que segue em aberto, ponto 5): o arquivo passa pelo servidor do Next, e a Vercel aceita até 4,5 MB por requisição. `next.config.ts` sobe o limite das server actions de 1 MB para 4,3 MB
- Mapear: as escolhas valem. "Continuar" confere que o nome do produto está em alguma coluna e que nenhum campo está em duas; o erro vai na coluna que repetiu. O aviso "Este arquivo não traz lote nem validade" some quando uma coluna vira Data de validade
- Revisar: "Importar N produtos" confirma de verdade
- Resultado: em andamento, "Importando…" com consulta a cada 3 segundos até terminar (o contrato prevê consultar `GET /imports/:id`); falhou, "A importação não terminou" com "Enviar de novo"; concluída, como antes
- "Baixar lista de erros" sai do resultado: levava a "#", e o contrato não tem a lista (o mesmo critério da issue 014 com "Enviar uma foto")
- A importação vai de um passo a outro pelo endereço (`?importacao=`)
- Contrato v19, proposto: o campo do arquivo no `POST /imports`, o limite de 4 MB e os erros de arquivo
- Regras em `lib/utils/import-draft.ts`, com teste

## Não faz

Itens 106 a 109 em `08-project/ficou-de-fora.md`.
