import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { formatMoney, formatMoneyWhole, formatNumber } from "@/lib/utils/format"
import { weekChange } from "@/lib/utils/week-change"
import type { DashboardData } from "@/lib/types"

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus } as const

/**
 * O indicador principal do Início, em cartão cheio (issue 027: Gyle, Pharmly,
 * Vault). Saiu de `page.tsx` na 067, quando ganhou a variação semanal.
 *
 * A variação fica numa pílula no canto, como no Pharmly, e em texto neutro:
 * vermelho e verde são de validade. Sem a semana passada, a pílula não aparece.
 */
export function ValueAtRiskCard({
  dashboard,
  threshold,
}: {
  dashboard: Pick<DashboardData, "valueAtRisk" | "valueAtRiskLastWeek" | "counts">
  threshold: number
}) {
  const { expired: expiredCount, soon: soonCount } = dashboard.counts
  const atRisk = expiredCount + soonCount
  const expiredShare = atRisk > 0 ? (expiredCount / atRisk) * 100 : 0
  const change = weekChange(dashboard.valueAtRisk, dashboard.valueAtRiskLastWeek)
  const TrendIcon = change ? TREND_ICON[change.direction] : null

  return (
    <section
      aria-labelledby="valor-em-risco"
      className="flex flex-col gap-4 rounded-md bg-feature p-5 text-feature-fg shadow-card md:p-7 lg:col-span-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 id="valor-em-risco" className="text-label font-semibold text-feature-muted">
          Valor em risco
        </h2>
        {change && TrendIcon ? (
          <p className="inline-flex items-center gap-1.5 rounded-pill bg-feature-line px-2.5 py-1 text-micro font-semibold text-feature-fg">
            <TrendIcon className="size-3.5" strokeWidth={2} aria-hidden />
            <span className="tnum">{change.text}</span>
          </p>
        ) : null}
      </div>
      <p
        className="-mt-1 font-display text-[3rem] leading-none font-extrabold tracking-tight text-feature-fg md:text-hero"
        title={formatMoney(dashboard.valueAtRisk)}
      >
        {formatMoneyWhole(dashboard.valueAtRisk)}
      </p>
      <p className="text-label text-feature-muted">
        Vencidos e a vencer em {threshold} dias, a preço de custo
      </p>

      {atRisk > 0 ? (
        <div>
          {/* A divisão do risco: quanto já venceu e quanto ainda dá para salvar */}
          <div aria-hidden className="flex h-3 gap-[3px] overflow-hidden rounded-pill">
            <span className="bg-status-expired" style={{ width: `${expiredShare}%` }} />
            <span className="flex-1 bg-status-soon" />
          </div>
          <p className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-label text-feature-fg">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-pill bg-status-expired" />
              <span>
                <span className="tnum">{formatNumber(expiredCount)}</span> vencidos
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-pill bg-status-soon" />
              <span>
                <span className="tnum">{formatNumber(soonCount)}</span> a vencer
              </span>
            </span>
          </p>
        </div>
      ) : null}

      <LinkButton
        href="/estoque?status=expired,soon"
        size="lg"
        variant="inverse"
        className="mt-auto w-full sm:w-auto sm:self-start"
      >
        Ver produtos em risco
        <ArrowRight className="size-4" aria-hidden />
      </LinkButton>
    </section>
  )
}
