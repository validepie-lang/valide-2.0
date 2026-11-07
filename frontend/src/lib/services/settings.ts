import { apiPatch, apiPost, apiPut } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { CURRENT_COMPANY, CURRENT_USER } from "@/lib/mocks/session"
import type { CompanyPatch } from "@/lib/utils/settings-draft"
import type { Company, NotificationPreferences, User } from "@/lib/types"

/**
 * O que cada pessoa e a farmácia ajustam em Configurações (issue 059).
 *
 * Sem a área ligada, responde como o servidor, mas não guarda. A senha só
 * passa adiante: o front não a guarda nem a mostra.
 */

/** PATCH /users/me (v21, proposto): o próprio nome, para qualquer cargo */
export async function updateMyName(name: string): Promise<User> {
  if (isLive("auth")) return apiPatch<User>("/users/me", { name })
  return { ...CURRENT_USER, name }
}

/**
 * POST /auth/password (ponto aberto 10): a própria senha, com a atual.
 * Senha atual errada: `422 WRONG_PASSWORD` (v21, proposto). O simulado não
 * tem senha para conferir e aceita.
 */
export async function changeMyPassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  if (isLive("auth")) return apiPost<void>("/auth/password", input)
}

/** PATCH /companies/current: só quem administra (o servidor recusa o resto com 403) */
export async function updateCompany(patch: CompanyPatch): Promise<Company> {
  if (isLive("auth")) return apiPatch<Company>("/companies/current", patch)
  return { ...CURRENT_COMPANY, ...patch, address: { ...CURRENT_COMPANY.address, ...patch.address } }
}

/** PUT /users/me/notification-preferences (v16) */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  if (isLive("notifications")) {
    return apiPut<NotificationPreferences>("/users/me/notification-preferences", preferences)
  }
  return preferences
}
