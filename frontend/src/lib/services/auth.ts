/**
 * Entrar e sair da conta.
 *
 * O backend é o dono da sessão: no login ele grava o cookie httpOnly
 * `valide_session` na resposta, e a partir daí o navegador manda o cookie
 * sozinho. Este arquivo não lê, não guarda e não monta token nenhum, só
 * dispara a chamada. Ver docs/07-decisions/security-decisions.md, 16/09/2026.
 *
 * Vive separado de `session.ts` de propósito: aquele é para Server Component
 * (lê o cookie da requisição que chegou) e este é para o navegador, que não
 * pode importar `next/headers`.
 */

import { API_BASE_URL, REQUEST_TIMEOUT_MS, isLive } from "@/lib/api/config"
import { ApiError, fallbackMessage, kindFromStatus, toApiError } from "@/lib/api/errors"

async function post(path: string, body?: unknown): Promise<Response> {
  if (!API_BASE_URL) throw new ApiError("network", 0, fallbackMessage("network"))

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      // É isto que faz o navegador aceitar e guardar o cookie do backend.
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    })
  } catch (cause) {
    throw toApiError(cause)
  } finally {
    clearTimeout(timeout)
  }
}

/** Mensagem do contrato (`error.message`, já em português) ou a nossa reserva. */
async function erroDe(response: Response): Promise<ApiError> {
  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  const envelope = (payload as { error?: { code?: string; message?: string } } | null)?.error
  const kind = kindFromStatus(response.status)
  const message =
    typeof envelope?.message === "string" && envelope.message.trim()
      ? envelope.message
      : fallbackMessage(kind)
  return new ApiError(kind, response.status, message, envelope?.code ?? null)
}

/**
 * POST /auth/login. Não devolve nada: quem entrou passa a ser o cookie.
 *
 * Sem a área `auth` ligada na API, a demonstração entra direto, como era antes
 * do login existir.
 */
export async function signIn(login: string, password: string): Promise<void> {
  if (!isLive("auth")) return

  const response = await post("/auth/login", { login, password })
  if (!response.ok) throw await erroDe(response)
}

/** POST /auth/logout. Falhar aqui não muda nada: o cookie local já não serve. */
export async function signOut(): Promise<void> {
  if (!isLive("auth")) return

  try {
    await post("/auth/logout")
  } catch {
    // Sair tem que funcionar mesmo com o servidor fora do ar.
  }
}
