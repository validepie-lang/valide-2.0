"use server"

import {
  changeMyPassword,
  updateCompany,
  updateMyName,
  updateNotificationPreferences,
} from "@/lib/services/settings"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import type { CompanyPatch } from "@/lib/utils/settings-draft"
import type { Company, NotificationPreferences, User } from "@/lib/types"

/**
 * Pontes de Configurações para o servidor (issue 059). Não gravam nada: a
 * pessoa vem da sessão no servidor do Pedro, nunca de um id mandado daqui.
 */
export async function saveMyName(name: string): Promise<ActionResult<User>> {
  try {
    return { ok: true, data: await updateMyName(name) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

export async function changePassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<ActionResult<null>> {
  try {
    await changeMyPassword(input)
    return { ok: true, data: null }
  } catch (cause) {
    return actionFailure(cause)
  }
}

export async function saveCompany(patch: CompanyPatch): Promise<ActionResult<Company>> {
  try {
    return { ok: true, data: await updateCompany(patch) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<ActionResult<NotificationPreferences>> {
  try {
    return { ok: true, data: await updateNotificationPreferences(preferences) }
  } catch (cause) {
    return actionFailure(cause)
  }
}
