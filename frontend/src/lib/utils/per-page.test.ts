/**
 * Linhas por página do estoque (issue 068).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parsePerPage } from "./per-page.ts"

describe("parsePerPage", () => {
  it("aceita as três opções", () => {
    assert.equal(parsePerPage("25"), 25)
    assert.equal(parsePerPage("50"), 50)
    assert.equal(parsePerPage("100"), 100)
  })

  it("qualquer outra coisa volta a 25", () => {
    for (const bad of [undefined, null, "", "10", "1000", "50.5", "abc", "-25"]) {
      assert.equal(parsePerPage(bad), 25)
    }
  })
})
