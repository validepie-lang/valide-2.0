import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "@/lib/api/config"
import { ApiError, fallbackMessage, kindFromStatus, toApiError } from "@/lib/api/errors"
import { getSessionCookieHeader } from "@/lib/api/session-token"
import type { Paginated } from "@/lib/types"

type Query = Record<string, string | number | boolean | undefined | null>

function buildUrl(path: string, query?: Query): string {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

/**
 * O tenant é inferido do token, nunca enviado pelo cliente. Por isso esta
 * função não tem e não deve ganhar nenhum parâmetro de conta.
 * Ver docs/01-references/security-rules.md seção 3.
 */
async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  options: { query?: Query; body?: unknown; form?: FormData } = {},
): Promise<T> {
  const cookie = await getSessionCookieHeader()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers: {
        Accept: "application/json",
        // Com arquivo (multipart), o fetch põe o Content-Type com o boundary sozinho
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        // A sessão viaja em cookie httpOnly gravado pelo backend. Em Server
        // Component o cookie não vai sozinho, então repassamos o da requisição
        // que chegou. Nenhum token passa pelo JavaScript do navegador.
        ...(cookie ? { Cookie: cookie } : {}),
      },
      // Para o caso de alguma chamada partir do navegador um dia.
      credentials: "include",
      body: options.form ?? (options.body ? JSON.stringify(options.body) : undefined),
      signal: controller.signal,
      // Dado de estoque é por conta. Guardar em cache entre requisições seria
      // arriscar uma farmácia ver o que é de outra.
      cache: "no-store",
    })
  } catch (cause) {
    throw toApiError(cause)
  } finally {
    clearTimeout(timeout)
  }

  if (response.status === 204) return undefined as T

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const kind = kindFromStatus(response.status)
    // O contrato manda { error: { code, message } }, com a mensagem já em
    // português e pronta para exibir. Se vier fora do formato, usamos a nossa,
    // em vez de mostrar ao balconista o que o servidor resolveu devolver.
    const envelope = (payload as { error?: { code?: string; message?: string } })?.error
    const message =
      typeof envelope?.message === "string" && envelope.message.trim()
        ? envelope.message
        : fallbackMessage(kind)
    throw new ApiError(kind, response.status, message, envelope?.code ?? null)
  }

  return payload as T
}

export function apiGet<T>(path: string, query?: Query): Promise<T> {
  return request<T>("GET", path, { query })
}

/** Para as rotas que devolvem o envelope { data, meta }. */
export function apiGetList<T>(path: string, query?: Query): Promise<Paginated<T>> {
  return request<Paginated<T>>("GET", path, { query })
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, { body })
}

/** Envio de arquivo, em multipart (POST /imports, issue 056) */
export function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  return request<T>("POST", path, { form })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, { body })
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PUT", path, { body })
}

export function apiDelete(path: string): Promise<void> {
  return request<void>("DELETE", path)
}
