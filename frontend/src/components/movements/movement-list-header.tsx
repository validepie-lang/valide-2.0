import Link from "next/link"
import { X } from "lucide-react"
import { CardSubtitle, CardTitle } from "@/components/ui/card"
import { MovementExport } from "@/components/movements/movement-export"
import { movementsHref, type MovementSearchParams } from "@/components/movements/movement-params"
import { formatNumber } from "@/lib/utils/format"

/**
 * O topo do cartão de Movimentações: o período no título, o produto filtrado
 * com "×" (issue 050) e, desde a 073, "Exportar planilha" à direita, como o
 * "Export" do SaaS Data Table.
 */
export function MovementListHeader({
  title,
  params,
  product,
  total,
  filtered,
}: {
  title: string
  params: MovementSearchParams
  product: { name: string } | null
  total: number
  filtered: boolean
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between md:px-6 md:pt-6 md:pb-4">
      <div className="min-w-0">
        <CardTitle>{title}</CardTitle>
        {product ? (
          // Vindo do histórico do produto (issue 050, item 78): o filtro aparece com o nome e um "×"
          <p className="mt-2 inline-flex items-center gap-2 rounded-pill border border-line bg-sunken py-1 pr-1 pl-3 text-label font-medium text-fg">
            {product.name}
            <Link
              href={movementsHref(params, { produto: undefined })}
              aria-label={`Tirar o filtro de ${product.name}`}
              className="grid size-7 place-items-center rounded-pill text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg"
            >
              <X className="size-3.5" aria-hidden />
            </Link>
          </p>
        ) : null}
        <CardSubtitle>
          <span className="tnum">{formatNumber(total)}</span> {total === 1 ? "movimentação" : "movimentações"}
          {filtered ? " com os filtros escolhidos" : ""}. Da mais recente para a mais antiga.
        </CardSubtitle>
      </div>
      {total > 0 ? <MovementExport params={params} /> : null}
    </div>
  )
}
