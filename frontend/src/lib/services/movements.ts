import { apiGet, apiPost } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { demoMovements, demoProducts, record, unrecord } from "@/lib/services/demo-store"
import { CURRENT_USER } from "@/lib/mocks/session"
import { eventDayKey, formatQuantity } from "@/lib/utils/format"
import type { ExitInput } from "@/lib/utils/exit-draft"
import { fixDelta, shortEventTime, validateFix, type FixInput } from "@/lib/utils/movement-fix"
import { canAdjustStock } from "@/lib/utils/permissions"
import type {
  ExitReason,
  Lot,
  Movement,
  MovementCounts,
  MovementFilters,
  Paginated,
  PaginationMeta,
  Product,
} from "@/lib/types"

/** A página e, quando o servidor manda, quantas há de cada tipo (contrato v28) */
export type MovementPage = Paginated<Movement> & { counts: MovementCounts | null }

/**
 * GET /movements. É o B31. Desde a issue 041 (contrato v15) filtra por tipo,
 * motivo, pessoa e primeiro dia; do mais recente para o mais antigo. Desde a
 * 073 (v28), também pelo último dia (`to`), aceita `type=adjust` e devolve em
 * `meta.countsByType` quantas há de cada tipo sem contar o tipo nem o motivo.
 */
export async function getMovements(filters: MovementFilters = {}): Promise<MovementPage> {
  const { page = 1, perPage = 20, productId, type, reason, userId, from, to } = filters

  if (isLive("movements")) {
    const { data, meta } = await apiGet<{
      data: Movement[]
      meta: PaginationMeta & { countsByType?: MovementCounts }
    }>("/movements", { page, perPage, productId, type, reason, userId, from, to })
    const { countsByType, ...rest } = meta
    return { data, meta: rest, counts: countsByType ?? null }
  }

  const scoped = (await demoMovements()).filter(
    (m) =>
      (!productId || m.productId === productId) &&
      (!userId || m.userId === userId) &&
      (!from || eventDayKey(m.createdAt) >= from) &&
      (!to || eventDayKey(m.createdAt) <= to),
  )
  const counts: MovementCounts = { in: 0, out: 0, adjust: 0 }
  for (const m of scoped) counts[m.type] += 1
  const list = scoped.filter((m) => (!type || m.type === type) && (!reason || m.reason === reason))
  const start = (page - 1) * perPage
  return {
    data: list.slice(start, start + perPage),
    meta: { page, perPage, total: list.length },
    counts,
  }
}

/** Teto da planilha: acima disso, as mais recentes (issue 073, item 77) */
export const EXPORT_LIMIT = 5000

/**
 * Tudo o que o filtro acha, para a planilha: o mesmo GET /movements, de 100
 * em 100, até o teto. Não precisa de endpoint novo.
 */
export async function getMovementsForExport(
  filters: Omit<MovementFilters, "page" | "perPage">,
): Promise<{ data: Movement[]; total: number }> {
  const all: Movement[] = []
  let total = 0
  for (let page = 1; all.length < EXPORT_LIMIT; page++) {
    const result = await getMovements({ ...filters, page, perPage: 100 })
    total = result.meta.total
    all.push(...result.data)
    if (result.data.length < 100 || all.length >= total) break
  }
  return { data: all.slice(0, EXPORT_LIMIT), total }
}

/**
 * POST /movements/out/batch (contrato v11): várias saídas numa transação só,
 * tudo ou nada. É o que Retirar vencidos usa. Sem a área ligada, confere os
 * lotes e as quantidades e, desde a issue 071, guarda as saídas no registro da
 * demonstração (cookie).
 */
export async function registerBatchExit(input: {
  items: { lotId: string; quantity: number }[]
  reason: ExitReason
  note?: string
}): Promise<{ data: Movement[] }> {
  if (isLive("movements")) {
    return apiPost<{ data: Movement[] }>("/movements/out/batch", input)
  }
  // Tudo ou nada: confere todos antes de guardar qualquer um
  const products = await demoProducts()
  const found = input.items.map((item) => {
    const product = products.find((p) => p.lots.some((lot) => lot.id === item.lotId))
    const lot = product?.lots.find((l) => l.id === item.lotId)
    if (!product || !lot || item.quantity > lot.quantity) {
      throw new ApiError(
        "conflict",
        409,
        "Algum lote marcado mudou desde que a lista abriu. Recarregue a página e confira de novo.",
        "LOT_CHANGED",
      )
    }
    return { item, product, lot }
  })
  const data: Movement[] = []
  for (const [i, { item, product, lot }] of found.entries()) {
    const movement = exitMovement(
      `saida-simulada-${Date.now()}-${i}`,
      product,
      lot,
      item.quantity,
      input.reason,
      input.note,
    )
    await record({
      t: "exit",
      at: movement.createdAt,
      id: movement.id,
      productId: product.id,
      lotId: lot.id,
      lotCode: lot.code,
      quantity: item.quantity,
      reason: input.reason,
      note: input.note,
    })
    data.push(movement)
  }
  return { data }
}

/**
 * POST /movements/out (B31): a saída de um lote, com usuário, data e hora
 * tirados do token. Sem a área ligada, confere o que o servidor conferiria
 * (lote existe, quantidade cabe) e responde como ele; desde a issue 071 a
 * saída fica no registro da demonstração (cookie).
 * Descarte do Balconista (403) só o servidor de verdade recusa: o simulado não
 * tem token para saber o cargo.
 */
