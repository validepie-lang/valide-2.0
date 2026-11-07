/**
 * O que cada cargo vê (issue 070: quem edita o produto).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { canDiscard, canEditProduct, demoRole } from "./permissions.ts"

describe("permissões", () => {
  it("editar produto: administrador e farmacêutico", () => {
    assert.equal(canEditProduct("admin"), true)
    assert.equal(canEditProduct("pharmacist"), true)
    assert.equal(canEditProduct("clerk"), false)
  })
  it("descarte segue igual", () => {
    assert.equal(canDiscard("clerk"), false)
  })
  it("cargo de demonstração pela URL", () => {
    assert.equal(demoRole("balconista", "admin"), "clerk")
    assert.equal(demoRole("xyz", "admin"), "admin")
  })
})
