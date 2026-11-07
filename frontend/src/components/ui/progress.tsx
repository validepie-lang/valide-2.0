import { cn } from "@/lib/utils/cn"

/** Barra de progresso. Usa Ardósia: progresso não é status de validade. */
export function Progress({
  value,
  max = 100,
  label,
  className,
}: {
  value: number
  max?: number
  label?: string
  className?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-pill bg-sunken", className)}
    >
      <div
        className="h-full rounded-pill bg-primary transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
