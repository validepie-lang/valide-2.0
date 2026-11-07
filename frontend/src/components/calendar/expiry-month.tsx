import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { STATUS_LABEL, type ExpiryStatus } from "@/lib/utils/expiry"
import { addMonths, monthGrid, monthKey, monthLabel } from "@/lib/utils/month-grid"
import { cn } from "@/lib/utils/cn"
import type { CalendarLot } from "@/lib/types"

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

/** O dia assume o pior estado entre os lotes dele, como o produto assume o do lote que vence primeiro */
const WORST: ExpiryStatus[] = ["expired", "soon", "ok"]
const BAR: Record<ExpiryStatus, string> = {
  expired: "bg-status-expired",
  soon: "bg-status-soon",
  ok: "bg-status-unknown",
  unknown: "bg-status-unknown",
}

export function calendarHref(month: string, day?: string): string {
  return `/estoque/calendario?mes=${month}${day ? `&dia=${day}` : ""}`
}

/**
 * O mês em grade (issue 052), como o calendário do Kalee (Behance, 2.177
 * curtidas): o mês com as setas em cima, os dias de fora do mês apagados e o
 * dia escolhido em destaque. Em cada dia, quantos lotes vencem, com a barra
 * do pior estado. No Prazo vai em cinza: o calendário chama atenção para o
 * que pede ação, e verde em 30 dias seguidos viraria ruído.
 */
export function ExpiryMonth({
  first,
  lots,
  selected,
  today,
}: {
  first: Date
  lots: CalendarLot[]
  selected: string
  today: string
}) {
  const byDay = new Map<string, CalendarLot[]>()
  for (const lot of lots) {
    const key = lot.expiresAt.slice(0, 10)
    byDay.set(key, [...(byDay.get(key) ?? []), lot])
  }
  const month = monthKey(first)
  const nav =
    "grid size-11 place-items-center rounded-pill border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg md:size-9"

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2">
        <h2 className="mr-auto font-display text-section font-bold text-fg first-letter:uppercase">
          {monthLabel(first)}
        </h2>
        {month !== today.slice(0, 7) ? (
          <Link
            href={calendarHref(today.slice(0, 7), today)}
            className="inline-flex min-h-11 items-center px-2 text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
          >
            Hoje
          </Link>
        ) : null}
        <Link href={calendarHref(monthKey(addMonths(first, -1)))} aria-label="Mês anterior" className={nav}>
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
        <Link href={calendarHref(monthKey(addMonths(first, 1)))} aria-label="Próximo mês" className={nav}>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      <table className="mt-4 w-full table-fixed border-collapse">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="pb-2 text-center text-label font-medium text-fg-muted">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(first).map((week) => (
            <tr key={week[0].key}>
              {week.map((day) => {
                const items = byDay.get(day.key) ?? []
                const worst = WORST.find((s) => items.some((l) => l.status === s))
                const isSelected = day.key === selected
                const isToday = day.key === today
                return (
                  <td key={day.key} className="p-0.5 md:p-1">
                    <Link
                      href={calendarHref(month, day.key)}
                      aria-current={isSelected ? "date" : undefined}
                      className={cn(
                        "flex h-12 flex-col items-center justify-center gap-1 rounded-md border text-body transition-colors md:h-20 md:items-start md:justify-between md:p-2",
                        isSelected
                          ? "border-primary bg-primary-soft"
                          : "border-transparent hover:border-line-strong",
                        !day.inMonth && "text-fg-disabled",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 place-items-center rounded-pill tnum",
                          isToday && "bg-primary font-semibold text-primary-fg",
                          !isToday && day.inMonth && "text-fg",
                        )}
                      >
                        {day.day}
                        {isToday ? <span className="sr-only">, hoje</span> : null}
                      </span>
                      {worst ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            aria-hidden
                            className={cn("h-1.5 w-4 rounded-pill md:h-1 md:w-3", BAR[worst])}
                          />
                          <span className="hidden text-label font-semibold text-fg tnum md:inline">
                            {items.length}
                          </span>
                          <span className="sr-only">
                            {`, ${items.length} ${items.length === 1 ? "lote vence" : "lotes vencem"}, o pior ${STATUS_LABEL[worst]}`}
                          </span>
                        </span>
                      ) : null}
                    </Link>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-label text-fg-muted">
        {WORST.map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span aria-hidden className={cn("h-1.5 w-4 rounded-pill", BAR[s])} />
            {STATUS_LABEL[s]}
          </li>
        ))}
      </ul>
    </Card>
  )
}
