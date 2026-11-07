/**
 * Leitura da URL do Estoque (issues 068 e 069).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { joinLabels, parsePage, parseSort, parseStatuses, retireHref, stockFilter } from "./stock-params.ts"

describe("stock-params", () => {
  it("estados na ordem fixa, ignorando o desconhecido", () => {
    assert.deepEqual(parseStatuses("soon,xyz,expired"), ["expired", "soon"])
    assert.deepEqual(parseStatuses(undefined), [])
  })

  it("página e ordem com valor ruim voltam ao padrão", () => {
    assert.equal(parsePage("3"), 3)
    assert.equal(parsePage("-1"), 1)
    assert.equal(parseSort("name_asc"), "name_asc")
    assert.equal(parseSort("value_desc"), "expiry_asc")
  })

  it("recorte para a API, com Sem pasta e origem conferida", () => {
    assert.deepEqual(
      stockFilter({ status: "expired", pasta: "sem", origem: "planilha", busca: "dipirona" }),
      {
        status: "expired",
        source: undefined,
        folderId: "none",
        supplier: undefined,
        brand: undefined,
        search: "dipirona",
      },
    )
    assert.deepEqual(stockFilter({ status: "expired,soon" }).status, ["expired", "soon"])
  })

  it("retirar vencidos leva o recorte, menos o estado", () => {
    assert.equal(
      retireHref({ status: "soon", pasta: "f1", busca: "a b" }),
      "/estoque/retirar-vencidos?pasta=f1&busca=a+b",
    )
    assert.equal(retireHref({}), "/estoque/retirar-vencidos")
  })

  it("rótulos juntos com ou", () => {
    assert.equal(joinLabels(["expired", "soon"]), "Vencido ou A vencer")
    assert.equal(joinLabels(["expired", "soon", "ok"]), "Vencido, A vencer ou No prazo")
  })
})
