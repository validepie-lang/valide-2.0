/**
 * Placar da fila (issue 072, item 24).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { NO_STREAK, afterSave, afterSkip, isMilestone, streakLabel } from "./queue-streak.ts"

describe("queue-streak", () => {
  it("cada produto salvo soma e a melhor acompanha", () => {
    const three = afterSave(afterSave(afterSave(NO_STREAK)))
    assert.deepEqual(three, { current: 3, best: 3 })
  })

  it("pular zera a sequência e guarda a melhor", () => {
    const skipped = afterSkip(afterSave(afterSave(NO_STREAK)))
    assert.deepEqual(skipped, { current: 0, best: 2 })
    assert.deepEqual(afterSave(skipped), { current: 1, best: 2 })
  })

  it("troféu a cada 10, nunca no zero", () => {
    assert.equal(isMilestone(0), false)
    assert.equal(isMilestone(9), false)
    assert.equal(isMilestone(10), true)
    assert.equal(isMilestone(20), true)
    assert.equal(isMilestone(21), false)
  })

  it("texto a partir de duas, com milhar com ponto", () => {
    assert.equal(streakLabel(0), null)
    assert.equal(streakLabel(1), null)
    assert.equal(streakLabel(2), "2 seguidas")
    assert.equal(streakLabel(1200), "1.200 seguidas")
  })
})
