/**
 * Erro de API tratado.
 *
 * Erro de rede vira erro tratado, nunca exceção solta na tela.
 * A mensagem que chega ao usuário diz o que aconteceu e o que fazer, e nunca
 * vaza stack, id interno, nome de tabela ou caminho de arquivo.
 * Ver docs/01-references/security-rules.md seção 5.
 */

export type ApiErrorKind =
  | "network"      // não conseguiu falar com o servidor
  | "timeout"      // servidor demorou demais
  | "unauthorized" // sessão expirada ou inválida
  | "forbidden"    // o cargo não pode fazer isso
  | "notFound"
  | "conflict"     // regra de negócio barrou, por exemplo SKU repetido
  | "invalid"      // dados do formulário recusados pelo servidor
  | "server"       // erro do lado do servidor
  | "unknown"

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number
  /** Código do backend, por exemplo PRODUCT_NOT_FOUND. Para decidir o que a tela faz. */
  readonly code: string | null

  constructor(kind: ApiErrorKind, status: number, message: string, code: string | null = null) {
    super(message)
    this.name = "ApiError"
    this.kind = kind
    this.status = status
    this.code = code
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized"
  if (status === 403) return "forbidden"
  if (status === 404) return "notFound"
  if (status === 409) return "conflict"
  if (status === 422 || status === 400) return "invalid"
  if (status >= 500) return "server"
  return "unknown"
}

/**
 * Mensagem para exibir quando o backend não mandou uma.
 *
 * O contrato diz que `error.message` já vem em português e pronto para a tela,
 * então o normal é usar a do servidor. Estas aqui são a rede de segurança para
 * quando a resposta não segue o contrato, ou quando nem chegou lá.
 */
const FALLBACK: Record<ApiErrorKind, string> = {
  network:
    "Não foi possível falar com o servidor. Verifique a conexão e tente de novo.",
  timeout:
    "O servidor demorou para responder. Tente de novo em alguns segundos.",
  unauthorized:
    "Sua sessão expirou. Entre de novo para continuar.",
  forbidden:
    "Seu cargo não tem acesso a esta ação. Peça a quem administra a conta.",
  notFound:
    "Não encontramos o que você procurou. Ele pode ter sido excluído.",
  conflict:
    "Esta ação não pôde ser concluída porque entra em conflito com algo que já existe.",
  invalid:
    "Alguns dados não foram aceitos. Confira os campos marcados e tente de novo.",
  server:
    "O servidor teve um problema. Tente de novo em alguns minutos.",
  unknown:
    "Não foi possível concluir. Tente de novo.",
}

export function fallbackMessage(kind: ApiErrorKind): string {
  return FALLBACK[kind]
}

/** Transforma qualquer coisa capturada em algo que a tela sabe exibir. */
export function toApiError(cause: unknown): ApiError {
  if (cause instanceof ApiError) return cause
  if (cause instanceof DOMException && cause.name === "AbortError") {
    return new ApiError("timeout", 0, FALLBACK.timeout)
  }
  return new ApiError("network", 0, FALLBACK.network)
}
