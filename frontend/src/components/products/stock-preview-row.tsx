import { cn } from "@/lib/utils/cn"

/**
 * Linha de "Como o estoque fica", na saída e na entrada: o resultado antes de
 * gravar, porque erro de digitação no balcão acontece.
 */
export function StockPreviewRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-label text-fg-muted">{label}</dt>
      <dd className={cn("tnum", strong ? "text-section font-semibold text-fg" : "text-body text-fg")}>
        {value}
      </dd>
    </div>
  )
}
