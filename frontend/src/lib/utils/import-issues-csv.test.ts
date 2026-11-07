/**
 * Planilha das linhas com problema (issue 075, item 107).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { importIssuesCsv } from "./import-issues-csv.ts"

describe("importIssuesCsv", () => {
  it("uma linha por problema, na ordem do arquivo, sem repetir a linha", () => {
    const csv = importIssuesCsv(
      [
        {
          rowNumber: 7,
          action: "skip",
          data: { name: "Neosaldina; 30", barcode: "789" },
          issues: [{ field: "barcode", severity: "error", message: "Repetido." }],
        },
        {
          rowNumber: 3,
          action: "create",
          data: { name: "Omeprazol", sku: "004184" },
          issues: [{ field: "x", severity: "warning", message: "Abaixo do custo." }],
        },
        {
          rowNumber: 7,
          action: "skip",
          data: { name: "Neosaldina; 30", barcode: "789" },
          issues: [{ field: "barcode", severity: "error", message: "Repetido." }],
        },
      ],
      "catalogo.xlsx",
    ).split("\r\n")
    assert.equal(csv[0], "﻿Linhas com problema;catalogo.xlsx")
    assert.equal(csv[3], "Linha;Produto;Código de barras;Código interno;Tipo;Problema")
    assert.equal(csv[4], "3;Omeprazol;;004184;Aviso;Abaixo do custo.")
    assert.equal(csv[5], '7;"Neosaldina; 30";789;;Erro;Repetido.')
    assert.equal(csv.length, 6)
  })
})
