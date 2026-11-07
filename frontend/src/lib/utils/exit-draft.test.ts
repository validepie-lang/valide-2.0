/**
 * Aviso imediato da saída (issue 054). O servidor continua sendo quem recusa.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { validateExit, type ExitDraft } from "./exit-draft.ts"

const valid: ExitDraft = { lotId: "l1", quantity: "3", reason: "sale", note: "  " }
const lot = { available: 10, availableLabel: "10 un" }

describe("validateExit", () => {
  it("saída completa vira o corpo do POST, sem justificativa vazia", () => {
    assert.deepEqual(validateExit(valid, lot), {
      errors: {},
      input: { lotId: "l1", quantity: 3, reason: "sale" },
    })
  })

  it("leva a justificativa sem espaços nas pontas", () => {
    assert.equal(validateExit({ ...valid, note: " caixa amassada " }, lot).input?.note, "caixa amassada")
  })

  it("tirar tudo o que o lote tem passa", () => {
    assert.ok(validateExit({ ...valid, quantity: "10" }, lot).input)
  })

  it("mais do que o lote tem diz quanto ele tem", () => {
    assert.equal(
      validateExit({ ...valid, quantity: "11" }, lot).errors.quantity,
      "Este lote tem 10 un. Escolha uma quantidade menor ou troque de lote.",
    )
  })

  it("vazio, zero e negativo não passam", () => {
    for (const quantity of ["", "0", "-1"])
      assert.ok(validateExit({ ...valid, quantity }, lot).errors.quantity)
  })

  it("sem motivo não passa", () => {
    assert.equal(validateExit({ ...valid, reason: "" }, lot).errors.reason, "Escolha o motivo da saída.")
  })
})
