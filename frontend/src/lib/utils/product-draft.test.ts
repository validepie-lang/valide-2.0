/**
 * Aviso imediato do cadastro de produto (issue 055). O servidor continua sendo
 * quem recusa; aqui se garante que o front não deixa passar o óbvio nem barra
 * o que é válido.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseMoneyInput, sellsBelowCost, validateProduct, type ProductDraft } from "./product-draft.ts"

const valid: ProductDraft = {
  name: " Dipirona Sódica 500mg ",
  sku: "",
  barcode: "7896004700014",
  folderId: "f2",
  brand: "Neo Química",
  supplier: " ",
  unit: "un",
  minStock: "",
  maxStock: "",
  acquisitionCost: "7,42",
  operationalCost: "",
  salePrice: "12,90",
}

describe("parseMoneyInput", () => {
  it("aceita o jeito brasileiro e o com ponto", () => {
    assert.equal(parseMoneyInput("7,42"), 742)
    assert.equal(parseMoneyInput("R$ 1.234,56"), 123456)
    assert.equal(parseMoneyInput("12"), 1200)
    assert.equal(parseMoneyInput("7.42"), 742)
    assert.equal(parseMoneyInput("1.234"), 123400)
  })

  it("recusa o que não é dinheiro", () => {
    for (const typed of ["", "abc", "7,423", "-5", "1,2,3"]) assert.equal(parseMoneyInput(typed), null, typed)
  })
})

describe("validateProduct", () => {
  it("produto completo vira o corpo, em centavos, com vazio como null", () => {
    assert.deepEqual(validateProduct(valid), {
      errors: {},
      input: {
        name: "Dipirona Sódica 500mg",
        sku: null,
        barcode: "7896004700014",
        folderId: "f2",
        brand: "Neo Química",
        supplier: null,
        unit: "un",
        minStock: 0,
        maxStock: null,
        acquisitionCost: 742,
        operationalCost: 0,
        salePrice: 1290,
      },
    })
  })

  it("nome, custo e preço são obrigatórios", () => {
    const { errors } = validateProduct({ ...valid, name: " ", acquisitionCost: "", salePrice: "" })
    assert.deepEqual(Object.keys(errors), ["name", "acquisitionCost", "salePrice"])
  })

  it("código de barras só com números, de 8 a 14", () => {
    assert.ok(validateProduct({ ...valid, barcode: "789-600" }).errors.barcode)
    assert.ok(validateProduct({ ...valid, barcode: "1234567" }).errors.barcode)
    assert.equal(validateProduct({ ...valid, barcode: "" }).input?.barcode, null)
  })

  it("máximo abaixo do mínimo não passa", () => {
    assert.equal(
      validateProduct({ ...valid, minStock: "20", maxStock: "10" }).errors.maxStock,
      "O estoque máximo precisa ser maior que o mínimo.",
    )
  })

  it("dinheiro fora do formato diz como escrever", () => {
    assert.match(validateProduct({ ...valid, salePrice: "doze" }).errors.salePrice ?? "", /7,42/)
  })

  it("vender abaixo do custo avisa, mas passa", () => {
    const below = { ...valid, salePrice: "5,00" }
    assert.equal(sellsBelowCost(below), true)
    assert.ok(validateProduct(below).input)
  })
})
