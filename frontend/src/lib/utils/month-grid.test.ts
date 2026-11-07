/** A grade do calendário de vencimentos (issue 052) */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { addMonths, monthGrid, monthLabel, parseMonth } from "./month-grid.ts"

describe("monthGrid", () => {
  it("outubro de 2026 começa numa quinta e tem 5 semanas de domingo a sábado", () => {
    const weeks = monthGrid(parseMonth("2026-10")!)
    assert.equal(weeks.length, 5)
    assert.deepEqual(
      weeks[0].map((d) => d.day),
      [27, 28, 29, 30, 1, 2, 3],
    )
    assert.equal(weeks[0][3].inMonth, false)
    assert.equal(weeks[0][4].key, "2026-10-01")
    assert.equal(weeks.at(-1)!.at(-1)!.key, "2026-10-31")
  })

  it("mês que começa no domingo não ganha semana vazia", () => {
    const weeks = monthGrid(parseMonth("2026-02")!)
    assert.equal(weeks[0][0].key, "2026-02-01")
    assert.equal(weeks.length, 4)
  })
})

describe("parseMonth", () => {
  it("recusa mês inválido", () => {
    assert.equal(parseMonth("2026-13"), null)
    assert.equal(parseMonth("outubro"), null)
    assert.equal(parseMonth(undefined), null)
  })

  it("avança o ano na virada", () => {
    assert.equal(addMonths(parseMonth("2026-12")!, 1).toISOString().slice(0, 7), "2027-01")
  })

  it("nome do mês em português", () => {
    assert.equal(monthLabel(parseMonth("2026-10")!), "outubro de 2026")
  })
})
