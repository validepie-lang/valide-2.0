/**
 * Seleção do Estoque (issue 069).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { markedLabel, moveSummary, pageCheckState } from "./stock-selection.ts"

describe("pageCheckState", () => {
  const page = ["a", "b", "c"]
  it("vazia, meio-marcada e marcada", () => {
    assert.equal(pageCheckState(page, new Set()), "none")
    assert.equal(pageCheckState(page, new Set(["b"])), "some")
    assert.equal(pageCheckState(page, new Set(["a", "b", "c"])), "all")
  })
  it("o que está marcado fora da página não conta", () => {
    assert.equal(pageCheckState(page, new Set(["x", "y"])), "none")
  })
})

describe("textos", () => {
  it("singular e plural, com milhar", () => {
    assert.equal(markedLabel(1), "1 marcado")
    assert.equal(markedLabel(1200), "1.200 marcados")
  })
  it("confirmação de mover", () => {
    assert.equal(moveSummary(8, "Medicamentos"), "8 produtos movidos para Medicamentos.")
    assert.equal(moveSummary(1, "Infantil"), "1 produto movido para Infantil.")
    assert.equal(moveSummary(3, null), "3 produtos ficaram sem pasta.")
    assert.equal(moveSummary(1, null), "1 produto ficou sem pasta.")
  })
})
