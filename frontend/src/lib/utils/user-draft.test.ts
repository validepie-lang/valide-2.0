/**
 * Aviso imediato da janela de pessoa (issue 040). O servidor continua sendo
 * quem recusa; aqui se garante que o front não deixa passar o óbvio nem barra
 * o que é válido.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { validateUserDraft, type UserDraft } from "./user-draft.ts"

const valid: UserDraft = { name: "Ana Lima", login: "ana.lima", password: "12345678", role: "clerk" }
const create = { editing: false, takenLogins: ["juliana.ferreira"] }
const edit = { editing: true, takenLogins: ["juliana.ferreira"] }

describe("validateUserDraft", () => {
  it("criação completa passa", () => {
    assert.deepEqual(validateUserDraft(valid, create), {})
  })

  it("criação vazia aponta os três campos", () => {
    const errors = validateUserDraft({ ...valid, name: " ", login: "", password: "" }, create)
    assert.deepEqual(Object.keys(errors).sort(), ["login", "name", "password"])
  })

  it("recusa espaço e acento no usuário", () => {
    assert.ok(validateUserDraft({ ...valid, login: "ana lima" }, create).login)
    assert.ok(validateUserDraft({ ...valid, login: "joão" }, create).login)
  })

  it("recusa usuário que já existe, sem diferença de maiúscula", () => {
    assert.match(validateUserDraft({ ...valid, login: "Juliana.Ferreira" }, create).login ?? "", /já existe/)
  })

  it("senha com menos de 8 caracteres não passa", () => {
    assert.ok(validateUserDraft({ ...valid, password: "1234567" }, create).password)
  })

  it("na edição, senha em branco mantém a atual", () => {
    assert.deepEqual(validateUserDraft({ ...valid, password: "" }, edit), {})
  })

  it("na edição, senha nova curta não passa", () => {
    assert.match(validateUserDraft({ ...valid, password: "123" }, edit).password ?? "", /nova senha/)
  })

  it("na edição, o usuário de acesso não é conferido", () => {
    assert.deepEqual(validateUserDraft({ ...valid, login: "juliana.ferreira" }, edit), {})
  })
})
