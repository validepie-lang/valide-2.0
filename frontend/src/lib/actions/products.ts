"use server"

import { createProduct, updateProduct } from "@/lib/services/products"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import type { NewProductInput, ProductInput } from "@/lib/utils/product-draft"
import {
  moveProductsToFolder,
  productIdsMatching,
  type MoveResult,
  type StockFilter,
} from "@/lib/services/product-folders"
import { STATUS_ORDER, type ExpiryStatus } from "@/lib/utils/expiry"
import type { Product } from "@/lib/types"

/**
 * Pontes para o formulário de produto chamar o serviço no servidor (issue 055).
 * Não persistem nada: repassam para `POST /products` e `PATCH /products/:id`.
 */
export async function addProduct(input: NewProductInput): Promise<ActionResult<Product>> {
  try {
    return { ok: true, data: await createProduct(input) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

export async function editProduct(id: string, input: ProductInput): Promise<ActionResult<Product>> {
  try {
    return { ok: true, data: await updateProduct(id, input) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/**
 * Mover de pasta os marcados no Estoque (issue 069). "Todos os N" chega como o
 * filtro da tela, e os ids são juntados aqui, no servidor, com a mesma busca.
 * Só as chaves conhecidas do filtro passam adiante.
 */
export async function moveToFolder(
  target: { ids: string[] } | { filter: StockFilter },
  folderId: string | null,
): Promise<ActionResult<MoveResult>> {
  try {
    const ids = "ids" in target ? target.ids : await productIdsMatching(cleanFilter(target.filter))
    return { ok: true, data: await moveProductsToFolder(ids, folderId) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

function cleanFilter(filter: StockFilter): StockFilter {
  const text = (value: unknown) => (typeof value === "string" && value ? value : undefined)
  const statuses = (Array.isArray(filter.status) ? filter.status : [filter.status]).filter(
    (s): s is ExpiryStatus => STATUS_ORDER.includes(s as ExpiryStatus),
  )
  const source = text(filter.source)
  return {
    status: statuses.length ? statuses : undefined,
    source: source === "file" || source === "integration" || source === "manual" ? source : undefined,
    folderId: text(filter.folderId),
    supplier: text(filter.supplier),
    brand: text(filter.brand),
    search: text(filter.search),
  }
}
