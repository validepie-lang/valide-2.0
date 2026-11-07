/**
 * Período com datas escolhidas (issue 073, item 76), como o "01 Sep – 30 Sep"
 * do Sales Analytics (Behance). Chega pelo endereço (`?de=&ate=`), então pode
 * chegar qualquer coisa: o que não serve vira uma frase, e a tela volta ao
 * período padrão em vez de quebrar.
 */

const KEY = /^\d{4}-\d{2}-\d{2}$/
/** Até um ano para trás */
export const MAX_RANGE_DAYS = 366

function valid(key: string): boolean {
  if (!KEY.test(key)) return false
  const date = new Date(`${key}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === key
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

/**
 * `today` é o dia de hoje no fuso da conta, "2026-10-13". Sem nenhuma das
 * duas datas, `null`: vale o período pronto. Só "de": até hoje.
 */
export function parseDateRange(
  de: string | undefined,
  ate: string | undefined,
  today: string,
): { from: string; to: string } | { error: string } | null {
  const from = de?.trim() || ""
  const to = ate?.trim() || (from ? today : "")
  if (!from && !to) return null
  if (!from) return { error: "Escolha também a data de início." }
  if (!valid(from) || !valid(to)) return { error: "Uma das datas não existe no calendário." }
  if (from > today) return { error: "A data de início não pode passar de hoje." }
  if (from > to) return { error: "A data de início vem depois da data final." }
  if (to > today) return { error: "A data final não pode passar de hoje." }
  if (daysBetween(from, today) > MAX_RANGE_DAYS) return { error: "Dá para ver até um ano para trás." }
  return { from, to }
}

/** "2026-09-01" e "2026-09-30" para "De 01/09/2026 a 30/09/2026"; um dia só, "Em 01/09/2026" */
export function rangeLabel(from: string, to: string): string {
  const br = (key: string) => key.split("-").reverse().join("/")
  return from === to ? `Em ${br(from)}` : `De ${br(from)} a ${br(to)}`
}
