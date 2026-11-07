"use server"

import {
  adjustMovement,
  getMovementsForExport,
  registerBatchExit,
  registerExit,
  reverseExit,
} from "@/lib/services/movements"
import { getSession } from "@/lib/services/session"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import { parseMovementParams, type MovementSearchParams } from "@/components/movements/movement-params"
import type { ExitInput } from "@/lib/utils/exit-draft"
import { movementsCsv } from "@/lib/utils/movement-csv"
import type { FixInput } from "@/lib/utils/movement-fix"
import type { ExitReason, Movement } from "@/lib/types"

/**
 * Ponte para a tela de cliente chamar o serviço no servidor, onde está o
 * cookie da sessão (`next/headers`). Não persiste nada: só repassa para a API
 * do backend (POST /movements/out/batch, contrato v11). Quem decide permissão
 * e grava é o servidor do Pedro.
 */
export async function discardLots(input: {
  items: { lotId: string; quantity: number }[]
  reason: ExitReason
}): Promise<{ ok: true } | { ok: false }> {
  try {
    await registerBatchExit(input)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

/** POST /movements/out (issue 054): a saída de um lote, pela tela Registrar saída */
export async function exitLot(input: ExitInput): Promise<ActionResult<Movement>> {
  try {
    return { ok: true, data: await registerExit(input) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/** Desfaz a saída na faixa de confirmação (issue 072, item 102): o servidor lança um estorno */
export async function undoExit(movementId: string): Promise<ActionResult<null>> {
  try {
    await reverseExit(movementId)
    return { ok: true, data: null }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/** Corrige uma entrada ou saída com um AJUSTE (issue 073, item 79): POST /movements/:id/adjust */
export async function correctMovement(movementId: string, input: FixInput): Promise<ActionResult<Movement>> {
  try {
    return { ok: true, data: await adjustMovement(movementId, input) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/**
 * A planilha do que a tela filtrou (issue 073, item 77). Recebe o endereço, não
 * o filtro pronto: o servidor lê de novo, como a página, e a planilha nunca
 * diz algo diferente da tela.
 */
export async function exportMovements(
  params: MovementSearchParams,
): Promise<ActionResult<{ csv: string; filename: string }>> {
  try {
    const { type, reason, userId, productId, from, to } = parseMovementParams(params)
    const filters = { type, reason, userId, productId, from, to }
    const [{ data, total }, { company }] = await Promise.all([getMovementsForExport(filters), getSession()])
    const csv = movementsCsv({
      movements: data,
      pharmacy: company.tradeName,
      from: filters.from,
      to: filters.to,
      total,
    })
    return { ok: true, data: { csv, filename: `movimentacoes-${filters.from}-a-${filters.to}.csv` } }
  } catch (cause) {
    return actionFailure(cause)
  }
}
