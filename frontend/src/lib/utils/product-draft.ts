/**
 * Regras do cadastro e da edição de produto (issue 055).
 *
 * São o aviso imediato, antes de enviar: quem recusa de verdade é o servidor
 * (código de barras repetido, `409 BARCODE_TAKEN`). Dinheiro sai daqui em
 * centavos, inteiro (business-rules.md seção 8).
 */

import type { LotInput } from "@/lib/utils/lot-draft"
import type { ProductUnit } from "@/lib/types"

/** O que se digita, como texto, na ordem da tela */
export type ProductDraft = {
  name: string
  sku: string
  barcode: string
  folderId: string
  brand: string
  supplier: string
  unit: string
  minStock: string
  maxStock: string
  acquisitionCost: string
  operationalCost: string
  salePrice: string
}
export type ProductDraftErrors = Partial<Record<keyof ProductDraft, string>>

/** O corpo de `PATCH /products/:id` (contrato v18, proposto) */
export type ProductInput = {
  name: string
  sku: string | null
  barcode: string | null
  folderId: string | null
  brand: string | null
  supplier: string | null
  unit: ProductUnit
  minStock: number
  maxStock: number | null
  acquisitionCost: number
  operationalCost: number
  salePrice: number
}
/** O corpo de `POST /products`: o produto mais os lotes iniciais, que podem ser nenhum */
export type NewProductInput = ProductInput & { lots: LotInput[] }

const UNITS: readonly ProductUnit[] = ["un", "kg", "cx"]
const MONEY_FORMAT = "Use o formato da etiqueta, com vírgula nos centavos: 7,42."

/**
 * "7,42", "1.234,56", "R$ 12" ou "7.42" viram centavos. O ponto sozinho com
 * três dígitos depois ("1.234") é milhar, como se escreve no Brasil.
 */
export function parseMoneyInput(typed: string): number | null {
  let value = typed.replace(/R\$/i, "").replace(/\s/g, "")
  if (!value) return null
  if (value.includes(",")) value = value.replace(/\./g, "").replace(",", ".")
  else if (!/^\d+\.\d{1,2}$/.test(value)) value = value.replace(/\./g, "")
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null
  return Math.round(Number(value) * 100)
}

function parseAmount(typed: string): number | null {
  const value = Number(typed.trim().replace(",", "."))
  return typed.trim() !== "" && Number.isFinite(value) && value >= 0 ? value : null
}

const orNull = (value: string) => value.trim() || null

export function validateProduct(draft: ProductDraft): {
  errors: ProductDraftErrors
  input: ProductInput | null
} {
  const errors: ProductDraftErrors = {}
  const name = draft.name.trim()
  if (!name) errors.name = "Escreva o nome do produto, como está na caixa."

  const barcode = draft.barcode.trim()
  if (barcode && !/^\d{8,14}$/.test(barcode)) {
    errors.barcode = "O código de barras tem só números, de 8 a 14 dígitos."
  }

  const minStock = draft.minStock.trim() === "" ? 0 : parseAmount(draft.minStock)
  if (minStock === null) errors.minStock = "Use um número igual ou maior que zero."
  const maxStock = draft.maxStock.trim() === "" ? null : parseAmount(draft.maxStock)
  if (draft.maxStock.trim() !== "" && maxStock === null)
    errors.maxStock = "Use um número igual ou maior que zero."
  else if (maxStock !== null && minStock !== null && maxStock < minStock) {
    errors.maxStock = "O estoque máximo precisa ser maior que o mínimo."
  }

  const acquisitionCost = parseMoneyInput(draft.acquisitionCost)
  if (!draft.acquisitionCost.trim()) {
    errors.acquisitionCost = "Informe o custo de aquisição. É ele que calcula o valor parado."
  } else if (acquisitionCost === null) errors.acquisitionCost = MONEY_FORMAT
  const operationalCost = draft.operationalCost.trim() ? parseMoneyInput(draft.operationalCost) : 0
  if (operationalCost === null) errors.operationalCost = MONEY_FORMAT
  const salePrice = parseMoneyInput(draft.salePrice)
  if (!draft.salePrice.trim()) errors.salePrice = "Informe o preço de venda."
  else if (salePrice === null) errors.salePrice = MONEY_FORMAT

  const unit = UNITS.find((u) => u === draft.unit) ?? "un"
  if (
    Object.keys(errors).length > 0 ||
    minStock === null ||
    acquisitionCost === null ||
    operationalCost === null ||
    salePrice === null
  ) {
    return { errors, input: null }
  }
  return {
    errors,
    input: {
      name,
      sku: orNull(draft.sku),
      barcode: barcode || null,
      folderId: orNull(draft.folderId),
      brand: orNull(draft.brand),
      supplier: orNull(draft.supplier),
      unit,
      minStock,
      maxStock,
      acquisitionCost,
      operationalCost,
      salePrice,
    },
  }
}

/** Preço de venda abaixo do custo: aviso, não bloqueio (business-rules.md seção 8) */
export function sellsBelowCost(draft: Pick<ProductDraft, "acquisitionCost" | "salePrice">): boolean {
  const cost = parseMoneyInput(draft.acquisitionCost)
  const price = parseMoneyInput(draft.salePrice)
  return cost !== null && price !== null && price < cost
}
