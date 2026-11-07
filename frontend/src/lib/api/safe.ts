import { ApiError } from "@/lib/api/errors"

/**
 * Para dado que enfeita a tela, não para dado que é a tela.
 *
 * O cabeçalho do app fica no layout, e `error.tsx` não pega erro de layout: um
 * serviço secundário falhando ali derruba todas as telas de uma vez. O sino de
 * notificações fora do ar não pode impedir o balconista de dar baixa.
 *
 * Use só onde a ausência do dado é aceitável. Para o conteúdo principal de uma
 * tela, deixe o erro subir: aí a fronteira de erro mostra o que aconteceu e
 * oferece tentar de novo, em vez de fingir que não há nada.
 */
export async function optional<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch (cause) {
    // Em desenvolvimento vale ver o que falhou. Em produção vai para o log do
    // servidor, nunca para a tela.
    if (process.env.NODE_ENV !== "production") {
      const detail = cause instanceof ApiError ? `${cause.kind}: ${cause.message}` : cause
      console.warn("[valide] dado opcional indisponível:", detail)
    }
    return fallback
  }
}
