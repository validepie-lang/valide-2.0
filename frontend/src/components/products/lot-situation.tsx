import { StatusChip } from "@/components/ui/status-chip"
import { daysUntil, type ExpiryStatus } from "@/lib/utils/expiry"
import { formatDate, formatExpiryDistance, formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { Lot, ProductUnit } from "@/lib/types"

/**
 * Nível 1 do detalhe do produto: tem algo a resolver, e em qual lote.
 *
 * O produto assume a situação do lote que vence primeiro, porque é ali que há
 * algo a fazer. A frase diz qual lote e quando, com o verbo no tempo certo:
 * até 08/10 o bloco dizia "Vence primeiro" ao lado de uma data que já passou.
 *
 * Direção A (09/10/2026): vira um cartão de estado, com a faixa no topo e,
 * quando é Vencido ou A vencer, o fundo tingido. Os números do produto entram
 * no mesmo cartão, abaixo de um fio (docs/03-specs/direcao-visual-a.md).
 */
const TONE: Record<ExpiryStatus, { bar: string; bg: string }> = {
  expired: { bar: "border-t-status-expired", bg: "bg-status-expired-tint" },
  soon: { bar: "border-t-status-soon", bg: "bg-status-soon-tint" },
  ok: { bar: "border-t-status-ok", bg: "bg-surface" },
  unknown: { bar: "border-t-status-unknown", bg: "bg-surface" },
}

export function LotSituation({
  status,
  nearest,
  unit,
  children,
}: {
  status: ExpiryStatus
  /** o lote que vence primeiro, ou null se o produto não tem lote */
  nearest: Lot | null
  unit: ProductUnit
  /** os números do produto, abaixo da frase */
  children?: React.ReactNode
}) {
  const tone = TONE[status]
  return (
    <section
      aria-label="Situação do produto"
      className={cn(
        "rounded-md border border-t-[5px] border-line p-5 shadow-card md:p-7",
        tone.bar,
        tone.bg,
      )}
    >
      <div className="flex flex-col items-start gap-3">
        <StatusChip status={status} />
        {nearest ? (
          <p className="font-display text-section font-bold text-fg md:text-display-sm">
            Lote {nearest.code} {formatExpiryDistance(daysUntil(new Date(nearest.expiresAt)))}{" "}
            <span className="tnum">({formatDate(nearest.expiresAt)})</span>.{" "}
            <span className="font-sans text-body font-normal text-fg-muted md:text-section">
              São {formatQuantity(nearest.quantity, unit)} nesse lote.
            </span>
          </p>
        ) : (
          // A ação de informar é o botão principal da tela, logo acima
          <p className="font-display text-section font-bold text-fg md:text-display-sm">
            Validade não informada.{" "}
            <span className="font-sans text-body font-normal text-fg-muted md:text-section">
              O painel ainda não acompanha este produto.
            </span>
          </p>
        )}
      </div>
      {children ? <div className="mt-6 border-t border-line pt-6">{children}</div> : null}
    </section>
  )
}
