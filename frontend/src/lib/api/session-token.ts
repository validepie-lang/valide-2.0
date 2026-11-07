import { cookies } from "next/headers"

/**
 * Sessão em cookie httpOnly, gravado pelo backend.
 *
 * **Decidido em 16/09/2026.** O token nunca passa pelo JavaScript do navegador.
 * O backend grava o cookie no login, o navegador manda sozinho, e não existe
 * token em `localStorage`, em estado do React nem em variável nenhuma do
 * cliente. Não há o que vazar por XSS.
 *
 * Como toda busca de dado do Valide acontece em Server Component, aqui a gente
 * lê o cookie da requisição que chegou e repassa para a API. `httpOnly` bloqueia
 * o JavaScript do navegador, não o servidor.
 *
 * Ver docs/07-decisions/security-decisions.md, 16/09/2026.
 */
export const SESSION_COOKIE = "valide_session"

/** O cookie de sessão, já no formato do header `Cookie`. */
export async function getSessionCookieHeader(): Promise<string | null> {
  try {
    const store = await cookies()
    const value = store.get(SESSION_COOKIE)?.value
    return value ? `${SESSION_COOKIE}=${value}` : null
  } catch {
    // Fora de um contexto de requisição, por exemplo durante a build estática.
    return null
  }
}
