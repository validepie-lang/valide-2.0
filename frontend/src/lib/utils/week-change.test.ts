/**
 * Variação semanal do valor em risco (issue 067).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { weekChange } from "./week-change.ts"

describe("weekChange", () => {
  it("sobe e desce em porcentagem inteira, com o sinal de menos tipográfico", () => {
    assert.deepEqual(weekChange(112_00, 100_00), { direction: "up", text: "+12% desde a semana passada" })
    assert.deepEqual(weekChange(92_00, 100_00), { direction: "down", text: "−8% desde a semana passada" })
  })

  it("arredonda e não mostra +0%", () => {
    assert.equal(weekChange(100_40, 100_00)?.text, "menos de 1% desde a semana passada")
    assert.equal(weekChange(1_501, 1_000)?.text, "+50% desde a semana passada")
  })

  it("milhar com ponto, como o resto da tela", () => {
    assert.equal(weekChange(2_100_00, 10_00)?.text, "+20.900% desde a semana passada")
  })

  it("igual e a partir de zero dizem em palavras", () => {
    assert.deepEqual(weekChange(50_00, 50_00), { direction: "flat", text: "Igual à semana passada" })
    assert.deepEqual(weekChange(0, 0), { direction: "flat", text: "Igual à semana passada" })
    assert.deepEqual(weekChange(50_00, 0), { direction: "up", text: "Era zero na semana passada" })
  })

  it("sem a semana passada não há variação", () => {
    assert.equal(weekChange(50_00, null), null)
    assert.equal(weekChange(50_00, undefined), null)
  })
})