export async function registerExit(input: ExitInput): Promise<Movement> {
  if (isLive("movements")) {
    return apiPost<Movement>("/movements/out", input)
  }
  const product = (await demoProducts()).find((p) => p.lots.some((lot) => lot.id === input.lotId))
  const lot = product?.lots.find((l) => l.id === input.lotId)
  if (!product || !lot) {
    throw new ApiError(
      "notFound",
      404,
      "Este lote não está mais no estoque. Volte ao produto e confira os lotes.",
      "LOT_NOT_FOUND",
    )
  }
  if (input.quantity > lot.quantity) {
    throw new ApiError(
      "invalid",
      422,
      `O lote ${lot.code} tem ${formatQuantity(lot.quantity, product.unit)}. Confira a quantidade.`,
      "LOT_QUANTITY_EXCEEDED",
    )
  }
  const movement = exitMovement(
    `saida-simulada-${Date.now()}`,
    product,
    lot,
    input.quantity,
    input.reason,
    input.note,
  )
  await record({
    t: "exit",
    at: movement.createdAt,
    id: movement.id,
    productId: product.id,
    lotId: lot.id,
    lotCode: lot.code,
    quantity: input.quantity,
    reason: input.reason,
    note: input.note,
  })
  return movement
}

/**
 * POST /movements/:id/reverse (issue 072, item 102, contrato v27): desfaz a
 * saída logo depois de registrar. O servidor não apaga: lança um estorno, e o
 * histórico continua imutável. Só a saída da própria pessoa, nos primeiros
 * minutos (`409 MOVEMENT_NOT_REVERSIBLE` depois disso).
 *
 * Sem a área ligada, tira a saída do registro da demonstração.
 */
export async function reverseExit(movementId: string): Promise<void> {
  if (isLive("movements")) {
    await apiPost(`/movements/${encodeURIComponent(movementId)}/reverse`)
    return
  }
  if (!(await unrecord(movementId))) {
    throw new ApiError(
      "conflict",
      409,
      "Esta saída já não pode ser desfeita. Corrija com uma movimentação de ajuste.",
      "MOVEMENT_NOT_REVERSIBLE",
    )
  }
}

/** A saída como o servidor devolveria, com quem fez e quando */
function exitMovement(
  id: string,
  product: Product,
  lot: Lot,
  quantity: number,
  reason: ExitReason,
  note: string | undefined,
): Movement {
  return {
    id,
    productId: product.id,
    productName: product.name,
    lotId: lot.id,
    lotCode: lot.code,
    type: "out",
    reason,
    quantity,
    unit: product.unit,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
    createdAt: new Date().toISOString(),
    note: note ?? null,
  }
}

/**
 * POST /movements/:id/adjust (issue 073, item 79, contrato v28): corrige uma
 * entrada ou saída gravando um AJUSTE com a diferença. O histórico não muda;
 * a original passa a vir com `correctedAt`. Sem a área ligada, confere como o
 * servidor e guarda o ajuste no registro da demonstração.
 */
export async function adjustMovement(movementId: string, input: FixInput): Promise<Movement> {
  if (isLive("movements")) {
    return apiPost<Movement>(`/movements/${encodeURIComponent(movementId)}/adjust`, input)
  }
  if (!canAdjustStock(CURRENT_USER.role)) {
    throw new ApiError("forbidden", 403, "Só Farmacêutico ou Administrador corrige movimentação.", "FORBIDDEN")
  }
  const original = (await demoMovements()).find((m) => m.id === movementId)
  if (!original) {
    throw new ApiError("notFound", 404, "Esta movimentação não foi encontrada.", "MOVEMENT_NOT_FOUND")
  }
  if (original.type === "adjust") {
    throw new ApiError(
      "conflict",
      409,
      "Um ajuste não se corrige. Se ele ficou errado, fale com quem administra a conta.",
      "MOVEMENT_NOT_CORRECTABLE",
    )
  }
  if (original.correctedAt) {
    throw new ApiError(
      "conflict",
      409,
      `Esta movimentação já foi corrigida em ${shortEventTime(original.correctedAt)}.`,
      "MOVEMENT_ALREADY_CORRECTED",
    )
  }
  const { errors, input: valid } = validateFix(
    { quantity: String(input.quantity), note: input.note },
    original,
  )
  if (!valid) {
    throw new ApiError("invalid", 422, Object.values(errors)[0] ?? "Confira a correção.", "VALIDATION_ERROR")
  }

  const delta = fixDelta(original, valid.quantity)
  const product = (await demoProducts()).find((p) => p.id === original.productId)
  const lot = product?.lots.find((l) => l.id === original.lotId)
  if (!product || !lot) {
    throw new ApiError(
      "conflict",
      409,
      `O lote ${original.lotCode} já não está no estoque. Registre uma entrada com o que voltou.`,
      "LOT_NOT_FOUND",
    )
  }
  if (lot.quantity + delta < 0) {
    throw new ApiError(
      "invalid",
      422,
      `O lote ${lot.code} tem ${formatQuantity(lot.quantity, product.unit)}; a correção tiraria ${formatQuantity(-delta, product.unit)}.`,
      "LOT_QUANTITY_EXCEEDED",
    )
  }

  const id = `ajuste-simulado-${Date.now()}`
  const at = new Date().toISOString()
  const was = { type: original.type, quantity: original.quantity, at: original.createdAt }
  await record({
    t: "fix",
    at,
    id,
    movementId,
    productId: product.id,
    lotId: lot.id,
    lotCode: lot.code,
    delta,
    note: valid.note,
    was,
  })
  return {
    id,
    productId: product.id,
    productName: product.name,
    lotId: lot.id,
    lotCode: lot.code,
    type: "adjust",
    reason: null,
    quantity: delta,
    unit: product.unit,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
    createdAt: at,
    note: valid.note,
    corrects: { id: movementId, type: was.type, quantity: was.quantity, createdAt: was.at },
  }
}
