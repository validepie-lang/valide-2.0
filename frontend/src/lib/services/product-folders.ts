import { apiPatch } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { demoFolders, demoProducts, record } from "@/lib/services/demo-store"
import { getProducts } from "@/lib/services/products"
import type { StockFilter } from "@/lib/utils/stock-params"

/**
 * Mover vários produtos de pasta de uma vez (issue 069, item 68), pelo
 * `PATCH /products/folder` (contrato v25, proposto). Sem a área ligada,
 * confere o que o servidor conferiria e responde como ele.
 */

/** O recorte do Estoque, para "todos os N" valer o que a tela mostra */
export type { StockFilter }

/** Acima disso o servidor recusa: um pedido só não deve travar a conta */
export const MAX_MOVE = 500

export type MoveResult = { moved: number; folderName: string | null }

export async function moveProductsToFolder(
  productIds: string[],
  folderId: string | null,
): Promise<MoveResult> {
  if (isLive("products")) return apiPatch<MoveResult>("/products/folder", { productIds, folderId })

  if (productIds.length === 0) {
    throw new ApiError("invalid", 422, "Marque ao menos um produto para mover.", "NOTHING_SELECTED")
  }
  if (productIds.length > MAX_MOVE) {
    throw new ApiError(
      "invalid",
      422,
      `Dá para mover até ${MAX_MOVE} produtos de cada vez. Filtre o estoque e mova por partes.`,
      "TOO_MANY_PRODUCTS",
    )
  }
  const folder = folderId === null ? null : (await demoFolders()).find((f) => f.id === folderId)
  if (folder === undefined) {
    throw new ApiError(
      "notFound",
      404,
      "Esta pasta não existe mais. Recarregue a página.",
      "FOLDER_NOT_FOUND",
    )
  }
  const known = new Set((await demoProducts()).map((p) => p.id))
  if (productIds.some((id) => !known.has(id))) {
    throw new ApiError(
      "notFound",
      404,
      "Algum produto marcado não existe mais. Recarregue a página e marque de novo.",
      "PRODUCT_NOT_FOUND",
    )
  }
  // Desde a issue 071 a mudança fica no registro da demonstração (cookie)
  await record({ t: "folder", at: new Date().toISOString(), ids: productIds, folderId })
  return { moved: productIds.length, folderName: folder?.name ?? null }
}

/** Os ids de todos os produtos de um recorte, de 100 em 100, como a tela os listaria */
export async function productIdsMatching(filter: StockFilter): Promise<string[]> {
  const ids: string[] = []
  for (let page = 1; ; page++) {
    const { data, meta } = await getProducts({ ...filter, page, perPage: 100 })
    ids.push(...data.map((p) => p.id))
    if (data.length === 0 || ids.length >= meta.total || ids.length > MAX_MOVE) return ids
  }
}
