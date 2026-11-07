import { test } from "node:test"
import assert from "node:assert/strict"
import { cepDigits, parseViaCep } from "./cep.ts"

test("cepDigits tira ponto, hífen e espaço", () => {
  assert.equal(cepDigits("44.380-000"), "44380000")
  assert.equal(cepDigits(" 44380 000 "), "44380000")
})

test("parseViaCep lê o endereço", () => {
  assert.deepEqual(
    parseViaCep({ cep: "40020-000", logradouro: "Rua Chile", bairro: "Centro", localidade: "Salvador", uf: "BA" }),
    { street: "Rua Chile", district: "Centro", city: "Salvador", state: "BA" },
  )
})

test("parseViaCep devolve null para CEP que não existe", () => {
  assert.equal(parseViaCep({ erro: true }), null)
  assert.equal(parseViaCep({ erro: "true" }), null)
  assert.equal(parseViaCep(null), null)
})

test("parseViaCep aceita cidade de CEP único, sem rua nem bairro", () => {
  assert.deepEqual(parseViaCep({ logradouro: "", bairro: "", localidade: "Cruz das Almas", uf: "BA" }), {
    street: "",
    district: "",
    city: "Cruz das Almas",
    state: "BA",
  })
})
