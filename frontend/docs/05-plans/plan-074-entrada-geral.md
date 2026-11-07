# Plano 074: Entrada geral com a lista do conferido, abertura direta, bip e câmera em todo navegador

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `package.json`, `package-lock.json` | `@zxing/browser` e `@zxing/library` (item 94, aprovado na decisão de 11/10) |
| `src/components/products/camera-scan.tsx` | O leitor do navegador ou o ZXing, carregado ao abrir; "Abrindo a câmera…" até a imagem chegar; o botão aparece com qualquer câmera |
| `src/components/products/scan-feedback.ts` (novo) | Som (Web Audio) e vibração da leitura, a preferência do aparelho e a liberação do som no primeiro gesto |
| `src/components/products/scan-signal.tsx` (novo) | `ScanSignal` (toca ao chegar o resultado), `ScanSoundToggle` ("Bip ao ler") e `ScanSearchForm` (a busca com o `Form` do Next, sem recarregar a página) |
| `src/components/products/entry-search.tsx` | Usa o `ScanSearchForm`; "Bip ao ler" na entrada; sinal de "não achou" |
| `src/components/products/entry-today.tsx` (novo) | "Conferido hoje" |
| `src/app/(app)/estoque/entrada/page.tsx` | Um resultado só abre a entrada (`achado`); o código exato leva `lido`; sinal de "achou"; a coluna do conferido |
| Documentos | issue, validação, `ficou-de-fora.md` |
