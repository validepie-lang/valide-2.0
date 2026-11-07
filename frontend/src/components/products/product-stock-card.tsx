import Link from "next/link"
import { PackagePlus, TriangleAlert } from "lucide-react"
import { StatusChip } from "@/components/ui/status-chip"
import { formatMoney, formatMoneyWhole, formatQuantity } from "@/lib/utils/format"
import { usableStockWarning } from "@/lib/utils/product-extras"
import type { Lot, Product } from "@/lib/types"

/**
 * Card "Estoque" do detalhe (issue 030), como o card "Stock" do Inventar
 * (Behance, 524 curtidas): a quantidade em destaque, a ação de ajustar logo
 * abaixo, e a quantidade separada, lá por depósito, aqui por lote.
 */
export function ProductStockCard({ product, lots }: { product: Product; lots: Lot[] }) {
  const stockValue = product.totalQuantity * product.acquisitionCost
  const belowMin = product.totalQuantity < product.minStock
  // Item 14 (issue 070): o vencido vai sair e não conta para o mínimo
  const usable = usableStockWarning({ ...product, lots })

  return (
    <section aria-labelledby="estoque" className="rounded-md border border-line bg-surface shadow-card">
      <div className="border-b border-line px-5 py-4 md:px-6">
        <h2 id="estoque" className="font-display text-section font-bold text-fg">
          Estoque
        </h2>
      </div>

      <div className="px-5 py-5 text-center md:px-6">
        <p className="text-label font-semibold text-fg-muted">Em estoque</p>
        <p className="mt-1 font-display text-[2.5rem] leading-none font-extrabold tracking-tight text-fg">
          {formatQuantity(product.totalQuantity, product.unit)}
        </p>
        <p className="mt-2 text-label text-fg-muted">
          {belowMin ? (
            <span className="font-semibold text-fg">Abaixo do mínimo, </span>
          ) : null}
          mínimo de {formatQuantity(product.minStock, product.unit)}
        </p>
        <Link
          href={`/estoque/${product.id}/entrada`}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
        >
          <PackagePlus className="size-4" aria-hidden />
          Registrar entrada
        </Link>
      </div>

      {usable ? (
        <p className="mx-5 mb-4 flex items-start gap-2 rounded-sm bg-sunken px-3 py-2.5 text-label text-fg md:mx-6">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
          {usable}
        </p>
      ) : null}

      {lots.length > 0 ? (
        <ul aria-label="Quantidade por lote" className="divide-y divide-line border-t border-line">
          {lots.map((lot) => (
            <li key={lot.id} className="flex items-center justify-between gap-3 px-5 py-3 md:px-6">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="text-body font-medium text-fg">{lot.code}</span>
                <StatusChip status={lot.status} size="sm" />
              </span>
              <span className="shrink-0 text-body text-fg tnum">{formatQuantity(lot.quantity, product.unit)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="flex items-baseline justify-between gap-4 border-t border-line px-5 py-4 md:px-6">
        <dt className="text-label text-fg-muted">Custo parado</dt>
        <dd className="text-right">
          <span className="block text-body font-semibold text-fg tnum" title={formatMoney(stockValue)}>
            {formatMoneyWhole(stockValue)}
          </span>
          <span className="block text-label text-fg-muted tnum">
            {formatMoney(product.acquisitionCost)} por unidade
          </span>
        </dd>
      </dl>
    </section>
  )
}
