import { apiGet, apiPatch } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { mockNotifications } from "@/lib/mocks/notifications"
import type { Notification, NotificationPreferences } from "@/lib/types"

/** GET /notifications */
export async function getNotifications(): Promise<Notification[]> {
  if (isLive("notifications")) {
    const { data } = await apiGet<{ data: Notification[] }>("/notifications")
    return data
  }
  return mockNotifications()
}

/**
 * GET /users/me/notification-preferences (v16, proposto em 10/10). Sem a área
 * ligada, tudo ligado: é o que a pessoa recebe hoje, sem ter escolhido nada.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  if (isLive("notifications")) {
    return apiGet<NotificationPreferences>("/users/me/notification-preferences")
  }
  return { expiringThisWeek: true, minStock: true, teamActivity: true, importDone: true }
}

/**
 * PATCH /notifications/:id/read (issue 060). "Marcar todos" manda um por
 * aviso, que é o que o contrato tem; `POST /notifications/read-all` (v13,
 * sugestão) faria tudo de uma vez. Sem a área ligada, não guarda.
 */
export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (isLive("notifications")) {
    await Promise.all(ids.map((id) => apiPatch(`/notifications/${encodeURIComponent(id)}/read`)))
  }
}
