import { apiDelete, apiGet, apiPost } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { demoProducts, record, unrecord } from "@/lib/services/demo-store"
import { CURRENT_COMPANY } from "@/lib/mocks/session"
import { getExpiryStatus } from "@/lib/utils/expiry"
import type { LotInput } from "@/lib/utils/lot-draft"
import type { CalendarLot, Lot } from "@/lib/types"

/**
 * POST /products/:id/lots (B30; contrato v11: grava também a ENTRADA no
 * histórico e recusa código repetido com 409 LOT_CODE_TAKEN).
 *
 * Sem a área ligada, confere o que o servidor conferiria e responde como ele,
 * com o status calculado, e desde a issue 071 o lote fica no registro da
 * demonstração (cookie). Gravar de verdade é do servidor do Pedro.
 */
export async function createLot(productId: string, input: LotInput): Promise<Lot> {
  if (isLive("products")) {
    return apiPost<Lot>(`/products/${encodeURIComponent(productId)}/lots`, input)
  }
  const product = (await demoProducts()).find((p) => p.id === productId)
  if (!product) {
    throw new ApiError(
      "notFound",
      404,
      "Este produto não está mais no estoque. Volte ao estoque e confira se ele foi excluído.",
      "PRODUCT_NOT_FOUND",
    )
  }
  const taken = product.lots.find((lot) => lot.code.toLowerCase() === input.code.toLowerCase())
  if (taken) {
    throw new ApiError(
      "conflict",
      409,
      `Este produto já tem o lote ${taken.code}. Confira o número impresso na caixa.`,
      "LOT_CODE_TAKEN",
    )
  }
  const id = `lote-simulado-${Date.now()}`
  await record({ t: "lot", at: new Date().toISOString(), id, productId, lot: input })
  return {
    id,
    productId,
    code: input.code,
    manufacturedAt: input.manufacturedAt,
    expiresAt: input.expiresAt,
    quantity: input.quantity,
    status: getExpiryStatus(input.expiresAt, CURRENT_COMPANY.soonThresholdDays),
  }
}

/**
 * DELETE /products/:id/lots/:lotId (issue 072, item 98, contrato v27): desfaz
 * o lote que acabou de entrar pela fila. O servidor só aceita lote sem outra
 * movimentação além da própria ENTRADA (`409 LOT_NOT_REMOVABLE`).
 *
 * Sem a área ligada, tira o lote do registro da demonstração; lote do exemplo
 * original não se desfaz.
 */
export async function deleteLot(productId: string, lotId: string): Promise<void> {
  if (isLive("products")) {
    return apiDelete(`/products/${encodeURIComponent(productId)}/lots/${encodeURIComponent(lotId)}`)
  }
  if (!(await unrecord(lotId))) {
    throw new ApiError(
      "conflict",
      409,
      "Este lote já não pode ser desfeito. Corrija pelo produto, com uma saída de ajuste.",
      "LOT_NOT_REMOVABLE",
    )
  }
}

/**
 * GET /lots?expiresFrom=&expiresTo= (v17, proposto em 10/10, issue 052): os
 * lotes que vencem entre as duas datas, inclusive, do que vence primeiro ao
 * último, com o produto e o status prontos. É o calendário de vencimentos.
 * Sem a área ligada, sai dos lotes do catálogo simulado.
 */
export async function getLotsExpiring({ from, to }: { from: string; to: string }): Promise<CalendarLot[]> {
  if (isLive("products")) {
    const { data } = await apiGet<{ data: CalendarLot[] }>("/lots", { expiresFrom: from, expiresTo: to })
    return data
  }
  return (await demoProducts())
    .filter((p) => p.active)
    .flatMap((p) =>
      p.lots.map((lot) => ({
        lotId: lot.id,
        productId: p.id,
        productName: p.name,
        lotCode: lot.code,
        expiresAt: lot.expiresAt,
        status: lot.status,
        quantity: lot.quantity,
        unit: p.unit,
      })),
    )
    .filter((lot) => {
      const day = lot.expiresAt.slice(0, 10)
      return day >= from && day <= to
    })
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
}
