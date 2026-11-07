import Link from "next/link"
import { PackageSearch } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { MovementsTable } from "@/components/products/movements-table"
import { ProductChanges } from "@/components/products/product-changes"
import { CardHead } from "@/components/products/product-overview"
import type { Movement, Product, ProductChange } from "@/lib/types"

/**
 * Aba "Histórico" do produto (issue 030; saiu de `page.tsx` na 070): as
 * movimentações e, desde a 070 (item 15), as alterações do cadastro.
 */
export function ProductHistoryTab({
  product,
  movements,
  changes,
}: {
  product: Product
  movements: Movement[]
  changes: ProductChange[]
}) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <section aria-labelledby="historico">
        <Card className="p-0 md:p-0">
          <CardHead id="historico" title="Histórico de movimentação" />
          {movements.length > 0 ? (
            <div className="px-4 py-1 md:px-6 md:py-2">
              <MovementsTable movements={movements} showProduct={false} />
              {/* O mesmo histórico com filtros e todas as páginas (issue 050, item 78) */}
              <Link
                href={`/estoque/movimentacoes?produto=${product.id}`}
                className="mt-2 mb-3 inline-flex min-h-11 items-center text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
              >
                Ver em Movimentações, com filtros
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="Nenhuma movimentação ainda"
              description="Quando alguém registrar uma entrada ou uma saída deste produto, ela aparece aqui."
            />
          )}
        </Card>
      </section>
      <section aria-labelledby="alteracoes">
        <Card className="p-0 md:p-0">
          <CardHead id="alteracoes" title="Alterações do cadastro" />
          <ProductChanges changes={changes} unit={product.unit} />
        </Card>
      </section>
    </div>
  )
}
