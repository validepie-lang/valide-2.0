/**
 * Regras e textos das partes novas do detalhe do produto (issue 070): nota,
 * foto, estoque útil por lote e alterações do cadastro. Separadas da tela
 * para ter teste. Quem decide de verdade continua sendo o servidor.
 */

import { formatMoney, formatQuantity } from "./format.ts"
import type { ImportSource, ProductChange, ProductChangeField } from "../types/index.ts"

/* ---------------------------------------------------------------- nota */

export const MAX_NOTE = 500

export function noteError(text: string): string | null {
  const clean = text.trim()
  if (!clean) return "Escreva a nota antes de salvar."
  if (clean.length > MAX_NOTE) return `A nota passou de ${MAX_NOTE} letras. Encurte para salvar.`
  return null
}

/* ---------------------------------------------------------------- foto */

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024

/** Conferido antes de enviar, para não esperar o servidor recusar */
export function photoFileError(file: { type: string; size: number }): string | null {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return "Envie a foto em JPG, PNG ou WebP."
  }
  if (file.size > MAX_PHOTO_BYTES) return "A foto passou de 2 MB. Envie uma menor."
  return null
}

/* ---------------------------------------------------- estoque útil (14) */

type LotLike = { code: string; quantity: number; status: string }

/**
 * Item 14: o total passa do mínimo, mas o que está vencido vai sair da
 * prateleira. Sem ele, o produto fica abaixo do mínimo: é o aviso por lote
 * que importa no Valide. Nada a dizer quando o total já está abaixo (o
 * cartão já diz) ou quando nenhum lote venceu.
 */
export function usableStockWarning(product: {
  minStock: number
  totalQuantity: number
  unit: string
  lots: LotLike[]
}): string | null {
  const expired = product.lots.filter((lot) => lot.status === "expired")
  if (expired.length === 0 || product.totalQuantity < product.minStock) return null
  const usable = product.totalQuantity - expired.reduce((sum, lot) => sum + lot.quantity, 0)
  if (usable >= product.minStock) return null
  const codes = expired.map((lot) => lot.code)
  const which =
    codes.length === 1
      ? `o lote vencido ${codes[0]}`
      : `os lotes vencidos ${codes.slice(0, -1).join(", ")} e ${codes.at(-1)}`
  return `Sem ${which}, ${usable === 1 ? "fica" : "ficam"} ${formatQuantity(usable, product.unit)}: abaixo do mínimo de ${formatQuantity(product.minStock, product.unit)}.`
}

/* ------------------------------------------------- alterações (15) */

const FIELD: Record<ProductChangeField, string> = {
  name: "o nome",
  salePrice: "o preço de venda",
  acquisitionCost: "o custo de compra",
  minStock: "o estoque mínimo",
  folder: "a pasta",
  barcode: "o código de barras",
  brand: "a marca",
  supplier: "o fornecedor",
}

const CREATED: Record<ImportSource, string> = {
  file: "criou o produto pela planilha",
  integration: "criou o produto pela integração",
  manual: "cadastrou o produto",
}

function show(field: ProductChangeField, value: string | number | null, unit: string): string {
  if (value === null) return field === "folder" ? "Sem pasta" : ""
  if (field === "salePrice" || field === "acquisitionCost") return formatMoney(Number(value))
  if (field === "minStock") return formatQuantity(Number(value), unit)
  return String(value)
}

/** "Camila Duarte" + "mudou o preço de venda de R$ 21,90 para R$ 23,40" */
export function describeChange(change: ProductChange, unit: string): { who: string; what: string } {
  if (change.kind === "created") {
    return { who: change.userName ?? "Importação", what: CREATED[change.source] }
  }
  const label = FIELD[change.field]
  const from = show(change.field, change.from, unit)
  const to = show(change.field, change.to, unit)
  if (!from) return { who: change.userName, what: `preencheu ${label}: ${to}` }
  if (!to) return { who: change.userName, what: `apagou ${label} (era ${from})` }
  return { who: change.userName, what: `mudou ${label} de ${from} para ${to}` }
}
