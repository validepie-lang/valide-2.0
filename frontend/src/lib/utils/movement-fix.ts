/**
 * Correção de uma movimentação (issue 073, item 79, business-rules.md 3.5).
 *
 * O histórico é imutável: corrigir é registrar um AJUSTE com a diferença entre
 * o que foi registrado e o que aconteceu. Estas regras são o aviso imediato da
 * janela; quem decide é o servidor (`POST /movements/:id/adjust`).
 */

import { eventDayKey, formatEventClock, formatQuantity } from "./format.ts"
import type { Movement } from "../types/index.ts"

export type FixDraft = { quantity: string; note: string }
export type FixErrors = Partial<Record<keyof FixDraft, string>>
export type FixInput = { quantity: number; note: string }

const NOTE_MAX = 500

type Fixable = Pick<Movement, "type" | "quantity" | "correctedAt">

/** Só entrada e saída, e uma vez */
export function canBeCorrected(m: Fixable): boolean {
  return m.type !== "adjust" && !m.correctedAt
}

/** O que muda no lote: positivo volta para ele, negativo sai dele */
export function fixDelta(m: Pick<Movement, "type" | "quantity">, correct: number): number {
  return m.type === "out" ? m.quantity - correct : correct - m.quantity
}

export function validateFix(
  draft: FixDraft,
  m: Pick<Movement, "type" | "quantity" | "unit">,
): { errors: FixErrors; input: FixInput | null } {
  const errors: FixErrors = {}
  const typed = draft.quantity.trim()
  const quantity = Number(typed.replace(",", "."))
  if (!typed) errors.quantity = "Informe a quantidade que de fato " + (m.type === "out" ? "saiu." : "entrou.")
  else if (!Number.isFinite(quantity) || quantity < 0)
    errors.quantity = "A quantidade não pode ser negativa. Use zero se não aconteceu."
  else if (quantity === m.quantity)
    errors.quantity = `É a mesma quantidade registrada (${formatQuantity(m.quantity, m.unit)}). Se está certa, não precisa corrigir.`

  const note = draft.note.trim().replace(/\s+/g, " ")
  if (note.length < 3) errors.note = "Diga o que aconteceu, para quem conferir depois."
  else if (note.length > NOTE_MAX) errors.note = `A justificativa passou de ${NOTE_MAX} letras.`

  if (Object.keys(errors).length > 0) return { errors, input: null }
  return { errors, input: { quantity, note } }
}

/** "Volta 4 un para o lote L2291." ou "Sai 6 un do lote L2291." */
export function fixEffect(delta: number, unit: string, lotCode: string): string {
  const amount = formatQuantity(Math.abs(delta), unit)
  return delta > 0 ? `Volta ${amount} para o lote ${lotCode}.` : `Sai ${amount} do lote ${lotCode}.`
}

/** "13/10, 14:22" no fuso da conta */
export function shortEventTime(iso: string): string {
  const [, month, day] = eventDayKey(iso).split("-")
  return `${day}/${month}, ${formatEventClock(iso)}`
}

/** "Corrige a saída de 6 un de 13/10, 14:22" */
export function correctsLabel(c: NonNullable<Movement["corrects"]>, unit: string): string {
  const what = c.type === "out" ? "a saída" : "a entrada"
  return `Corrige ${what} de ${formatQuantity(c.quantity, unit)} de ${shortEventTime(c.createdAt)}`
}

/** A observação que a lista mostra: no ajuste, o que ele corrige antes da justificativa */
export function movementNoteText(m: Pick<Movement, "corrects" | "note" | "unit">): string | null {
  const parts = [m.corrects ? correctsLabel(m.corrects, m.unit) : null, m.note].filter(Boolean)
  return parts.length > 0 ? parts.join(": ") : null
}
