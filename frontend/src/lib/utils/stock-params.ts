/**
 * A URL do Estoque lida num lugar só (issues 029, 068 e 069): o Estoque e a
 * tela de retirar vencidos recortam do mesmo jeito. Valor desconhecido é
 * ignorado, nunca quebra a tela.
 */

import { STATUS_LABEL, STATUS_ORDER, type ExpiryStatus } from "./expiry.ts"
import { NO_FOLDER, NO_FOLDER_PARAM } from "./no-folder.ts"
import type { ImportSource, ProductFilters } from "../types/index.ts"

/** O que o Estoque lê da URL (o mesmo formato de `StockSearchParams`) */
export type StockQuery = {
  status?: string
  pasta?: string
  origem?: string
  fornecedor?: string
  marca?: string
  busca?: string
}

export type StockFilter = Pick<
  ProductFilters,
  "status" | "source" | "folderId" | "supplier" | "brand" | "search"
>

const SOURCES = new Set<string>(["file", "integration", "manual"])
const SORTS = new Set<string>(["expiry_asc", "expiry_desc", "name_asc", "quantity_asc"])

/** "expired,soon" vira ["expired", "soon"], na ordem fixa dos estados */
export function parseStatuses(value: string | undefined): ExpiryStatus[] {
  if (!value) return []
  const wanted = new Set(value.split(","))
  return STATUS_ORDER.filter((s) => wanted.has(s))
}

/** Página da URL; qualquer coisa que não seja um inteiro positivo vira 1 */
export function parsePage(value: string | undefined): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : 1
}

export function parseSort(value: string | undefined): NonNullable<ProductFilters["sort"]> {
  return value && SORTS.has(value) ? (value as NonNullable<ProductFilters["sort"]>) : "expiry_asc"
}

/** O recorte para a API: "Sem pasta" (068) vira folderId=none */
export function stockFilter(params: StockQuery): StockFilter {
  const statuses = parseStatuses(params.status)
  return {
    status: statuses.length > 1 ? statuses : statuses[0],
    source: params.origem && SOURCES.has(params.origem) ? (params.origem as ImportSource) : undefined,
    folderId: params.pasta === NO_FOLDER_PARAM ? NO_FOLDER : params.pasta || undefined,
    supplier: params.fornecedor || undefined,
    brand: params.marca || undefined,
    search: params.busca || undefined,
  }
}

/** Retirar vencidos recortado como o Estoque (issue 069): o estado não vai, a tela já é só de vencidos */
export function retireHref(params: StockQuery): string {
  const query = new URLSearchParams()
  for (const key of ["pasta", "origem", "fornecedor", "marca", "busca"] as const) {
    const value = params[key]
    if (value) query.set(key, value)
  }
  const text = query.toString()
  return text ? `/estoque/retirar-vencidos?${text}` : "/estoque/retirar-vencidos"
}

/** "Vencido ou A vencer": o vocabulário fixo, e "ou" porque cada produto tem uma situação só */
export function joinLabels(statuses: ExpiryStatus[]): string {
  const labels = statuses.map((s) => STATUS_LABEL[s])
  return labels.length <= 1 ? labels.join("") : `${labels.slice(0, -1).join(", ")} ou ${labels.at(-1)}`
}
