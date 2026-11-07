import { calendarToday } from "./calendar.ts"

/**
 * Refaz um valor quando o dia de Brasília muda, e só então (issue 065). Serve
 * ao dado simulado: o catálogo, os avisos e as movimentações andam com o
 * calendário mesmo num servidor que passa a meia-noite ligado, sem recalcular
 * a cada requisição. `today` existe para o teste trocar o relógio.
 */
export function daily<T>(build: () => T, today: () => Date = () => calendarToday()): () => T {
  let day = ""
  let value: T
  return () => {
    const current = today().toISOString()
    if (current !== day) {
      value = build()
      day = current
    }
    return value
  }
}
