import { AlertTriangle, CheckCircle2, Clock, HelpCircle, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { STATUS_LABEL, type ExpiryStatus } from "@/lib/utils/expiry"

/**
 * Status nunca é comunicado só por cor. Sempre cor mais ícone mais rótulo.
 * A cor vem do status e nunca é passada por prop.
 *
 * O estado `unknown` é ausência de dado, não um status de validade. Por isso é
 * neutro. Mostrar verde ali daria ao usuário uma segurança que ele não tem.
 */
const STYLE: Record<ExpiryStatus, { box: string; dot: string; Icon: LucideIcon }> = {
  expired: {
    box: "bg-status-expired-bg text-status-expired-fg",
    dot: "bg-status-expired",
    Icon: AlertTriangle,
  },
  soon: {
    box: "bg-status-soon-bg text-status-soon-fg",
    dot: "bg-status-soon",
    Icon: Clock,
  },
  ok: {
    box: "bg-status-ok-bg text-status-ok-fg",
    dot: "bg-status-ok",
    Icon: CheckCircle2,
  },
  unknown: {
    box: "bg-status-unknown-bg text-status-unknown-fg",
    dot: "bg-status-unknown",
    Icon: HelpCircle,
  },
}

export function StatusChip({
  status,
  size = "md",
  className,
}: {
  status: ExpiryStatus
  size?: "sm" | "md"
  className?: string
}) {
  const { box, Icon } = STYLE[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill font-medium whitespace-nowrap",
        size === "sm" ? "gap-1 px-2 py-0.5 text-micro" : "gap-1.5 px-2.5 py-1 text-label",
        box,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  )
}

/** Ponto sólido, para legenda e lista compacta. Acompanhado sempre de rótulo. */
export function StatusDot({
  status,
  className,
}: {
  status: ExpiryStatus
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-pill", STYLE[status].dot, className)}
    />
  )
}

export function StatusIcon({
  status,
  className,
}: {
  status: ExpiryStatus
  className?: string
}) {
  const { Icon } = STYLE[status]
  return <Icon className={className} aria-hidden />
}
