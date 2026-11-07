/**
 * Nota, foto, estoque útil e alterações do produto (issue 070).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { describeChange, noteError, photoFileError, usableStockWarning } from "./product-extras.ts"

describe("noteError", () => {
  it("recusa vazia e longa", () => {
    assert.equal(noteError("   "), "Escreva a nota antes de salvar.")
    assert.equal(noteError("x".repeat(501)), "A nota passou de 500 letras. Encurte para salvar.")
    assert.equal(noteError(" Caixa amassada. "), null)
  })
})

describe("photoFileError", () => {
  it("tipo e tamanho", () => {
    assert.equal(photoFileError({ type: "image/gif", size: 10 }), "Envie a foto em JPG, PNG ou WebP.")
    assert.equal(
      photoFileError({ type: "image/png", size: 3 * 1024 * 1024 }),
      "A foto passou de 2 MB. Envie uma menor.",
    )
    assert.equal(photoFileError({ type: "image/webp", size: 2 * 1024 * 1024 }), null)
  })
})

describe("usableStockWarning", () => {
  const lot = (code: string, quantity: number, status: string) => ({ code, quantity, status })
  it("avisa quando o vencido derruba para baixo do mínimo", () => {
    assert.equal(
      usableStockWarning({
        minStock: 12,
        totalQuantity: 14,
        unit: "un",
        lots: [lot("TS9126", 6, "expired"), lot("TS9300", 8, "ok")],
      }),
      "Sem o lote vencido TS9126, ficam 8 un: abaixo do mínimo de 12 un.",
    )
  })
  it("vários lotes vencidos", () => {
    assert.equal(
      usableStockWarning({
        minStock: 5,
        totalQuantity: 9,
        unit: "cx",
        lots: [lot("A", 4, "expired"), lot("B", 4, "expired"), lot("C", 1, "soon")],
      }),
      "Sem os lotes vencidos A e B, fica 1 cx: abaixo do mínimo de 5 cx.",
    )
  })
  it("calado sem vencido, com o total já abaixo, ou com sobra", () => {
    assert.equal(
      usableStockWarning({ minStock: 12, totalQuantity: 14, unit: "un", lots: [lot("A", 14, "soon")] }),
      null,
    )
    assert.equal(
      usableStockWarning({
        minStock: 20,
        totalQuantity: 14,
        unit: "un",
        lots: [lot("A", 6, "expired"), lot("B", 8, "ok")],
      }),
      null,
    )
    assert.equal(
      usableStockWarning({
        minStock: 5,
        totalQuantity: 14,
        unit: "un",
        lots: [lot("A", 6, "expired"), lot("B", 8, "ok")],
      }),
      null,
    )
  })
})

describe("describeChange", () => {
  const base = { id: "c", at: "2026-10-10T12:00:00Z", userName: "Camila Duarte", kind: "updated" as const }
  it("dinheiro, mínimo e pasta formatados", () => {
    assert.equal(
      describeChange({ ...base, field: "salePrice", from: 2190, to: 2340 }, "un").what,
      "mudou o preço de venda de R$ 21,90 para R$ 23,40",
    )
    assert.equal(
      describeChange({ ...base, field: "minStock", from: 10, to: 12 }, "un").what,
      "mudou o estoque mínimo de 10 un para 12 un",
    )
    assert.equal(
      describeChange({ ...base, field: "folder", from: null, to: "Medicamentos" }, "un").what,
      "mudou a pasta de Sem pasta para Medicamentos",
    )
  })
  it("preencheu e apagou", () => {
    assert.equal(
      describeChange({ ...base, field: "brand", from: null, to: "EMS" }, "un").what,
      "preencheu a marca: EMS",
    )
    assert.equal(
      describeChange({ ...base, field: "supplier", from: "Servimed", to: null }, "un").what,
      "apagou o fornecedor (era Servimed)",
    )
  })
  it("cadastro pela planilha sem pessoa", () => {
    assert.deepEqual(
      describeChange({ id: "c", at: "x", userName: null, kind: "created", source: "file" }, "un"),
      {
        who: "Importação",
        what: "criou o produto pela planilha",
      },
    )
  })
})
