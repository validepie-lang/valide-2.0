/**
 * Notas e alterações do cadastro de exemplo (issue 070). Derivadas do
 * catálogo, para os valores baterem com o que a ficha mostra hoje.
 */

import { daily, isoAtLocalTime, mockProducts } from "@/lib/mocks/catalog"
import type { ProductChange, ProductNote } from "@/lib/types"

const NOTES: Record<string, [daysAgo: number, time: string, userName: string, text: string][]> = {
  p1: [
    [
      1,
      "10:12",
      "Juliana Ferreira",
      "O lote L2291 venceu e já está separado no fundo da loja, esperando o descarte.",
    ],
    [15, "16:40", "Marcus Campos", "Cliente fixo compra duas caixas por semana. Manter o mínimo em 20."],
  ],
  p6: [
    [
      2,
      "09:05",
      "Rafael Nogueira",
      "Lote TS9126 separado para devolução ao fornecedor. Aguardando a coleta.",
    ],
  ],
  p30: [
    [
      4,
      "14:22",
      "Camila Duarte",
      "Uma caixa chegou amassada no último pedido. Conferir a embalagem antes de vender.",
    ],
  ],
}

export const mockProductNotes = daily((): Record<string, ProductNote[]> =>
  Object.fromEntries(
    Object.entries(NOTES).map(([productId, notes]) => [
      productId,
      notes.map(([daysAgo, time, userName, text], i) => ({
        id: `${productId}-n${i + 1}`,
        text,
        userName,
        createdAt: isoAtLocalTime(daysAgo, time),
      })),
    ]),
  ),
)

/** Do mais recente ao mais antigo, como o histórico de movimentação */
export const mockProductChanges = daily((): Record<string, ProductChange[]> => {
  const all: Record<string, ProductChange[]> = {}
  mockProducts().forEach((p, index) => {
    const changes: ProductChange[] = []
    if (index % 3 === 0) {
      changes.push({
        id: `${p.id}-c-preco`,
        at: isoAtLocalTime(3 + (index % 5), "11:30"),
        userName: "Camila Duarte",
        kind: "updated",
        field: "salePrice",
        from: Math.round((p.salePrice * 0.94) / 10) * 10,
        to: p.salePrice,
      })
    }
    if (index % 4 === 0) {
      changes.push({
        id: `${p.id}-c-minimo`,
        at: isoAtLocalTime(9, "17:05"),
        userName: "Marcus Campos",
        kind: "updated",
        field: "minStock",
        from: Math.max(1, p.minStock - 2),
        to: p.minStock,
      })
    }
    if (index % 7 === 0 && p.folderName) {
      changes.push({
        id: `${p.id}-c-pasta`,
        at: isoAtLocalTime(20, "08:50"),
        userName: "Rafael Nogueira",
        kind: "updated",
        field: "folder",
        from: null,
        to: p.folderName,
      })
    }
    changes.push({
      id: `${p.id}-c-criado`,
      at: isoAtLocalTime(32 + (index % 9), "15:00"),
      userName: p.source === "file" ? null : "Marcus Campos",
      kind: "created",
      source: p.source,
    })
    all[p.id] = changes.sort((a, b) => b.at.localeCompare(a.at))
  })
  return all
})
