/**
 * Meu perfil e Empresa (issue 059). O servidor continua sendo quem recusa.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  companyIdentityErrors,
  isValidCnpj,
  normalizeWebsite,
  validateCompany,
  validatePasswordChange,
  type CompanyDraft,
} from "./settings-draft.ts"

describe("validatePasswordChange", () => {
  it("completa e igual nas duas passa", () => {
    assert.deepEqual(
      validatePasswordChange({ current: "antiga123", next: "nova12345", repeat: "nova12345" }),
      {},
    )
  })

  it("sem a atual, curta, igual à atual ou repetida diferente não passam", () => {
    assert.ok(validatePasswordChange({ current: "", next: "nova12345", repeat: "nova12345" }).current)
    assert.ok(validatePasswordChange({ current: "a", next: "curta", repeat: "curta" }).next)
    assert.match(
      validatePasswordChange({ current: "mesma1234", next: "mesma1234", repeat: "mesma1234" }).next ?? "",
      /diferente/,
    )
    assert.equal(
      validatePasswordChange({ current: "a", next: "nova12345", repeat: "nova1234" }).repeat,
      "As duas senhas novas não são iguais.",
    )
  })
})

describe("isValidCnpj", () => {
  it("confere os dígitos verificadores", () => {
    assert.equal(isValidCnpj("18.472.905/0001-20"), true)
    assert.equal(isValidCnpj("18.472.905/0001-64"), false)
    assert.equal(isValidCnpj("11.111.111/1111-11"), false)
    assert.equal(isValidCnpj("123"), false)
  })
})

const company: CompanyDraft = {
  cnpj: "18.472.905/0001-20",
  tradeName: "Farmácia Preço Popular",
  legalName: "Preço Popular Ltda",
  stateRegistration: "",
  cityRegistration: "",
  taxRegime: "Simples Nacional",
  zipCode: "40140-060",
  street: "Rua Barão de Itapoan",
  number: "217",
  district: "Barra",
  city: "Salvador",
  phone: "(71) 3334-8890",
  email: "contato@drogaria.com.br",
  website: "",
  soonThresholdDays: "30",
  timezone: "America/Bahia",
}

describe("validateCompany", () => {
  it("completa passa, com inscrição em branco como null e a janela em número", () => {
    const { errors, input } = validateCompany(company)
    assert.deepEqual(errors, {})
    assert.equal(input?.stateRegistration, null)
    assert.equal(input?.cityRegistration, null)
    assert.equal(input?.website, null)
    assert.equal(input?.soonThresholdDays, 30)
  })

  it("CNPJ, nomes, CEP e e-mail errados apontam o campo", () => {
    const { errors } = validateCompany({
      ...company,
      cnpj: "18.472.905/0001-64",
      tradeName: " ",
      legalName: "",
      zipCode: "4014",
      email: "contato.drogaria",
    })
    assert.deepEqual(Object.keys(errors), ["cnpj", "tradeName", "legalName", "zipCode", "email"])
  })

  it("site sem domínio aponta o campo; com domínio vai completo", () => {
    assert.deepEqual(Object.keys(validateCompany({ ...company, website: "drogaria" }).errors), ["website"])
    assert.equal(
      validateCompany({ ...company, website: "www.drogaria.com.br" }).input?.website,
      "https://www.drogaria.com.br",
    )
  })

  it("aceita a janela de 7 dias", () => {
    assert.equal(validateCompany({ ...company, soonThresholdDays: "7" }).input?.soonThresholdDays, 7)
  })
})

describe("normalizeWebsite", () => {
  it("completa o https e mantém o que já tem", () => {
    assert.equal(normalizeWebsite("drogaria.com.br"), "https://drogaria.com.br")
    assert.equal(normalizeWebsite("http://drogaria.com.br/loja"), "http://drogaria.com.br/loja")
  })
  it("recusa o que não é site", () => {
    assert.equal(normalizeWebsite("preço popular"), null)
    assert.equal(normalizeWebsite("drogaria"), null)
    assert.equal(normalizeWebsite(""), null)
  })
})

describe("companyIdentityErrors (cadastro da empresa)", () => {
  it("vazio aponta os três, na ordem da tela", () => {
    assert.deepEqual(Object.keys(companyIdentityErrors({ cnpj: "", legalName: "", tradeName: "" })), [
      "cnpj",
      "legalName",
      "tradeName",
    ])
  })
  it("CNPJ com dígito errado é recusado; o certo passa", () => {
    assert.match(
      companyIdentityErrors({ cnpj: "18.472.905/0001-64", legalName: "x", tradeName: "y" }).cnpj ?? "",
      /não confere/,
    )
    assert.deepEqual(companyIdentityErrors({ cnpj: "18.472.905/0001-20", legalName: "x", tradeName: "y" }), {})
  })
})
