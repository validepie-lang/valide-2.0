import { type LotDraft } from "@/components/products/lot-fields"
import { validateLot, type LotDraftErrors, type LotInput } from "@/lib/utils/lot-draft"
import type { ProductDraft, ProductDraftErrors } from "@/lib/utils/product-draft"
import type { Product } from "@/lib/types"

/*
 * O estado do formulário de produto (issue 055): ler os campos, o valor
 * inicial, conferir os lotes do cadastro e achar o primeiro campo errado.
 * Separado de `product-form` e `product-fields`, que passavam de 200 linhas.
 */

/** O id de cada campo na tela, na ordem da tela: o primeiro errado recebe o foco */
export const PRODUCT_FIELD_IDS: Record<keyof ProductDraft, string> = {
  name: "nome",
  sku: "sku",
  barcode: "ean",
  folderId: "pasta",
  brand: "marca",
  supplier: "fornecedor",
  unit: "unidade",
  minStock: "minimo",
  maxStock: "maximo",
  acquisitionCost: "custo",
  operationalCost: "operacional",
  salePrice: "venda",
}

/** Centavos no formato que a pessoa digita: 742 vira "7,42" */
export function centsToInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** O que os campos mostram ao abrir: o produto em edição, ou o código que veio da entrada geral */
export function initialProductDraft(product?: Product, initialBarcode?: string): ProductDraft {
  return {
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? initialBarcode ?? "",
    folderId: product?.folderId ?? "",
    brand: product?.brand ?? "",
    supplier: product?.supplier ?? "",
    unit: product?.unit ?? "un",
    minStock: product ? String(product.minStock) : "",
    maxStock: product?.maxStock != null ? String(product.maxStock) : "",
    acquisitionCost: product ? centsToInput(product.acquisitionCost) : "",
    operationalCost: product ? centsToInput(product.operationalCost) : "",
    salePrice: product ? centsToInput(product.salePrice) : "",
  }
}

/** Lê os campos pelo `name`, que é a chave do rascunho */
export function readProductDraft(form: HTMLFormElement): ProductDraft {
  const data = new FormData(form)
  const draft = {} as ProductDraft
  for (const key of Object.keys(PRODUCT_FIELD_IDS) as (keyof ProductDraft)[]) {
    draft[key] = String(data.get(key) ?? "")
  }
  return draft
}

const isBlank = (lot: LotDraft) =>
  !lot.code.trim() && !lot.madeAt && !lot.expiresAt && !lot.quantity.trim()

/** Cada lote preenchido validado contra os outros blocos (código repetido no mesmo cadastro) */
export function checkLots(lots: LotDraft[]) {
  const filled = lots.filter((lot) => !isBlank(lot))
  const errors: Record<number, LotDraftErrors> = {}
  const inputs: LotInput[] = []
  for (const lot of filled) {
    const takenCodes = filled.filter((other) => other.key !== lot.key).map((other) => other.code.trim())
    const result = validateLot(lot, { takenCodes })
    if (result.input) inputs.push(result.input)
    else errors[lot.key] = result.errors
  }
  const firstInvalid = filled.find((lot) => errors[lot.key])
  return { errors, inputs, firstInvalid, ok: Object.keys(errors).length === 0 }
}

/** Os ids de `LotFields`, na ordem da tela */
const LOT_FIELD_PREFIX = { code: "lote", madeAt: "fab", expiresAt: "val", quantity: "qtd" } as const

/** Primeiro campo errado na ordem da tela: os dados do produto vêm antes dos lotes (Primer, Forms) */
export function firstErrorId(invalid: ProductDraftErrors, lotCheck: ReturnType<typeof checkLots> | null) {
  const own = (Object.keys(PRODUCT_FIELD_IDS) as (keyof ProductDraft)[]).find((key) => invalid[key])
  if (own) return PRODUCT_FIELD_IDS[own]
  const lot = lotCheck?.firstInvalid
  if (!lot) return null
  const fields = Object.keys(LOT_FIELD_PREFIX) as (keyof typeof LOT_FIELD_PREFIX)[]
  const field = fields.find((f) => lotCheck.errors[lot.key][f])
  return field ? `${LOT_FIELD_PREFIX[field]}-${lot.key}` : null
}
