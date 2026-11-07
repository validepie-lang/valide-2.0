/**
 * O registro do modo de demonstração (issue 071, item 99). Sem a API ligada,
 * o que a pessoa grava vira uma entrada aqui, guardada num cookie do
 * navegador; a camada de serviço aplica o registro ao catálogo de exemplo
 * antes de montar cada tela. Funções puras, para ter teste: quem lê e escreve
 * o cookie é `services/demo-store.ts`.
 */

import { getExpiryStatus } from "./expiry.ts"
import type { LotInput } from "./lot-draft.ts"
import type { ProductInput } from "./product-draft.ts"
import type { ExitReason, Folder, Lot, Movement, Product, ProductNote } from "../types/index.ts"

export const JOURNAL_COOKIE = "valide_demo"
/** Um cookie cabe uns 4 KB; a folga é do nome e dos atributos */
export const MAX_JOURNAL_BYTES = 3500

export type JournalEntry =
  | { t: "product"; at: string; id: string; input: ProductInput; lots: LotInput[] }
  | { t: "edit"; at: string; id: string; input: ProductInput }
  | { t: "lot"; at: string; id: string; productId: string; lot: LotInput }
  | {
      t: "exit"
      at: string
      id: string
      productId: string
      lotId: string
      lotCode: string
      quantity: number
      reason: ExitReason
      note?: string
    }
  | { t: "folder"; at: string; ids: string[]; folderId: string | null }
  | { t: "note"; at: string; id: string; productId: string; text: string }
  /** correção de uma entrada ou saída: o AJUSTE com a diferença (issue 073) */
  | {
      t: "fix"
      at: string
      id: string
      movementId: string
      productId: string
      lotId: string
      lotCode: string
      delta: number
      note: string
      was: { type: "in" | "out"; quantity: number; at: string }
    }
  /**
   * A própria pasta (issue 076): criar, renomear, ativar ou desativar, excluir.
   * Excluir leva os produtos para `moveTo` (outra pasta, ou null = sem pasta)
   */
  | { t: "folderOp"; at: string; id: string; op: "create" | "rename"; name: string }
  | { t: "folderOp"; at: string; id: string; op: "active"; active: boolean }
  | { t: "folderOp"; at: string; id: string; op: "delete"; moveTo: string | null }

const KINDS = new Set(["product", "edit", "lot", "exit", "folder", "note", "fix", "folderOp"])

/** Cookie ausente, adulterado ou de outra versão vira registro vazio, nunca erro */
export function parseJournal(raw: string | undefined | null): JournalEntry[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(decodeURIComponent(raw))
    if (!Array.isArray(data)) return []
    return data.filter(
      (e): e is JournalEntry =>
        typeof e === "object" &&
        e !== null &&
        KINDS.has((e as { t?: string }).t ?? "") &&
        typeof e.at === "string",
    )
  } catch {
    return []
  }
}

/** Para o cookie: tira as entradas mais antigas até caber */
export function serializeJournal(journal: JournalEntry[], max: number = MAX_JOURNAL_BYTES): string {
  let list = journal
  let text = encodeURIComponent(JSON.stringify(list))
  while (text.length > max && list.length > 0) {
    list = list.slice(1)
    text = encodeURIComponent(JSON.stringify(list))
  }
  return text
}

/** As pastas de exemplo com o registro aplicado, sem as contagens (quem conta é quem lista os produtos) */
export function applyFolders(folders: Folder[], journal: JournalEntry[]): Folder[] {
  let list = [...folders]
  for (const entry of journal) {
    if (entry.t !== "folderOp") continue
    if (entry.op === "create") {
      if (!list.some((f) => f.id === entry.id)) {
        list.push({ id: entry.id, name: entry.name, productCount: 0, active: true })
      }
    } else if (entry.op === "rename") {
      list = list.map((f) => (f.id === entry.id ? { ...f, name: entry.name } : f))
    } else if (entry.op === "active") {
      list = list.map((f) => (f.id === entry.id ? { ...f, active: entry.active } : f))
    } else {
      list = list.filter((f) => f.id !== entry.id)
    }
  }
  return list
}

/** `folders`: as pastas já com o registro aplicado (`applyFolders`) */
type Context = { today: Date; threshold: number; folders: { id: string; name: string }[] }

function lotFrom(id: string, productId: string, input: LotInput, ctx: Context): Lot {
  return {
    id,
    productId,
    code: input.code,
    manufacturedAt: input.manufacturedAt,
    expiresAt: input.expiresAt,
    quantity: input.quantity,
    status: getExpiryStatus(input.expiresAt, ctx.threshold, ctx.today),
  }
}

/** Quantidade, validade mais próxima e situação saem dos lotes, como no servidor */
function settle(product: Product): Product {
  const lots = product.lots.filter((lot) => lot.quantity > 0)
  const sorted = [...lots].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
  return {
    ...product,
    lots,
    totalQuantity: lots.reduce((sum, lot) => sum + lot.quantity, 0),
    nearestExpiry: sorted[0]?.expiresAt ?? null,
    nearestExpiryStatus: sorted[0]?.status ?? "unknown",
  }
}

function folderName(folderId: string | null, ctx: Context): string | null {
  return ctx.folders.find((f) => f.id === folderId)?.name ?? null
}

