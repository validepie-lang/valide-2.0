"use server"

import { markNotificationsRead } from "@/lib/services/notifications"
import { actionFailure, type ActionResult } from "@/lib/actions/result"

/** Ponte do sino e da página Avisos para o servidor (issue 060). Não guarda nada */
export async function markRead(ids: string[]): Promise<ActionResult<null>> {
  try {
    await markNotificationsRead(ids)
    return { ok: true, data: null }
  } catch (cause) {
    return actionFailure(cause)
  }
}
