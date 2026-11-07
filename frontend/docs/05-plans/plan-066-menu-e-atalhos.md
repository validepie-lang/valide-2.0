# Plano 066: Menu e atalhos

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `src/components/layout/side-rail.tsx` | Oito destinos no trilho (Movimentações, Calendário e Avisos novos); item mais baixo; lista rola dentro do trilho em tela baixa; barra do celular com lista própria, que ganha Ajuda. `HelpLink` passa a usar o mesmo item da lista |
| `src/app/globals.css` | Token `--elevation-button` (claro e escuro) e `--shadow-button` na ponte do tema |
| `src/components/ui/button.tsx` | Primário com `shadow-button` no lugar de `shadow-xs` |
| `docs/01-references/design-system.md` | Seção 11 (sombra do botão) e linha do trilho (oito destinos, celular com seis) |
| Documentos | issue, plano, validação, `ficou-de-fora.md` (80, 61, 97, 89, 32 feitos) |

## Reutilizado

`activeHref` (o item mais específico ganha) já resolve Estoque contra Movimentações e Calendário. Ícones do lucide já usados nas abas do Estoque e no sino.
