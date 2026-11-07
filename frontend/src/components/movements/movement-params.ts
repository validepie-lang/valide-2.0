import { calendarToday } from "@/lib/utils/calendar"
import { parseDateRange } from "@/lib/utils/date-range"
import type { ExitReason, MovementFilters } from "@/lib/types"

/**
 * Os filtros de Movimentações moram no endereço, em português (issue 041):
 * `?tipo=saida&motivo=vencimento&pessoa=u3&periodo=7d&pagina=2`. Desde a 073,
 * `tipo=ajuste` e as datas livres `?de=2026-09-01&ate=2026-09-30`, que valem
 * mais que o período pronto.
 */
export type MovementSearchParams = {
  tipo?: string
  motivo?: string
  pessoa?: string
  periodo?: string
  pagina?: string
  /** um produto só (issue 050, item 78) */
  produto?: string
  /** datas livres (issue 073, item 76) */
  de?: string
  ate?: string
  /** depois de corrigir: a faixa de confirmação (issue 073, item 79) */
  corrigido?: string
  /** cargo de demonstração (`?cargo=balconista`) */
  cargo?: string
}

const TYPE_SLUG: Record<string, "in" | "out" | "adjust"> = { entrada: "in", saida: "out", ajuste: "adjust" }

export const REASON_SLUG: Record<string, ExitReason> = {
  venda: "sale",
  vencimento: "expiry",
  avaria: "damage",
  roubo: "theft",
  consumo: "internal",
}

export const PERIODS = [
  { slug: "hoje", label: "Hoje", days: 0 },
  { slug: "7d", label: "7 dias", days: 6 },
  { slug: "30d", label: "30 dias", days: 29 },
] as const

export const DEFAULT_PERIOD = "30d"

/** O link com um filtro trocado. Trocar filtro volta à primeira página */
export function movementsHref(current: MovementSearchParams, patch: MovementSearchParams): string {
  const next: MovementSearchParams = { ...current, ...patch }
  if (!("pagina" in patch)) delete next.pagina
  // A confirmação vale para a tela de chegada, não para o próximo filtro
  if (!("corrigido" in patch)) delete next.corrigido
  if (next.periodo === DEFAULT_PERIOD) delete next.periodo
  const query = new URLSearchParams(
    Object.entries(next).filter((entry): entry is [string, string] => Boolean(entry[1])),
  )
  const text = query.toString()
  return text ? `/estoque/movimentacoes?${text}` : "/estoque/movimentacoes"
}

/** Do endereço para o filtro do serviço; valor desconhecido é ignorado */
export function parseMovementParams(
  params: MovementSearchParams,
  now: Date = new Date(),
): Required<Pick<MovementFilters, "page" | "from" | "to">> &
  MovementFilters & {
    /** o período pronto, ou "datas" quando vale o que foi escolhido */
    period: string
    /** datas do endereço que não servem: a tela usa o padrão e diz por quê */
    rangeError: string | null
  } {
  const tipo = params.tipo ? TYPE_SLUG[params.tipo] : undefined
  const reason =
    tipo === "in" || tipo === "adjust" ? undefined : params.motivo ? REASON_SLUG[params.motivo] : undefined
  const todayDate = calendarToday(now)
  const today = todayDate.toISOString().slice(0, 10)
  const range = parseDateRange(params.de, params.ate, today)
  const custom = range && "from" in range ? range : null
  const period =
    (custom ? null : PERIODS.find((p) => p.slug === params.periodo)) ??
    PERIODS.find((p) => p.slug === DEFAULT_PERIOD)!
  const first = new Date(todayDate)
  first.setUTCDate(first.getUTCDate() - period.days)
  const page = Number(params.pagina)

  return {
    type: reason ? "out" : tipo,
    reason,
    userId: params.pessoa || undefined,
    productId: params.produto || undefined,
    from: custom?.from ?? first.toISOString().slice(0, 10),
    to: custom?.to ?? today,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    period: custom ? "datas" : period.slug,
    rangeError: range && "error" in range ? range.error : null,
  }
}
