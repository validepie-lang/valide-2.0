import { formatAxisDay, formatMoneyWhole } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import { EXIT_REASON_LABEL, type LossReport } from "@/lib/types"

/**
 * Os dois gráficos de Perdas (issue 036), no padrão do design-system 14.5:
 * base neutra, destaque só na maior barra, valor escrito em cada barra, sem
 * eixo Y nem grade. Distribuição por categoria é barra horizontal, da maior
 * para a menor. A maior barra em destaque vem do Sales Analytics Dashboard
 * (Behance, 1.081 curtidas).
 */
export function LossByReason({ rows }: { rows: LossReport["byReason"] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((row, i) => (
        <li key={row.reason}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-body font-medium text-fg">{EXIT_REASON_LABEL[row.reason]}</span>
            <span className="text-body font-semibold text-fg tnum">{formatMoneyWhole(row.value)}</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-pill bg-sunken">
            <div
              className={cn("h-full rounded-pill", i === 0 ? "bg-chart-focus" : "bg-chart-base")}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-label text-fg-muted tnum">{row.units} unidades</p>
        </li>
      ))}
    </ul>
  )
}

const monthLabel = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" }).format(new Date(iso)).replace(".", "")

export function LossSeries({ report }: { report: LossReport }) {
  const max = Math.max(1, ...report.series.map((s) => s.value))
  const peak = report.series.reduce((best, s, i, all) => (s.value > all[best].value ? i : best), 0)
  return (
    <div className="flex h-56 items-end gap-1.5 sm:gap-2.5" role="img" aria-label="Perda por período, a custo">
      {report.series.map((s, i) => (
        <div key={s.start} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          {/* Valor em cima só em telas largas e no pico: com 13 colunas os rótulos se encostam */}
          <span
            className={cn(
              "text-micro text-fg-muted tnum whitespace-nowrap",
              i === peak ? "font-semibold text-fg" : "hidden md:inline",
            )}
          >
            {formatMoneyWhole(s.value).replace("R$ ", "")}
          </span>
          <div
            className={cn("w-full max-w-12 rounded-t-sm", i === peak ? "bg-chart-focus" : "bg-chart-base")}
            style={{ height: `${Math.max(2, (s.value / max) * 78)}%` }}
          />
          <span className="truncate text-micro text-fg-muted">
            {report.bucket === "month" ? monthLabel(s.start) : formatAxisDay(s.start)}
          </span>
        </div>
      ))}
    </div>
  )
}
