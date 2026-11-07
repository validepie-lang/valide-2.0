/**
 * Modo de demonstração com o arquivo de verdade (issue 075, item 106).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { brNumber, previewFromSample, suggestMapping } from "./import-sample.ts"

describe("suggestMapping", () => {
  it("reconhece os cabeçalhos de exportação de sistema de farmácia", () => {
    assert.deepEqual(
      suggestMapping([
        "DESCRICAO_PRODUTO",
        "COD_INTERNO",
        "COD_BARRAS",
        "FABRICANTE",
        "GRUPO",
        "UNID",
        "QTD_ESTOQUE",
        "EST_MINIMO",
        "VLR_CUSTO",
        "VLR_VENDA",
        "FORNECEDOR",
        "NCM",
        "Validade",
        "Lote",
      ]),
      {
        DESCRICAO_PRODUTO: "name",
        COD_INTERNO: "sku",
        COD_BARRAS: "barcode",
        FABRICANTE: "brand",
        GRUPO: "folderName",
        UNID: "unit",
        QTD_ESTOQUE: "totalQuantity",
        EST_MINIMO: "minStock",
        VLR_CUSTO: "acquisitionCost",
        VLR_VENDA: "salePrice",
        FORNECEDOR: "supplier",
        NCM: "",
        Validade: "expiresAt",
        Lote: "lotCode",
      },
    )
  })

  it("um campo numa coluna só, e acento não atrapalha", () => {
    assert.deepEqual(suggestMapping(["Descrição", "Produto", "Preço"]), {
      Descrição: "name",
      Produto: "",
      Preço: "salePrice",
    })
  })
})

describe("brNumber", () => {
  it("número brasileiro e o simples", () => {
    assert.equal(brNumber("7,42"), 7.42)
    assert.equal(brNumber("1.234,56"), 1234.56)
    assert.equal(brNumber("1.234"), 1234)
    assert.equal(brNumber("12.5"), 12.5)
    assert.equal(brNumber("R$ 18,63"), 18.63)
    assert.equal(brNumber("UN"), null)
    assert.equal(brNumber(""), null)
  })
})

describe("previewFromSample", () => {
  const sample = {
    columns: ["DESCRICAO", "QTD", "CUSTO", "VENDA"],
    rows: [
      ["DIPIRONA", "76", "7,42", "14,90"],
      ["", "9", "", ""],
      ["DORFLEX", "doze", "18,63", "15,00"],
    ],
    rowCount: 120,
    stats: { empty: [4, 0, 2, 2], nonNumeric: [120, 3, 0, 1] },
  }
  const mapping = { DESCRICAO: "name", QTD: "totalQuantity", CUSTO: "acquisitionCost", VENDA: "salePrice" }

  it("linha a linha: o que entra, o erro de nome e os avisos", () => {
    const { rows } = previewFromSample(sample, mapping)
    assert.deepEqual(rows[0], {
      rowNumber: 2,
      action: "create",
      issues: [],
      data: { name: "DIPIRONA", unit: "un", totalQuantity: 76, acquisitionCost: 742, salePrice: 1490 },
    })
    assert.equal(rows[1].action, "skip")
    assert.equal(rows[1].issues[0].severity, "error")
    assert.deepEqual(
      rows[2].issues.map((i) => i.field),
      ["totalQuantity"],
    )
  })

  it("a contagem do arquivo inteiro sai das colunas", () => {
    const { errorRows, warningRows } = previewFromSample(sample, mapping)
    assert.equal(errorRows, 4)
    assert.equal(warningRows, 3)
  })
})
