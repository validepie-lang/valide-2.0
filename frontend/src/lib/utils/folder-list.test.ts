/**
 * Lista de pastas (issue 076).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  folderChoices,
  foldersHref,
  joinNames,
  listFolders,
  parseFolderSort,
  splitForDelete,
} from "./folder-list.ts"

const row = (name: string, productCount: number, atRiskCount = 0) => ({ name, productCount, atRiskCount })
const rows = [
  row("Medicamentos", 30, 4),
  row("Genéricos", 12, 6),
  row("Infantil", 0),
  row("Dermocosméticos", 12, 1),
]

describe("listFolders", () => {
  it("busca sem acento nem maiúscula", () => {
    const { data, total } = listFolders(rows, { search: "GENERICOS", sort: "name_asc", page: 1 })
    assert.deepEqual(
      data.map((f) => f.name),
      ["Genéricos"],
    )
    assert.equal(total, 1)
  })

  it("ordena por nome, produtos e risco, com o nome desempatando", () => {
    const names = (sort: Parameters<typeof parseFolderSort>[0]) =>
      listFolders(rows, { sort: parseFolderSort(sort), page: 1 }).data.map((f) => f.name)
    assert.deepEqual(names(undefined), ["Dermocosméticos", "Genéricos", "Infantil", "Medicamentos"])
    assert.deepEqual(names("name_desc"), ["Medicamentos", "Infantil", "Genéricos", "Dermocosméticos"])
    assert.deepEqual(names("products_desc"), ["Medicamentos", "Dermocosméticos", "Genéricos", "Infantil"])
    assert.deepEqual(names("risk_desc"), ["Genéricos", "Medicamentos", "Dermocosméticos", "Infantil"])
    assert.deepEqual(names("qualquer"), names("name_asc"))
  })

  it("pagina e leva a página além da última para a última", () => {
    const many = Array.from({ length: 30 }, (_, i) => row(`Pasta ${String(i + 1).padStart(2, "0")}`, i))
    const second = listFolders(many, { sort: "name_asc", page: 2 })
    assert.equal(second.data.length, 5)
    assert.equal(second.data[0].name, "Pasta 26")
    assert.equal(listFolders(many, { sort: "name_asc", page: 9 }).page, 2)
    assert.equal(listFolders(many, { sort: "name_asc", page: Number.NaN }).page, 1)
    assert.equal(listFolders([], { sort: "name_asc", page: 3 }).page, 1)
  })
})

describe("folderChoices (item 65)", () => {
  const folders = [
    { id: "f1", name: "Medicamentos", productCount: 3, active: true },
    { id: "f5", name: "Infantil", productCount: 2, active: false },
  ]

  it("só as ativas", () => {
    assert.deepEqual(
      folderChoices(folders).map((f) => f.id),
      ["f1"],
    )
  })

  it("a desativada que o produto já tem continua, marcada", () => {
    assert.deepEqual(
      folderChoices(folders, "f5").map((f) => f.name),
      ["Medicamentos", "Infantil (desativada)"],
    )
    assert.equal(folderChoices(folders, "f1").length, 1)
  })
})

describe("excluir várias (item 66)", () => {
  it("separa as vazias das que têm produto", () => {
    const { empty, withProducts } = splitForDelete(rows)
    assert.deepEqual(
      empty.map((f) => f.name),
      ["Infantil"],
    )
    assert.equal(withProducts.length, 3)
  })

  it("junta os nomes em português", () => {
    assert.equal(joinNames([]), "")
    assert.equal(joinNames(["A"]), "A")
    assert.equal(joinNames(["A", "B"]), "A e B")
    assert.equal(joinNames(["A", "B", "C"]), "A, B e C")
  })
})

describe("foldersHref", () => {
  it("busca e ordem voltam à página 1; o padrão não vai no endereço", () => {
    assert.equal(
      foldersHref({ pagina: "2", busca: "a" }, { ordem: "risk_desc" }),
      "/estoque/pastas?busca=a&ordem=risk_desc",
    )
    assert.equal(foldersHref({ ordem: "name_desc" }, { ordem: "name_asc" }), "/estoque/pastas")
    assert.equal(foldersHref({ cargo: "admin" }, { pagina: "3" }), "/estoque/pastas?pagina=3&cargo=admin")
    assert.equal(foldersHref({ pagina: "3" }, { pagina: "1" }), "/estoque/pastas")
  })
})
