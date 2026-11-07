import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { StatusIcon } from "@/components/ui/status-chip"
import { STATUS_LABEL, STATUS_ORDER, type ExpiryStatus } from "@/lib/utils/expiry"
import { formatMoney, formatMoneyWhole, formatNumber } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { DashboardCounts } from "@/lib/types"

/**
 * Os quatro estados em cartões, na direção A (09/10/2026).
 *
 * Até aqui era uma faixa cinza em que "5 vencidos" pesava o mesmo que
 * "35 no prazo". Agora a cor de status ganha presença: ícone e rótulo na cor
 * do estado e, nos dois que pedem ação hoje, um fundo levemente tingido. A
 * faixa colorida no topo saiu na issue 061: é o cartão de modelo pronto, e
 * nenhuma das referências do Behance a usa. O número
 * continua em `fg`: cor, ícone e rótulo juntos dizem o estado.
 * Cada cartão é um link para o que resolve aquele estado.
 *
 * `row` (issue 027) põe os quatro numa fileira a partir de `lg`, ao lado do
 * indicador principal, como a fileira de indicadores do Gyle, do Pharmly e do
 * Vault (Behance). No tablet e no celular, continua 2 por 2. Na Home, desde a
 * issue 061, é 2 por 2 também no desktop, ao lado do cartão cheio: em fileira
 * de quatro, os cartões esticavam até a altura dele e ficavam com meio vazio.
 */
const TONE: Record<ExpiryStatus, { bg: string; ink: string }> = {
  expired: { bg: "bg-status-expired-tint", ink: "text-status-expired-fg" },
  soon: { bg: "bg-status-soon-tint", ink: "text-status-soon-fg" },
  ok: { bg: "bg-surface", ink: "text-status-ok-fg" },
  unknown: { bg: "bg-surface", ink: "text-status-unknown-fg" },
}

export function StatusSummary({
  counts,
  pendingValue,
  soonThresholdDays,
  row = false,
}: {
  counts: DashboardCounts
  /** centavos parados em produto sem validade informada */
  pendingValue: number
  soonThresholdDays: number
  row?: boolean
}) {
  const context: Record<ExpiryStatus, string> = {
    expired: "Retirar da prateleira hoje",
    soon: `Em até ${soonThresholdDays} dias`,
    ok: `Mais de ${soonThresholdDays} dias`,
    unknown: `${formatMoneyWhole(pendingValue)} parados`,
  }

  return (
    <section aria-label="Situação do estoque" className="h-full min-w-0">
      <ul className={cn("grid h-full auto-rows-fr grid-cols-2 gap-3 md:gap-5", row && "lg:grid-cols-4")}>
        {STATUS_ORDER.map((status) => {
          const count = counts[status]
          const tone = TONE[status]
          const isUnknown = status === "unknown"
          return (
            <li key={status} className="flex">
              <Link
                href={isUnknown ? "/estoque/validades-pendentes" : `/estoque?status=${status}`}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-md border border-line p-4 shadow-card transition-colors hover:border-line-strong md:p-5",
                  count > 0 ? tone.bg : "bg-surface",
                )}
              >
                <span className={cn("flex items-center gap-2 text-label font-semibold", count > 0 ? tone.ink : "text-fg-muted")}>
                  <StatusIcon status={status} className="size-4 shrink-0" />
                  {STATUS_LABEL[status]}
                </span>
                <span
                  className={cn(
                    "font-display text-[2.25rem] leading-none font-extrabold tracking-tight md:text-[2.75rem]",
                    count > 0 ? "text-fg" : "text-fg-muted",
                  )}
                >
                  {formatNumber(count)}
                </span>
                <span className="text-label text-fg-muted">
                  {isUnknown ? (
                    <span title={`${formatMoney(pendingValue)} parados`}>{context.unknown}</span>
                  ) : (
                    context[status]
                  )}
                </span>
                {isUnknown && count > 0 ? (
                  <span className="mt-auto text-label font-semibold whitespace-nowrap text-fg">
                    Informar validades
                    <ArrowRight className="ml-1 hidden size-3.5 align-[-2px] sm:inline" aria-hidden />
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
