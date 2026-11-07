/**
 * Correção de movimentação (issue 073, item 79).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { canBeCorrected, correctsLabel, fixDelta, fixEffect, validateFix } from "./movement-fix.ts"

const exit = { type: "out" as const, quantity: 6, unit: "un" as const }
const entry = { type: "in" as const, quantity: 30, unit: "un" as const }

describe("movement-fix", () => {
  it("saída a mais devolve ao lote; entrada a mais tira", () => {
    assert.equal(fixDelta(exit, 2), 4)
    assert.equal(fixDelta(exit, 0), 6)
    assert.equal(fixDelta(exit, 8), -2)
    assert.equal(fixDelta(entry, 24), -6)
    assert.equal(fixDelta(entry, 36), 6)
  })

  it("só entrada e saída, e uma vez", () => {
    assert.equal(canBeCorrected({ ...exit, correctedAt: null }), true)
    assert.equal(canBeCorrected({ ...exit, correctedAt: "2026-10-13T10:00:00Z" }), false)
    assert.equal(canBeCorrected({ type: "adjust", quantity: 4, correctedAt: null }), false)
  })

  it("aceita zero e recusa vazio, negativo e a mesma quantidade", () => {
    assert.deepEqual(validateFix({ quantity: "0", note: "Venda cancelada no caixa" }, exit).input, {
      quantity: 0,
      note: "Venda cancelada no caixa",
    })
    assert.equal(
      validateFix({ quantity: "", note: "ok, conferido" }, exit).errors.quantity,
      "Informe a quantidade que de fato saiu.",
    )
    assert.match(
      validateFix({ quantity: "-1", note: "ok, conferido" }, exit).errors.quantity ?? "",
      /negativa/,
    )
    assert.match(
      validateFix({ quantity: "6", note: "ok, conferido" }, exit).errors.quantity ?? "",
      /mesma quantidade registrada \(6 un\)/,
    )
  })

  it("justificativa obrigatória, com espaços juntados", () => {
    assert.ok(validateFix({ quantity: "2", note: "  " }, exit).errors.note)
    assert.ok(validateFix({ quantity: "2", note: "x".repeat(501) }, exit).errors.note)
    assert.equal(
      validateFix({ quantity: "2", note: " Bipou   duas vezes " }, exit).input?.note,
      "Bipou duas vezes",
    )
  })

  it("frases do efeito e do vínculo", () => {
    assert.equal(fixEffect(4, "un", "L2291"), "Volta 4 un para o lote L2291.")
    assert.equal(fixEffect(-6, "un", "L2291"), "Sai 6 un do lote L2291.")
    assert.equal(
      correctsLabel({ id: "m1", type: "out", quantity: 6, createdAt: "2026-10-13T17:22:00Z" }, "un"),
      "Corrige a saída de 6 un de 13/10, 14:22",
    )
  })
})
