/**
 * Baixa uma planilha montada no servidor (issues 073 e 075). O BOM vai em
 * bytes: como texto, ele se perdia na resposta da server action e o Excel em
 * português trocava os acentos.
 */
export function downloadCsv(csv: string, filename: string) {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf])
  const url = URL.createObjectURL(new Blob([bom, csv.replace(/^﻿/, "")], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
