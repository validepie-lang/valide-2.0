/**
 * Regras da saída de um lote (issue 054). São o aviso imediato: quem recusa de
 * verdade é o servidor (`422 LOT_QUANTITY_EXCEEDED`, `403` para o Balconista
 * que tenta descartar). Ver business-rules.md seção 3.
 */

import type { ExitReason } from "@/lib/types"

/** O que vai para `POST /movements/out` */
export type ExitInput = { lotId: string; quantity: number; reason: ExitReason; note?: string }

export type ExitDraft = { lotId: string; quantity: string; reason: ExitReason | ""; note: string }
export type ExitDraftErrors = Partial<Record<"quantity" | "reason", string>>

export function validateExit(
  draft: ExitDraft,
  { available, availableLabel }: { available: number; availableLabel: string },
): { errors: ExitDraftErrors; input: ExitInput | null } {
  const errors: ExitDraftErrors = {}
  const typed = draft.quantity.trim()
  const quantity = Number(typed.replace(",", "."))
  if (!typed) errors.quantity = "Informe quanto está saindo."
  else if (!Number.isFinite(quantity) || quantity <= 0)
    errors.quantity = "A quantidade precisa ser maior que zero."
  else if (quantity > available) {
    errors.quantity = `Este lote tem ${availableLabel}. Escolha uma quantidade menor ou troque de lote.`
  }
  if (!draft.reason) errors.reason = "Escolha o motivo da saída."

  if (Object.keys(errors).length > 0 || !draft.reason) return { errors, input: null }
  const note = draft.note.trim()
  return {
    errors,
    input: { lotId: draft.lotId, quantity, reason: draft.reason, ...(note ? { note } : {}) },
  }
}
