/**
 * Datas livres em Movimentações (issue 073, item 76).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseDateRange, rangeLabel } from "./date-range.ts"

const today = "2026-10-13"

describe("parseDateRange", () => {
  it("sem datas vale o período pronto; só o início vai até hoje", () => {
    assert.equal(parseDateRange(undefined, undefined, today), null)
    assert.equal(parseDateRange("", " ", today), null)
    assert.deepEqual(parseDateRange("2026-09-01", "2026-09-30", today), {
      from: "2026-09-01",
      to: "2026-09-30",
    })
    assert.deepEqual(parseDateRange("2026-10-01", undefined, today), { from: "2026-10-01", to: today })
  })

  it("recusa com frase o que não serve", () => {
    assert.deepEqual(parseDateRange(undefined, "2026-09-30", today), {
      error: "Escolha também a data de início.",
    })
    assert.deepEqual(parseDateRange("2026-02-30", "2026-03-01", today), {
      error: "Uma das datas não existe no calendário.",
    })
    assert.deepEqual(parseDateRange("ontem", "2026-03-01", today), {
      error: "Uma das datas não existe no calendário.",
    })
    assert.deepEqual(parseDateRange("2026-09-30", "2026-09-01", today), {
      error: "A data de início vem depois da data final.",
    })
    assert.deepEqual(parseDateRange("2026-10-20", undefined, today), {
      error: "A data de início não pode passar de hoje.",
    })
    assert.deepEqual(parseDateRange("2026-10-01", "2026-10-14", today), {
      error: "A data final não pode passar de hoje.",
    })
    assert.deepEqual(parseDateRange("2025-10-01", "2025-10-31", today), {
      error: "Dá para ver até um ano para trás.",
    })
  })

  it("aceita exatamente um ano", () => {
    assert.ok(!("error" in (parseDateRange("2025-10-12", "2025-10-31", today) ?? {})))
  })
})

describe("rangeLabel", () => {
  it("dia e mês com zero, um dia só diz Em", () => {
    assert.equal(rangeLabel("2026-09-01", "2026-09-30"), "De 01/09/2026 a 30/09/2026")
    assert.equal(rangeLabel("2026-09-01", "2026-09-01"), "Em 01/09/2026")
  })
})
