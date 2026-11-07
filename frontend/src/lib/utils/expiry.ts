/**
 * Regra de status de validade. Um lugar só, usado por toda a aplicação.
 *
 * A verdade vem do backend, que devolve o status pronto em cada lote.
 * Esta função existe para dar feedback imediato no formulário, antes de salvar.
 * Ver docs/07-decisions/technical-decisions.md, 16/09/2026.
 */

import { calendarToday } from "./calendar.ts"

export type ExpiryStatus = "expired" | "soon" | "ok" | "unknown"

/** Janela de "a vencer". Fechada pela equipe em 16/09/2026, configurável por conta. */
export const DEFAULT_SOON_THRESHOLD_DAYS = 30

/**
 * Diferença em dias de calendário, ignorando hora. Sem dependência externa.
 *
 * `today` padrão é o dia de hoje no fuso da farmácia, não em UTC: às 22h de
 * Brasília o UTC já está amanhã, e "vence em 12 dias" virava 11. 08/10/2026.
 */
export function daysUntil(date: Date, today: Date = calendarToday()): number {
  const a = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const b = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.round((a - b) / 86_400_000)
}

/**
 * O `null` está na assinatura de propósito. Produto importado sem lote é o caso
 * comum depois de uma importação, não uma exceção. Se a checagem ficar espalhada
 * pelas telas, uma delas esquece e mostra verde onde não há dado.
 */
export function getExpiryStatus(
  expiryDate: Date | string | null | undefined,
  soonThresholdDays: number = DEFAULT_SOON_THRESHOLD_DAYS,
  today: Date = calendarToday(),
): ExpiryStatus {
  if (!expiryDate) return "unknown"
  const date = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate
  if (Number.isNaN(date.getTime())) return "unknown"
  const days = daysUntil(date, today)
  // O dia do vencimento já é Vencido, como na vw_alerta_validade do banco
  // (dias_para_vencer <= 0). Até 07/10 era o último dia válido. Ver
  // docs/07-decisions/technical-decisions.md, 08/10/2026.
  if (days <= 0) return "expired"
  if (days <= soonThresholdDays) return "soon"
  return "ok"
}

/** Vocabulário fixo. Sem sinônimo, em nenhuma tela. */
export const STATUS_LABEL: Record<ExpiryStatus, string> = {
  expired: "Vencido",
  soon: "A vencer",
  ok: "No prazo",
  unknown: "Sem validade",
}

/** Ordem de urgência, para ordenar lista e montar legenda. */
export const STATUS_ORDER: ExpiryStatus[] = ["expired", "soon", "ok", "unknown"]
