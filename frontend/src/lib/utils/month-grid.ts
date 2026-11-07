/**
 * A grade do mês do calendário de vencimentos (issue 052): semanas de domingo
 * a sábado, como o calendário brasileiro, com os dias de fora do mês para
 * completar a primeira e a última semana. Tudo em datas de calendário
 * ("2026-10-14"), a mesma representação da validade.
 */

export type GridDay = { key: string; day: number; inMonth: boolean }

/** "2026-10" vira o primeiro dia em UTC; valor inválido vira `null` */
export function parseMonth(value: string | undefined): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return new Date(Date.UTC(Number(match[1]), month - 1, 1))
}

export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7)
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1))
}

export function monthGrid(first: Date): GridDay[][] {
  const start = new Date(first)
  start.setUTCDate(1 - first.getUTCDay())
  const weeks: GridDay[][] = []
  const cursor = new Date(start)
  do {
    const week: GridDay[] = []
    for (let i = 0; i < 7; i++) {
      week.push({
        key: cursor.toISOString().slice(0, 10),
        day: cursor.getUTCDate(),
        inMonth: cursor.getUTCMonth() === first.getUTCMonth(),
      })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  } while (cursor.getUTCMonth() === first.getUTCMonth())
  return weeks
}

const MONTH = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })

/** "outubro de 2026" */
export function monthLabel(first: Date): string {
  return MONTH.format(first)
}
