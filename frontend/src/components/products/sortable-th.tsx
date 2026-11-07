import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import type { ProductFilters } from "@/lib/types"

export type ProductSort = NonNullable<ProductFilters["sort"]>

/**
 * Cabeçalho de coluna que ordena (issue 029), como no SaaS Data Table e no
 * Data table for inventory (Behance): a seta da ordem atual na coluna ativa,
 * a seta dupla apagada nas outras. A ordem vai na URL, então é um link.
 *
 * `options` é a sequência de um clique a outro: Validade alterna entre o que
 * vence primeiro e o que vence por último; Produto e Quantidade têm uma só.
 * Desde a issue 076 serve a qualquer lista (`S`), e a tela Pastas usa também.
 */
export function SortableTh<S extends string = ProductSort>({
  label,
  current,
  options,
  hrefFor,
  className,
  leading,
}: {
  label: string
  current: S
  options: { sort: S; direction: "ascending" | "descending"; hint: string }[]
  hrefFor: (sort: S) => string
  className?: string
  /** antes do rótulo: a caixa de marcar a página (issue 069) */
  leading?: React.ReactNode
}) {
  const index = options.findIndex((o) => o.sort === current)
  const active = index >= 0 ? options[index] : null
  const next = options[(index + 1) % options.length]
  const Icon = active ? (active.direction === "ascending" ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <th
      scope="col"
      aria-sort={active ? active.direction : undefined}
      className={cn(
        "px-3 py-3 text-label font-semibold text-fg-muted first:pl-4 last:pr-6 md:first:pl-6",
        className,
      )}
    >
      {leading ? <span className="mr-3 inline-flex align-middle">{leading}</span> : null}
      <Link
        href={hrefFor(next.sort)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-fg",
          active && "text-fg",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-60")} aria-hidden />
        <span className="sr-only">, ordenar {next.hint}</span>
      </Link>
    </th>
  )
}
