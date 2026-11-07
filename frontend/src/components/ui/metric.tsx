import { StatusIcon } from "@/components/ui/status-chip"
import { cn } from "@/lib/utils/cn"
import type { ExpiryStatus } from "@/lib/utils/expiry"

type Size = "hero" | "metric" | "section"

/**
 * O tamanho do número segue o nível de leitura. `hero` é o nível 1 e só existe
 * um por tela; vai em Mona Sans, com algarismos proporcionais.
 */
const VALUE: Record<Size, string> = {
  hero: "font-display text-metric md:text-hero",
  metric: "text-metric tnum",
  section: "text-section tnum",
}

/** Cor sólida do status, só no ícone do rótulo. O número nunca é colorido */
const ICON: Record<ExpiryStatus, string> = {
  expired: "text-status-expired",
  soon: "text-status-soon",
  ok: "text-status-ok",
  unknown: "text-status-unknown",
}

/**
 * Anatomia única de indicador (design-system.md, seção 14.2).
 *
 * Rótulo, número, contexto. Sem ícone decorativo, sem fundo, sem borda: o
 * peso vem do tamanho e da posição. Quando o indicador é um estado de
 * validade, o ícone do estado entra no rótulo, e o estado continua com cor,
 * ícone e rótulo juntos.
 */
export function Metric({
  label,
  value,
  context,
  size = "metric",
  status,
  muted = false,
  fullValue,
  labelId,
  className,
  valueClassName,
}: {
  label: string
  /** já formatado */
  value: string
  context?: React.ReactNode
  size?: Size
  status?: ExpiryStatus
  /** contagem zero: o indicador continua no lugar, sem chamar atenção */
  muted?: boolean
  /** valor completo, quando o exibido é arredondado (R$ 8.573 de R$ 8.572,67) */
  fullValue?: string
  labelId?: string
  className?: string
  /** para alinhar números de tamanhos diferentes na mesma linha */
  valueClassName?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p id={labelId} className="flex items-center gap-1.5 text-label font-medium text-fg-muted">
        {status ? (
          <StatusIcon
            status={status}
            className={cn("size-3.5 shrink-0", muted ? "text-fg-muted" : ICON[status])}
          />
        ) : null}
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 leading-none font-semibold",
          VALUE[size],
          muted ? "text-fg-muted" : "text-fg",
          valueClassName,
        )}
        title={fullValue}
      >
        {fullValue ? (
          <>
            <span aria-hidden>{value}</span>
            <span className="sr-only">{fullValue}</span>
          </>
        ) : (
          value
        )}
      </p>
      {context ? <div className="mt-2 text-label text-fg-muted">{context}</div> : null}
    </div>
  )
}
