/**
 * Nome de pasta (issue 057). O servidor continua sendo quem recusa.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { validateFolderName } from "./folder-name.ts"

const others = [{ name: "Dermocosméticos" }, { name: "Genéricos" }]

describe("validateFolderName", () => {
  it("limpa os espaços e passa", () => {
    assert.deepEqual(validateFolderName("  Higiene   bucal ", others), { name: "Higiene bucal", error: null })
  })

  it("vazio não passa", () => {
    assert.equal(validateFolderName("   ", others).error, "Dê um nome à pasta.")
  })

  it("repetido, sem diferenciar maiúscula, diz qual já existe", () => {
    assert.equal(
      validateFolderName("dermocosméticos", others).error,
      "Já existe a pasta Dermocosméticos. Escolha outro nome.",
    )
  })

  it("mais de 60 letras não passa", () => {
    assert.ok(validateFolderName("a".repeat(61), others).error)
  })
})
