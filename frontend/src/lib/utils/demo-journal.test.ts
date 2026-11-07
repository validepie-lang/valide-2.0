/**
 * Registro do modo de demonstração (issue 071).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  applyFolders,
  applyToProducts,
  journalMovements,
  markCorrected,
  journalNotes,
  parseJournal,
  serializeJournal,
  type JournalEntry,
} from "./demo-journal.ts"
import type { Product } from "../types/index.ts"

const today = new Date("2026-10-12T00:00:00Z")
const ctx = {
  today,
  threshold: 30,
  folders: [
    { id: "f1", name: "Medicamentos" },
    { id: "f2", name: "Genéricos" },
  ],
}
const input = {
  name: "Paracetamol 750mg",
  sku: null,
  barcode: null,
  folderId: "f1",
  brand: null,
  supplier: null,
  unit: "un" as const,
  minStock: 5,
  maxStock: null,
  acquisitionCost: 300,
  operationalCost: 0,
  salePrice: 600,
}
const base: Product = {
  id: "p1",
  ...input,
  sku: "MED-1",
  folderName: "Medicamentos",
  totalQuantity: 10,
  nearestExpiry: "2026-12-01T00:00:00.000Z",
  nearestExpiryStatus: "ok",
  lots: [
    {
      id: "l1",
      productId: "p1",
      code: "A1",
      manufacturedAt: null,
      expiresAt: "2026-12-01T00:00:00.000Z",
      quantity: 10,
      status: "ok",
    },
  ],
  source: "file",
  externalId: null,
  active: true,
  photoUrl: null,
}

describe("parse e serialize", () => {
  it("cookie ruim vira vazio", () => {
    assert.deepEqual(parseJournal(undefined), [])
    assert.deepEqual(parseJournal("%%%"), [])
    assert.deepEqual(parseJournal(encodeURIComponent('{"t":"x"}')), [])
    assert.deepEqual(
      parseJournal(
        encodeURIComponent(
          '[{"t":"hack","at":"x"},{"t":"note","at":"x","id":"n","productId":"p1","text":"oi"}]',
        ),
      ).length,
      1,
    )
  })

  it("tira as mais antigas até caber", () => {
    const notes: JournalEntry[] = Array.from({ length: 50 }, (_, i) => ({
      t: "note",
      at: `2026-10-${i}`,
      id: `n${i}`,
      productId: "p1",
      text: "x".repeat(40),
    }))
    const text = serializeJournal(notes, 1000)
    assert.ok(text.length <= 1000)
    const kept = parseJournal(text)
    assert.equal((kept.at(-1) as { id: string }).id, "n49")
    assert.ok(kept.length < 50)
  })
})

describe("applyToProducts", () => {
  it("produto cadastrado entra com a situação calculada", () => {
    const out = applyToProducts(
      [base],
      [
        {
          t: "product",
          at: "a",
          id: "novo",
          input,
          lots: [{ code: "B1", manufacturedAt: null, expiresAt: "2026-10-20T00:00:00.000Z", quantity: 4 }],
        },
      ],
      ctx,
    )
    const novo = out.find((p) => p.id === "novo")!
    assert.equal(novo.totalQuantity, 4)
    assert.equal(novo.nearestExpiryStatus, "soon")
    assert.equal(novo.folderName, "Medicamentos")
  })

  it("lote, saída e pasta mudam o produto; saída que zera tira o lote", () => {
    const journal: JournalEntry[] = [
      {
        t: "lot",
        at: "a",
        id: "l2",
        productId: "p1",
        lot: { code: "A2", manufacturedAt: null, expiresAt: "2026-10-01T00:00:00.000Z", quantity: 3 },
      },
      {
        t: "exit",
        at: "b",
        id: "s1",
        productId: "p1",
        lotId: "l1",
        lotCode: "A1",
        quantity: 10,
        reason: "sale",
      },
      { t: "folder", at: "c", ids: ["p1"], folderId: null },
    ]
    const [p] = applyToProducts([base], journal, ctx)
    assert.deepEqual(
      p.lots.map((l) => l.code),
      ["A2"],
    )
    assert.equal(p.totalQuantity, 3)
    assert.equal(p.nearestExpiryStatus, "expired")
    assert.equal(p.folderName, null)
  })

  it("edição troca o cadastro e mantém os lotes; produto que não existe é ignorado", () => {
    const [p] = applyToProducts(
      [base],
      [
        { t: "edit", at: "a", id: "p1", input: { ...input, name: "Novo nome", folderId: "f2" } },
        { t: "edit", at: "b", id: "zz", input },
      ],
      ctx,
    )
    assert.equal(p.name, "Novo nome")
    assert.equal(p.folderName, "Genéricos")
    assert.equal(p.totalQuantity, 10)
  })
})

describe("movimentações e notas", () => {
  it("entradas e saídas do registro, da mais recente para a mais antiga", () => {
    const journal: JournalEntry[] = [
      {
        t: "lot",
        at: "2026-10-12T10:00:00Z",
        id: "l2",
        productId: "p1",
        lot: { code: "A2", manufacturedAt: null, expiresAt: "2026-12-01", quantity: 3 },
      },
      {
        t: "exit",
        at: "2026-10-12T11:00:00Z",
        id: "s1",
        productId: "p1",
        lotId: "l1",
        lotCode: "A1",
        quantity: 2,
        reason: "sale",
      },
    ]
    const list = journalMovements(journal, [base], { id: "u1", name: "Marcus" })
    assert.deepEqual(
      list.map((m) => `${m.type} ${m.lotCode} ${m.quantity}`),
      ["out A1 2", "in A2 3"],
    )
    assert.equal(list[0].productName, "Paracetamol 750mg")
  })

  it("notas do produto, a mais recente primeiro", () => {
    const journal: JournalEntry[] = [
      { t: "note", at: "a", id: "n1", productId: "p1", text: "primeira" },
      { t: "note", at: "b", id: "n2", productId: "p2", text: "outra" },
      { t: "note", at: "c", id: "n3", productId: "p1", text: "segunda" },
    ]
    assert.deepEqual(
      journalNotes(journal, "p1", "Marcus").map((n) => n.text),
      ["segunda", "primeira"],
    )
  })
})

describe("correção (issue 073)", () => {
  const fix: JournalEntry = {
    t: "fix",
    at: "2026-10-13T12:00:00Z",
    id: "aj1",
    movementId: "m1",
    productId: "p1",
    lotId: "l1",
    lotCode: "A1",
    delta: 4,
    note: "Bipou duas vezes",
    was: { type: "out", quantity: 6, at: "2026-10-13T10:00:00Z" },
  }

  it("o ajuste muda o lote e nunca deixa negativo", () => {
    assert.equal(applyToProducts([base], [fix], ctx)[0].totalQuantity, 14)
    assert.equal(applyToProducts([base], [{ ...fix, delta: -30 }], ctx)[0].totalQuantity, 0)
  })

  it("vira movimentação de ajuste com sinal e o vínculo", () => {
    const [m] = journalMovements([fix], [base], { id: "u1", name: "Marcus" })
    assert.equal(m.type, "adjust")
    assert.equal(m.quantity, 4)
    assert.deepEqual(m.corrects, { id: "m1", type: "out", quantity: 6, createdAt: "2026-10-13T10:00:00Z" })
  })

  it("marca a corrigida e deixa as outras", () => {
    const list = [{ id: "m1" }, { id: "m2" }] as Parameters<typeof markCorrected>[0]
    const marked = markCorrected(list, [fix])
    assert.equal(marked[0].correctedAt, "2026-10-13T12:00:00Z")
    assert.equal(marked[1].correctedAt, undefined)
  })

  it("o cookie aceita a correção", () => {
    assert.equal(parseJournal(serializeJournal([fix])).length, 1)
  })
})

describe("pastas no registro (issue 076)", () => {
  const folders = [
    { id: "f1", name: "Medicamentos", productCount: 0, active: true },
    { id: "f2", name: "Genéricos", productCount: 0, active: true },
  ]
  const at = "2026-10-13T10:00:00.000Z"

  it("cria, renomeia, desativa e exclui", () => {
    const journal: JournalEntry[] = [
      { t: "folderOp", at, id: "n1", op: "create", name: "Sazonais" },
      { t: "folderOp", at, id: "f2", op: "rename", name: "Similares" },
      { t: "folderOp", at, id: "f1", op: "active", active: false },
      { t: "folderOp", at, id: "n1", op: "delete", moveTo: null },
    ]
    assert.deepEqual(applyFolders(folders, journal), [
      { id: "f1", name: "Medicamentos", productCount: 0, active: false },
      { id: "f2", name: "Similares", productCount: 0, active: true },
    ])
  })

  it("excluir leva os produtos para o destino, ou deixa sem pasta", () => {
    const moved = applyToProducts([base], [{ t: "folderOp", at, id: "f1", op: "delete", moveTo: "f2" }], {
      ...ctx,
      folders: [{ id: "f2", name: "Genéricos" }],
    })
    assert.equal(moved[0].folderId, "f2")
    assert.equal(moved[0].folderName, "Genéricos")
    const loose = applyToProducts([base], [{ t: "folderOp", at, id: "f1", op: "delete", moveTo: null }], ctx)
    assert.equal(loose[0].folderId, null)
    assert.equal(loose[0].folderName, null)
  })

  it("o produto mostra o nome novo da pasta", () => {
    const journal: JournalEntry[] = [{ t: "folderOp", at, id: "f1", op: "rename", name: "Remédios" }]
    const [product] = applyToProducts([base], journal, {
      ...ctx,
      folders: applyFolders(folders, journal),
    })
    assert.equal(product.folderName, "Remédios")
  })

  it("desativar não mexe nos produtos", () => {
    const [product] = applyToProducts(
      [base],
      [{ t: "folderOp", at, id: "f1", op: "active", active: false }],
      ctx,
    )
    assert.equal(product, base)
  })
})
