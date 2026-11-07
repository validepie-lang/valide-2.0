import { toApiError } from "@/lib/api/errors"

/**
 * O que toda server action devolve à tela (fase de lógica, issue 053).
 *
 * A exceção não atravessa a fronteira entre servidor e navegador com a
 * mensagem intacta, então o erro vira dado: a mensagem já pronta para exibir
 * (em português, do servidor do Pedro ou de `errors.ts`) e o `code` para a
 * tela decidir onde mostrar (por exemplo LOT_CODE_TAKEN no campo do lote).
 */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string; code: string | null }

export function actionFailure(cause: unknown): { ok: false; message: string; code: string | null } {
  const error = toApiError(cause)
  return { ok: false, message: error.message, code: error.code }
}

/** Quando a própria chamada à action falha (sem rede até o servidor do Next) */
export const UNREACHABLE: { ok: false; message: string; code: null } = {
  ok: false,
  message: "Não foi possível falar com o servidor. Verifique a conexão e tente de novo.",
  code: null,
}
