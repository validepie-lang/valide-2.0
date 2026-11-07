import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { LossByReason, LossSeries } from "@/components/reports/loss-charts"
import { getLossReport } from "@/lib/services/reports"
import { getSession } from "@/lib/services/session"
import { ExportButton } from "@/components/reports/export-button"
import { lossReportCsv } from "@/lib/utils/loss-csv"
import { formatMoney, formatMoneyWhole, formatNumber, formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import { EXIT_REASON_LABEL, type LossPeriod } from "@/lib/types"

export const metadata = { title: "Perdas" }

const PERIODS: { key: LossPeriod; label: string }[] = [
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "year", label: "12 meses" },
]

/**
 * Perdas: quanto saiu do estoque sem virar venda (issue 036). É o argumento
 * do Valide para o dono: a parte de vencimento é a que o controle evita.
 *
 * Do Sales Analytics Dashboard (Behance, 1.081 curtidas): três indicadores no
 * topo, o seletor de período, o gráfico por categoria com a maior em destaque.
 * O total vai no cartão cheio, como o valor em risco da Home (Gyle, Pharmly).
 * Referências em docs/04-issues/036-perdas.md.
 */
export default async function PerdasPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo } = await searchParams
  const period: LossPeriod = PERIODS.some((p) => p.key === periodo) ? (periodo as LossPeriod) : "30d"
  const [report, { company }] = await Promise.all([getLossReport(period), getSession()])
  const label = PERIODS.find((p) => p.key === period)!.label

  const expiry = report.byReason.find((r) => r.reason === "expiry")?.value ?? 0
  const otherUnits = report.byReason.filter((r) => r.reason !== "expiry").reduce((a, r) => a + r.units, 0)
  const expiryShare = report.total > 0 ? Math.round((expiry / report.total) * 100) : 0
  const change =
    report.previousTotal && report.previousTotal > 0
      ? Math.round(((report.total - report.previousTotal) / report.previousTotal) * 100)
      : null

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title="Perdas"
        description="O que saiu do estoque sem virar venda: vencimento, avaria e roubo, a preço de custo."
        className="mb-0"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de período, como o "Last Year" do Sales Analytics. Mora na URL */}
            <nav aria-label="Período" className="inline-flex rounded-pill border border-line bg-surface p-1">
              {PERIODS.map((p) => (
                <Link
                  key={p.key}
                  href={p.key === "30d" ? "/perdas" : `/perdas?periodo=${p.key}`}
                  aria-current={p.key === period ? "true" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center rounded-pill px-4 text-label font-semibold transition-colors",
                    p.key === period ? "bg-primary text-primary-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {p.label}
                </Link>
              ))}
            </nav>
            <ExportButton
              content={lossReportCsv(report, company.tradeName)}
              filename={`perdas-${period}-${report.to.slice(0, 10)}.csv`}
            />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <section
          aria-labelledby="total-perdido"
          className="flex flex-col gap-3 rounded-md bg-feature p-5 text-feature-fg shadow-card md:p-7 lg:col-span-5"
        >
          <h2 id="total-perdido" className="text-label font-semibold text-feature-muted">
            Perdido nos últimos {label}
          </h2>
          <p
            className="font-display text-[3rem] leading-none font-extrabold tracking-tight md:text-hero"
            title={formatMoney(report.total)}
          >
            {formatMoneyWhole(report.total)}
          </p>
          <p className="text-label text-feature-muted">
            <span className="tnum">{formatNumber(report.units)}</span> unidades
            {change !== null ? (
              <>
                {" · "}
                {/* Sem verde nem vermelho: essas cores são de validade */}
                <span className="font-semibold text-feature-fg tnum">
                  {change > 0 ? "+" : change < 0 ? "−" : ""}
                  {Math.abs(change)}%
                </span>{" "}
                em relação aos {label} anteriores
              </>
            ) : null}
          </p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:gap-6">
          <section className="flex flex-col gap-2 rounded-md border border-line bg-surface p-5 shadow-card md:p-6">
            <h2 className="text-label font-semibold text-fg-muted">Por vencimento</h2>
            <p className="font-display text-[2.25rem] leading-none font-extrabold text-fg md:text-[2.75rem]">
              {expiryShare}%
            </p>
            <p className="text-label text-fg-muted">
              <span className="tnum">{formatMoneyWhole(expiry)}</span> da perda. É a parte que o controle de
              validade evita.
            </p>
            <Link
              href="/estoque/retirar-vencidos"
              className="mt-auto inline-flex min-h-11 items-center gap-1.5 text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
            >
              Ver vencidos agora
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </section>
          <section className="flex flex-col gap-2 rounded-md border border-line bg-surface p-5 shadow-card md:p-6">
            <h2 className="text-label font-semibold text-fg-muted">Por avaria e roubo</h2>
            <p className="font-display text-[2.25rem] leading-none font-extrabold text-fg md:text-[2.75rem]">
              {100 - expiryShare}%
            </p>
            <p className="text-label text-fg-muted">
              <span className="tnum">{formatMoneyWhole(report.total - expiry)}</span> da perda, em{" "}
              <span className="tnum">{formatNumber(otherUnits)}</span> unidades.
            </p>
          </section>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <section className="min-w-0 rounded-md border border-line bg-surface p-5 shadow-card md:p-7 lg:col-span-8">
          <h2 className="font-display text-section font-bold text-fg">
            {report.bucket === "month" ? "Perda por mês" : "Perda por semana"}
          </h2>
          <p className="mt-1 text-label text-fg-muted">A custo de aquisição. Em destaque, o maior período.</p>
          <div className="mt-6">
            <LossSeries report={report} />
          </div>
        </section>
        <section className="rounded-md border border-line bg-surface p-5 shadow-card md:p-7 lg:col-span-4">
          <h2 className="font-display text-section font-bold text-fg">Por motivo</h2>
          <p className="mt-1 mb-5 text-label text-fg-muted">Do maior ao menor.</p>
          <LossByReason rows={report.byReason} />
        </section>
      </div>

      <section
        aria-labelledby="mais-perdidos"
        className="overflow-hidden rounded-md border border-line bg-surface shadow-card"
      >
        <div className="border-b border-line px-5 py-4 md:px-6">
          <h2 id="mais-perdidos" className="font-display text-section font-bold text-fg">
            Os produtos que mais perderam
          </h2>
        </div>
        {report.topProducts.length === 0 ? (
          <p className="px-5 py-6 text-body text-fg-muted md:px-6">
            Nenhuma perda registrada nos últimos {label}.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {report.topProducts.map((p) => (
              <li key={p.productId}>
                <Link
                  href={`/estoque/${p.productId}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-primary-soft md:px-6"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-semibold text-fg">{p.productName}</span>
                    <span className="mt-0.5 block text-label text-fg-muted">
                      Mais por {EXIT_REASON_LABEL[p.mainReason].toLowerCase()} ·{" "}
                      {formatQuantity(p.units, p.unit)}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-body font-semibold text-fg tnum"
                    title={formatMoney(p.value)}
                  >
                    {formatMoneyWhole(p.value)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
