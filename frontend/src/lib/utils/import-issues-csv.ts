/**
 * As linhas com problema da importação numa planilha (issue 075, item 107),
 * para corrigir no sistema da farmácia e importar de novo. Mesmo formato das
 * planilhas de Perdas e de Movimentações: ponto e vírgula e o BOM.
 */

import type { ImportPreviewRow } from "../types/index.ts"

function cell(value: string | number): string {
  const text = String(value)
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function importIssuesCsv(rows: readonly ImportPreviewRow[], fileName: string | null): string {
  const unique = [...new Map(rows.map((r) => [r.rowNumber, r])).values()].sort(
    (a, b) => a.rowNumber - b.rowNumber,
  )
  const lines: (string | number)[][] = [
    ["Linhas com problema", fileName ?? ""],
    ["Erro: a linha fica de fora. Aviso: a linha entra, mas vale conferir."],
    [],
    ["Linha", "Produto", "Código de barras", "Código interno", "Tipo", "Problema"],
    ...unique.flatMap((row) =>
      row.issues.map((issue) => [
        row.rowNumber,
        row.data.name ?? "",
        row.data.barcode ?? "",
        row.data.sku ?? "",
        issue.severity === "error" ? "Erro" : "Aviso",
        issue.message,
      ]),
    ),
  ]
  return "﻿" + lines.map((l) => l.map(cell).join(";")).join("\r\n")
}
