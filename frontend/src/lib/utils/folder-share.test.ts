/**
 * Parte de cada pasta no risco, para a rosca do Início (issue 067).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { folderShares, folderSharesHeadline } from "./folder-share.ts"

const point = (id: string, n: number) => ({ folderId: id, folderName: `Pasta ${id}`, atRiskCount: n })

describe("folderShares", () => {
  it("ordena da maior para a menor e fecha 100%", () => {
    const s = folderShares([point("a", 1), point("b", 1), point("c", 1)])
    assert.deepEqual(
      s.map((x) => x.percent),
      [34, 33, 33],
    )
    assert.equal(
      s.reduce((sum, x) => sum + x.percent, 0),
      100,
    )
  })

  it("junta o que passa de cinco em Outras pastas, sem link de pasta", () => {
    const s = folderShares([6, 5, 4, 3, 2, 1, 1].map((n, i) => point(String(i), n)))
    assert.equal(s.length, 5)
    assert.deepEqual(s.at(-1), { id: "outras", name: "Outras pastas", count: 4, folderId: null, percent: 18 })
  })

  it("com seis pastas mostra as quatro maiores e Outras", () => {
    const s = folderShares([5, 4, 3, 2, 1, 1].map((n, i) => point(String(i), n)))
    assert.deepEqual(
      s.map((x) => x.name),
      ["Pasta 0", "Pasta 1", "Pasta 2", "Pasta 3", "Outras pastas"],
    )
  })

  it("com cinco pastas mostra as cinco", () => {
    assert.equal(folderShares([5, 4, 3, 2, 1].map((n, i) => point(String(i), n))).at(-1)?.name, "Pasta 4")
  })

  it("pasta zerada não vira fatia, e sem risco não há rosca", () => {
    assert.deepEqual(
      folderShares([point("a", 3), point("b", 0)]).map((x) => x.id),
      ["a"],
    )
    assert.deepEqual(folderShares([point("a", 0)]), [])
  })

  it("título diz a pasta que mais pesa", () => {
    assert.equal(
      folderSharesHeadline(folderShares([point("a", 4), point("b", 8)])),
      "Pasta b tem 8 dos 12 produtos em risco",
    )
    assert.equal(folderSharesHeadline(folderShares([point("a", 1)])), "O produto em risco está em Pasta a")
    assert.equal(
      folderSharesHeadline(folderShares([point("a", 3)])),
      "Os 3 produtos em risco estão em Pasta a",
    )
    assert.equal(folderSharesHeadline([]), "Nenhum produto em risco nas pastas")
  })
})
