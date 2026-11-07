import { apiGet } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { CURRENT_COMPANY, CURRENT_USER, TEAM } from "@/lib/mocks/session"
import type { Company, User } from "@/lib/types"

/**
 * GET /auth/me
 *
 * Enquanto `auth` não estiver ligada, devolve uma sessão de demonstração. Não há
 * token, não há verificação e isso não protege nada. A autenticação real é do
 * Pedro, B24. Ver CLAUDE.md seção 3.
 */
export async function getSession(): Promise<{ user: User; company: Company }> {
  if (isLive("auth")) {
    return apiGet<{ user: User; company: Company }>("/auth/me")
  }
  return { user: CURRENT_USER, company: CURRENT_COMPANY }
}

/** GET /users */
export async function getUsers(): Promise<User[]> {
  if (isLive("auth")) {
    const { data } = await apiGet<{ data: User[] }>("/users")
    return data
  }
  return TEAM
}