/** O catálogo de exemplo com o registro aplicado, na ordem em que as ações aconteceram */
export function applyToProducts(products: Product[], journal: JournalEntry[], ctx: Context): Product[] {
  const map = new Map(products.map((p) => [p.id, p]))
  const touched = new Set<string>()
  const change = (id: string, fn: (p: Product) => Product) => {
    const current = map.get(id)
    if (!current) return
    map.set(id, fn(current))
    touched.add(id)
  }

  for (const entry of journal) {
    if (entry.t === "product") {
      map.set(entry.id, {
        id: entry.id,
        ...entry.input,
        sku: entry.input.sku ?? "",
        folderName: folderName(entry.input.folderId, ctx),
        lots: entry.lots.map((lot, i) => lotFrom(`${entry.id}-l${i + 1}`, entry.id, lot, ctx)),
        totalQuantity: 0,
        nearestExpiry: null,
        nearestExpiryStatus: "unknown",
        source: "manual",
        externalId: null,
        active: true,
        photoUrl: null,
      })
      touched.add(entry.id)
    } else if (entry.t === "edit") {
      change(entry.id, (p) => ({
        ...p,
        ...entry.input,
        sku: entry.input.sku ?? "",
        folderName: folderName(entry.input.folderId, ctx),
      }))
    } else if (entry.t === "lot") {
      change(entry.productId, (p) => ({ ...p, lots: [...p.lots, lotFrom(entry.id, p.id, entry.lot, ctx)] }))
    } else if (entry.t === "exit") {
      change(entry.productId, (p) => ({
        ...p,
        lots: p.lots.map((lot) =>
          lot.id === entry.lotId ? { ...lot, quantity: Math.max(0, lot.quantity - entry.quantity) } : lot,
        ),
      }))
    } else if (entry.t === "fix") {
      change(entry.productId, (p) => ({
        ...p,
        lots: p.lots.map((lot) =>
          lot.id === entry.lotId ? { ...lot, quantity: Math.max(0, lot.quantity + entry.delta) } : lot,
        ),
      }))
    } else if (entry.t === "folder") {
      for (const id of entry.ids) {
        change(id, (p) => ({ ...p, folderId: entry.folderId, folderName: folderName(entry.folderId, ctx) }))
      }
    } else if (entry.t === "folderOp" && entry.op === "delete") {
      for (const p of map.values()) {
        if (p.folderId === entry.id) {
          change(p.id, (q) => ({ ...q, folderId: entry.moveTo, folderName: folderName(entry.moveTo, ctx) }))
        }
      }
    }
  }
  // Pasta renomeada: o nome que o produto mostra é o de agora
  const renamed = journal.some((e) => e.t === "folderOp" && e.op === "rename")
  return [...map.values()].map((p) => {
    const settled = touched.has(p.id) ? settle(p) : p
    return renamed && settled.folderId
      ? { ...settled, folderName: folderName(settled.folderId, ctx) }
      : settled
  })
}

type Who = { id: string; name: string }

/** "Distribuidora Panarello · NF 000.418.233" na observação da entrada (issue 072, item 22) */
export function entryOriginNote(lot: {
  supplier?: string | null
  invoiceNumber?: string | null
}): string | null {
  const parts = [lot.supplier, lot.invoiceNumber ? `NF ${lot.invoiceNumber}` : null].filter(Boolean)
  return parts.length ? parts.join(" · ") : null
}

/** Entradas (lote informado ou cadastrado com o produto) e saídas, da mais recente para a mais antiga */
export function journalMovements(journal: JournalEntry[], products: Product[], user: Who): Movement[] {
  const byId = new Map(products.map((p) => [p.id, p]))
  const out: Movement[] = []
  const base = (productId: string) => {
    const p = byId.get(productId)
    return {
      productId,
      productName: p?.name ?? "Produto",
      unit: p?.unit ?? "un",
      userId: user.id,
      userName: user.name,
    }
  }
  for (const entry of journal) {
    if (entry.t === "product") {
      entry.lots.forEach((lot, i) =>
        out.push({
          ...base(entry.id),
          id: `${entry.id}-m${i + 1}`,
          lotId: `${entry.id}-l${i + 1}`,
          lotCode: lot.code,
          type: "in",
          reason: null,
          quantity: lot.quantity,
          createdAt: entry.at,
          note: null,
        }),
      )
    } else if (entry.t === "lot") {
      out.push({
        ...base(entry.productId),
        id: `${entry.id}-m`,
        lotId: entry.id,
        lotCode: entry.lot.code,
        type: "in",
        reason: null,
        quantity: entry.lot.quantity,
        createdAt: entry.at,
        note: entryOriginNote(entry.lot),
      })
    } else if (entry.t === "exit") {
      out.push({
        ...base(entry.productId),
        id: entry.id,
        lotId: entry.lotId,
        lotCode: entry.lotCode,
        type: "out",
        reason: entry.reason,
        quantity: entry.quantity,
        createdAt: entry.at,
        note: entry.note ?? null,
      })
    } else if (entry.t === "fix") {
      out.push({
        ...base(entry.productId),
        id: entry.id,
        lotId: entry.lotId,
        lotCode: entry.lotCode,
        type: "adjust",
        reason: null,
        quantity: entry.delta,
        createdAt: entry.at,
        note: entry.note,
        corrects: {
          id: entry.movementId,
          type: entry.was.type,
          quantity: entry.was.quantity,
          createdAt: entry.was.at,
        },
      })
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** A entrada ou saída que um ajuste do registro corrigiu fica marcada, como o servidor faria */
export function markCorrected(movements: Movement[], journal: JournalEntry[]): Movement[] {
  const fixes = new Map(journal.flatMap((e) => (e.t === "fix" ? [[e.movementId, e.at] as const] : [])))
  if (fixes.size === 0) return movements
  return movements.map((m) => (fixes.has(m.id) ? { ...m, correctedAt: fixes.get(m.id) } : m))
}

export function journalNotes(journal: JournalEntry[], productId: string, userName: string): ProductNote[] {
  return journal
    .filter((e): e is Extract<JournalEntry, { t: "note" }> => e.t === "note" && e.productId === productId)
    .map((e) => ({ id: e.id, text: e.text, userName, createdAt: e.at }))
    .reverse()
}
