/**
 * Planilha de movimentações (issue 073, item 77).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { movementsCsv } from "./movement-csv.ts"
import type { Movement } from "../types/index.ts"

const base: Movement = {
  id: "m1",
  productId: "p1",
  productName: "Dipirona Sódica 500mg; 20 comprimidos",
  lotId: "l1",
  lotCode: "L2291",
  type: "out",
  reason: "sale",
  quantity: 6,
  unit: "un",
  userId: "u2",
  userName: "Juliana Ferreira",
  createdAt: "2026-10-13T17:22:00Z",
  note: null,
}

const csv = (movements: Movement[], total = movements.length) =>
  movementsCsv({ movements, pharmacy: "Farmácia Preço Popular", from: "2026-09-14", to: "2026-10-13", total })

describe("movementsCsv", () => {
  it("BOM, cabeçalho com o período e uma linha por movimentação, no fuso da conta", () => {
    const lines = csv([base]).split("\r\n")
    assert.ok(lines[0].startsWith("﻿Movimentações;Farmácia Preço Popular"))
    assert.equal(lines[1], "De;14/09/2026;Até;13/10/2026")
    assert.equal(lines[2], "1 movimentação")
    assert.equal(
      lines[5],
      '13/10/2026;14:22;"Dipirona Sódica 500mg; 20 comprimidos";L2291;Saída, venda;-6;un;Juliana Ferreira;;',
    )
  })

  it("entrada positiva, ajuste com sinal e o que ele corrige, decimal com vírgula", () => {
    const lines = csv([
      {
        ...base,
        id: "a1",
        type: "adjust",
        reason: null,
        quantity: 4,
        note: "Bipou duas vezes",
        corrects: { id: "m1", type: "out", quantity: 6, createdAt: "2026-10-13T17:22:00Z" },
      },
      { ...base, type: "in", reason: null, quantity: 1.5, unit: "kg", correctedAt: "2026-10-13T18:00:00Z" },
    ]).split("\r\n")
    assert.match(
      lines[5],
      /;Ajuste;4;un;Juliana Ferreira;Corrige a saída de 6 un de 13\/10, 14:22: Bipou duas vezes;$/,
    )
    assert.match(lines[6], /;Entrada;1,5;kg;Juliana Ferreira;;13\/10\/2026 15:00$/)
  })

  it("avisa quando a planilha veio cortada", () => {
    assert.equal(csv([base], 7200).split("\r\n")[2], "As 1 mais recentes de 7.200 movimentações")
  })
})
