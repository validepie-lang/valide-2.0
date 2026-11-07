/**
 * Aviso imediato da fila de validades (issue 053). O servidor continua sendo
 * quem recusa; aqui se garante que o front não deixa passar o óbvio nem barra
 * o que é válido.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  validateEntryOrigin,
  validateLot,
  validateQueueLot,
  type LotDraftFields,
  type QueueLotDraft,
} from "./lot-draft.ts"

const valid: QueueLotDraft = { code: " L2291 ", madeAt: "", expiresAt: "2026-11-30", quantity: "12" }

describe("validateQueueLot", () => {
  it("lote completo vira o corpo do POST, com a validade em meia-noite UTC", () => {
    assert.deepEqual(validateQueueLot(valid, { stock: 40 }), {
      errors: {},
      input: { code: "L2291", manufacturedAt: null, expiresAt: "2026-11-30T00:00:00Z", quantity: 12 },
    })
  })

  it("quantidade em branco vale o estoque atual", () => {
    assert.equal(validateQueueLot({ ...valid, quantity: "" }, { stock: 40 }).input?.quantity, 40)
  })

  it("quantidade em branco sem estoque pede a quantidade", () => {
    const { errors, input } = validateQueueLot({ ...valid, quantity: "" }, { stock: 0 })
    assert.equal(input, null)
    assert.equal(errors.quantity, "Informe a quantidade deste lote.")
  })

  it("aceita quantidade com vírgula (2,5 kg)", () => {
    assert.equal(validateQueueLot({ ...valid, quantity: "2,5" }, { stock: 0 }).input?.quantity, 2.5)
  })

  it("zero e negativo não passam", () => {
    for (const quantity of ["0", "-3", "abc"]) {
      assert.ok(validateQueueLot({ ...valid, quantity }, { stock: 40 }).errors.quantity, quantity)
    }
  })

  it("lote em branco ou só com espaço não passa", () => {
    assert.ok(validateQueueLot({ ...valid, code: "   " }, { stock: 40 }).errors.code)
  })

  it("data vazia, incompleta ou que não existe não passa", () => {
    for (const expiresAt of ["", "2026-11", "2026-02-30", "202611-30", "12026-11-30"]) {
      assert.ok(validateQueueLot({ ...valid, expiresAt }, { stock: 40 }).errors.expiresAt, expiresAt)
    }
  })

  it("lote já vencido passa: a prévia avisa, não impede", () => {
    assert.ok(validateQueueLot({ ...valid, expiresAt: "2020-01-31" }, { stock: 40 }).input)
  })

  it("aponta todos os campos errados de uma vez", () => {
    const { errors } = validateQueueLot({ code: "", madeAt: "", expiresAt: "", quantity: "0" }, { stock: 40 })
    assert.deepEqual(Object.keys(errors), ["code", "expiresAt", "quantity"])
  })
})

const entry: LotDraftFields = { code: "L5", madeAt: "", expiresAt: "2027-01-31", quantity: "24" }

describe("validateLot", () => {
  it("entrada completa, sem fabricação", () => {
    assert.deepEqual(validateLot(entry), {
      errors: {},
      input: { code: "L5", manufacturedAt: null, expiresAt: "2027-01-31T00:00:00Z", quantity: 24 },
    })
  })

  it("fabricação vai em meia-noite UTC", () => {
    assert.equal(
      validateLot({ ...entry, madeAt: "2025-01-31" }).input?.manufacturedAt,
      "2025-01-31T00:00:00Z",
    )
  })

  it("código repetido no produto, sem diferenciar maiúscula", () => {
    assert.equal(
      validateLot({ ...entry, code: "l2291" }, { takenCodes: ["L2291"] }).errors.code,
      "Este produto já tem o lote L2291. Confira o número impresso na caixa.",
    )
  })

  it("validade antes da fabricação não passa", () => {
    assert.ok(validateLot({ ...entry, madeAt: "2027-02-01" }).errors.expiresAt)
  })

  it("fabricação incompleta não passa; em branco passa", () => {
    assert.ok(validateLot({ ...entry, madeAt: "2025-02-30" }).errors.madeAt)
    assert.equal(validateLot({ ...entry, madeAt: "" }).errors.madeAt, undefined)
  })

  it("na entrada a quantidade é obrigatória", () => {
    assert.equal(validateLot({ ...entry, quantity: "" }).errors.quantity, "Informe quanto chegou deste lote.")
  })
})

describe("fila com fabricação (issue 072)", () => {
  it("fabricação opcional vai junto e não pode passar da validade", () => {
    assert.equal(
      validateQueueLot({ ...valid, madeAt: "2025-11-30" }, { stock: 40 }).input?.manufacturedAt,
      "2025-11-30T00:00:00Z",
    )
    assert.ok(validateQueueLot({ ...valid, madeAt: "2027-01-01" }, { stock: 40 }).errors.expiresAt)
    assert.ok(validateQueueLot({ ...valid, madeAt: "2025-02-30" }, { stock: 40 }).errors.madeAt)
  })
})

describe("validateEntryOrigin", () => {
  it("opcionais; em branco vão como null", () => {
    assert.deepEqual(validateEntryOrigin({ supplier: "  ", invoice: "" }), {
      errors: {},
      value: { supplier: null, invoiceNumber: null },
    })
  })
  it("nota como impressa e fornecedor limpo", () => {
    assert.deepEqual(
      validateEntryOrigin({ supplier: " Distribuidora   Panarello ", invoice: "000.418.233" }).value,
      {
        supplier: "Distribuidora Panarello",
        invoiceNumber: "000.418.233",
      },
    )
    assert.ok(validateEntryOrigin({ supplier: "", invoice: "NF 12" }).errors.invoice)
  })
})
