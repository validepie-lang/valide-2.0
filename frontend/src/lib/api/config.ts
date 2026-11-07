/**
 * Configuração da camada de rede.
 *
 * O Pedro entrega os endpoints em ordem: B24 primeiro, depois B28, depois B27
 * e B30. Então a chave entre dados falsos e API de verdade é **por área**, não
 * uma chave só para tudo. Quando a autenticação existir, `auth` entra na lista
 * e o resto continua com mock, sem tocar em tela nenhuma.
 *
 * Variável de ambiente com prefixo NEXT_PUBLIC_ vai para o navegador, então só
 * entra aqui o que pode ser público: a URL base e quais áreas já estão ligadas.
 * Ver docs/01-references/security-rules.md seção 1.
 */

export type ApiArea =
  | "auth"
  | "products"
  | "folders"
  | "dashboard"
  | "movements"
  | "notifications"
  | "imports"
  | "reports"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? ""

/**
 * Lista separada por vírgula das áreas já ligadas na API.
 * `NEXT_PUBLIC_API_LIVE="auth,folders"` liga só essas duas.
 * `NEXT_PUBLIC_API_LIVE="all"` liga tudo.
 */
const LIVE_AREAS = (process.env.NEXT_PUBLIC_API_LIVE ?? "")
  .split(",")
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean)

/**
 * Sem URL base não existe API para chamar, então o mock vale de qualquer jeito.
 * Isso evita que um deploy sem variável configurada quebre a tela inteira.
 */
export function isLive(area: ApiArea): boolean {
  if (!API_BASE_URL) return false
  return LIVE_AREAS.includes("all") || LIVE_AREAS.includes(area)
}

/** Quanto tempo esperar antes de desistir de uma requisição. */
export const REQUEST_TIMEOUT_MS = 15_000
