/**
 * O que a importação confere antes de enviar (issue 056).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  checkCatalogFile,
  checkCatalogFiles,
  formatFileSize,
  hasMappingErrors,
  partCount,
  sameColumns,
  validateMapping,
} from "./import-draft.ts"

const fields = [
  { key: "name", label: "Nome do produto", required: true },
  { key: "sku", label: "Código interno (SKU)", required: false },
  { key: "acquisitionCost", label: "Custo de aquisição", required: false },
]
const columns = ["DESCRICAO", "COD", "CUSTO", "VLR"]

describe("checkCatalogFile", () => {
  it("CSV e XLSX dentro do limite passam", () => {
    assert.equal(checkCatalogFile({ name: "catalogo.CSV", size: 2048 }), null)
    assert.equal(checkCatalogFile({ name: "catalogo.xlsx", size: 4 * 1024 * 1024 }), null)
  })

  it("outro formato, vazio ou grande demais dizem o que fazer", () => {
    assert.match(checkCatalogFile({ name: "catalogo.pdf", size: 10 }) ?? "", /exporte a lista/)
    assert.match(checkCatalogFile({ name: "catalogo.csv", size: 0 }) ?? "", /vazio/)
    assert.match(
      checkCatalogFile({ name: "catalogo.csv", size: 25 * 1024 * 1024 }) ?? "",
      /25 MB.*20 MB.*Divida/,
    )
  })

  it("tamanho como no explorador de arquivos", () => {
    assert.equal(formatFileSize(380 * 1024), "380 KB")
    assert.equal(formatFileSize(1.25 * 1024 * 1024), "1,3 MB")
  })
})

describe("validateMapping", () => {
  it("nome escolhido e campos diferentes passam; coluna em branco não conta", () => {
    const errors = validateMapping({ DESCRICAO: "name", COD: "sku", CUSTO: "", VLR: "" }, columns, fields)
    assert.equal(hasMappingErrors(errors), false)
  })

  it("sem a coluna do nome, nada passa", () => {
    const errors = validateMapping({ COD: "sku" }, columns, fields)
    assert.equal(errors.general, "Escolha a coluna de nome do produto: sem ela, nenhuma linha entra.")
  })

  it("o mesmo campo em duas colunas marca a segunda", () => {
    const errors = validateMapping(
      { DESCRICAO: "name", CUSTO: "acquisitionCost", VLR: "acquisitionCost" },
      columns,
      fields,
    )
    assert.deepEqual(Object.keys(errors.columns), ["VLR"])
    assert.match(errors.columns.VLR, /já está na coluna CUSTO/)
  })
})

describe("várias planilhas (issue 075)", () => {
  const mb = 1024 * 1024
  it("até 5, até 20 MB no total, sem repetir", () => {
    assert.equal(
      checkCatalogFiles([
        { name: "a.csv", size: 6 * mb },
        { name: "b.xlsx", size: 3 * mb },
      ]),
      null,
    )
    assert.match(checkCatalogFiles([]) ?? "", /Escolha o arquivo/)
    assert.match(
      checkCatalogFiles(Array.from({ length: 6 }, (_, i) => ({ name: `${i}.csv`, size: 10 }))) ?? "",
      /até 5/,
    )
    assert.match(
      checkCatalogFiles([
        { name: "a.csv", size: 12 * mb },
        { name: "b.csv", size: 9 * mb },
      ]) ?? "",
      /somam 21 MB/,
    )
    assert.match(
      checkCatalogFiles([
        { name: "a.csv", size: 10 },
        { name: "a.pdf", size: 10 },
      ]) ?? "",
      /^a\.pdf: /,
    )
    assert.match(
      checkCatalogFiles([
        { name: "a.csv", size: 10 },
        { name: "A.csv", size: 10 },
      ]) ?? "",
      /duas vezes/,
    )
  })

  it("partes de 1 MB", () => {
    assert.equal(partCount(10), 1)
    assert.equal(partCount(mb), 1)
    assert.equal(partCount(6 * mb + 1), 7)
  })

  it("mesmas colunas, em qualquer ordem e caixa; a diferença diz qual", () => {
    assert.equal(
      sameColumns([
        { name: "loja1.csv", columns: ["NOME", "EAN"] },
        { name: "loja2.csv", columns: ["ean", "nome"] },
      ]),
      null,
    )
    assert.match(
      sameColumns([
        { name: "loja1.csv", columns: ["NOME", "EAN"] },
        { name: "loja2.csv", columns: ["NOME"] },
      ]) ?? "",
      /^loja2\.csv tem colunas diferentes de loja1\.csv: não tem EAN\./,
    )
  })
})
