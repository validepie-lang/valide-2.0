/**
 * O modo de demonstração com o arquivo de verdade (issue 075, item 106): o
 * palpite do campo de cada coluna e a revisão montada da amostra que o
 * navegador leu. Com a API ligada, as duas coisas são do servidor.
 */

import type { CatalogSample } from "./catalog-read.ts"
import type { ImportPreviewRow, Product } from "../types/index.ts"

/** Palavras do cabeçalho que dizem o campo, na ordem em que se testa (o mais específico primeiro) */
const GUESSES: [RegExp, string][] = [
  [/barra|ean|gtin/, "barcode"],
  [/valid|venc/, "expiresAt"],
  [/lote/, "lotCode"],
  [/minim/, "minStock"],
  [/custo|compra/, "acquisitionCost"],
  [/venda|preco|pmc/, "salePrice"],
  [/fornec/, "supplier"],
  [/fabric|marca|laborat/, "brand"],
  [/grupo|categ|pasta|secao|classe|departamento/, "folderName"],
  [/unid|^un$|medida/, "unit"],
  [/qtd|quant|estoque|saldo/, "totalQuantity"],
  [/cod|sku|interno|referencia/, "sku"],
  [/descri|produto|nome/, "name"],
]

function normalize(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[_\-.]+/g, " ")
    .trim()
}

/** Cada campo numa coluna só: a primeira que bate fica com ele, as outras em branco */
export function suggestMapping(columns: readonly string[]): Record<string, string> {
  const taken = new Set<string>()
  return Object.fromEntries(
    columns.map((column) => {
      const name = normalize(column)
      const field = GUESSES.find(([pattern, key]) => !taken.has(key) && pattern.test(name))?.[1] ?? ""
      if (field) taken.add(field)
      return [column, field]
    }),
  )
}

/** "1.234,56" ou "7,42" para número; texto que não é número vira null */
export function brNumber(value: string): number | null {
  const v = value.replace(/^R\$\s*/i, "").trim()
  if (!v) return null
  const normalized = /,\d+$/.test(v) || /\.\d{3}(,|$)/.test(v) ? v.replace(/\./g, "").replace(",", ".") : v
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

const NUMERIC: Record<string, string> = {
  totalQuantity: "A quantidade veio como texto e foi lida como 0. Confira depois de importar.",
  minStock: "O estoque mínimo veio como texto e foi lido como 0.",
  acquisitionCost: "O custo veio como texto e ficou em branco. Confira depois de importar.",
  salePrice: "O preço de venda veio como texto e ficou em branco.",
}

/**
 * As linhas da amostra como a revisão mostra, e a contagem do arquivo inteiro
 * pelas estatísticas de cada coluna. Sem a regra de produto repetido (item
 * 26), toda linha que entra aparece como nova.
 */
export function previewFromSample(
  sample: CatalogSample,
  mapping: Record<string, string>,
): { rows: ImportPreviewRow[]; errorRows: number; warningRows: number } {
  const column = (field: string) => sample.columns.findIndex((c) => mapping[c] === field)
  const nameAt = column("name")
  const rows = sample.rows.map((cells, i): ImportPreviewRow => {
    const cell = (field: string) => {
      const at = column(field)
      return at >= 0 ? cells[at] : ""
    }
    const issues: ImportPreviewRow["issues"] = []
    const data: Partial<Product> = {}
    if (cell("name")) data.name = cell("name")
    else
      issues.push({
        field: "name",
        severity: "error",
        message: "A coluna de nome do produto está vazia nesta linha.",
      })
    if (cell("sku")) data.sku = cell("sku")
    if (cell("barcode")) data.barcode = cell("barcode")
    if (cell("brand")) data.brand = cell("brand")
    const unit = cell("unit").toLowerCase()
    data.unit = unit === "kg" || unit === "cx" ? unit : "un"
    for (const field of Object.keys(NUMERIC)) {
      const raw = cell(field)
      if (!raw) continue
      const n = brNumber(raw)
      if (n === null) issues.push({ field, severity: "warning", message: NUMERIC[field] })
      else if (field === "acquisitionCost") data.acquisitionCost = Math.round(n * 100)
      else if (field === "salePrice") data.salePrice = Math.round(n * 100)
      else if (field === "totalQuantity") data.totalQuantity = n
      else if (field === "minStock") data.minStock = n
    }
    // Preço abaixo do custo compara duas colunas: a contagem por coluna não vê, então a
    // demonstração não mostra, para a linha e o número do filtro baterem
    return { rowNumber: i + 2, data, issues, action: data.name ? "create" : "skip" }
  })

  const errorRows = nameAt >= 0 ? sample.stats.empty[nameAt] : sample.rowCount
  // Uma linha pode ter dois avisos: o maior número de uma coluna é o mínimo de linhas com aviso
  const warningRows = Math.min(
    sample.rowCount - errorRows,
    Math.max(
      0,
      ...Object.keys(NUMERIC).map((f) => {
        const at = column(f)
        return at >= 0 ? sample.stats.nonNumeric[at] : 0
      }),
    ),
  )
  return { rows, errorRows, warningRows }
}
