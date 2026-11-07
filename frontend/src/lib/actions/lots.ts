"use server"

import { createLot, deleteLot } from "@/lib/services/lots"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import type { LotInput } from "@/lib/utils/lot-draft"
import type { Lot } from "@/lib/types"

/**
 * Ponte para a tela de cliente chamar o serviço no servidor, onde está o
 * cookie da sessão. Não persiste nada: repassa para POST /products/:id/lots
 * (contrato v11), e quem grava, confere o código repetido e lança a ENTRADA no
 * histórico é o servidor do Pedro.
 */
export async function addLot(productId: string, input: LotInput): Promise<ActionResult<Lot>> {
  try {
    return { ok: true, data: await createLot(productId, input) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/** Desfaz o lote que acabou de entrar pela fila (issue 072, item 98) */
export async function removeLot(productId: string, lotId: string): Promise<ActionResult<null>> {
  try {
    await deleteLot(productId, lotId)
    return { ok: true, data: null }
  } catch (cause) {
    return actionFailure(cause)
  }
}
