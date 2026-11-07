import { CalendarPlus } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { LotSituation } from "@/components/products/lot-situation"
import { LotsTable } from "@/components/products/lots-table"
import { ProductStockCard } from "@/components/products/product-stock-card"
import { ProductFactsCard } from "@/components/products/product-facts-card"
import { ProductPhoto } from "@/components/products/product-photo"
import type { Lot, Product } from "@/lib/types"

/**
 * Aba "Visão geral" do produto (issue 030; saiu de `page.tsx` na 070). Desde
 * a 070 a foto fica no alto da coluna da direita, acima do cartão Estoque,
 * como no Inventar.
 */
export function ProductOverview({
  product,
  lots,
  canEdit,
}: {
  product: Product
  lots: Lot[]
  canEdit: boolean
}) {
  return (
    // Grade explícita: no celular a ordem é situação, lotes, estoque e ficha
    // (o estoque é nível 2, a ficha nível 3); no desktop o estoque sobe para
    // a coluna da direita, ao lado dos três
    // A terceira linha (a ficha) fica com a sobra da coluna da direita, que desde a 070
    // tem a foto: sem isso a grade abria vãos entre a situação, os lotes e a ficha
    <div className="grid items-start gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto_1fr] lg:gap-6">
      <div className="min-w-0 lg:col-span-8 lg:row-start-1">
        <LotSituation status={product.nearestExpiryStatus} nearest={lots[0] ?? null} unit={product.unit} />
      </div>
      <div className="min-w-0 lg:col-span-8 lg:row-start-2">
        <section aria-labelledby="lotes">
          <Card className="p-0 md:p-0">
            <CardHead id="lotes" title="Lotes" />
            {lots.length > 0 ? (
              <div className="px-4 py-1 md:px-6 md:py-2">
                <LotsTable lots={lots} unit={product.unit} />
              </div>
            ) : (
              <EmptyState
                icon={CalendarPlus}
                title="Este produto ainda não tem validade informada"
                description="Ele veio da importação com estoque, mas sem lote. Informe o lote e a data para o painel passar a acompanhar."
                action={
                  <LinkButton href={`/estoque/validades-pendentes?produto=${product.id}`} variant="secondary">
                    Informar validade
                  </LinkButton>
                }
              />
            )}
          </Card>
        </section>
      </div>
      <div className="min-w-0 lg:col-span-4 lg:col-start-9 lg:row-span-3 lg:row-start-1">
        <div className="flex flex-col gap-5 lg:gap-6">
          <ProductPhoto
            productId={product.id}
            productName={product.name}
            photoUrl={product.photoUrl}
            canEdit={canEdit}
          />
          <ProductStockCard product={product} lots={lots} />
        </div>
      </div>
      {/* Embaixo do conteúdo principal, como o "Basic information" do Inventar */}
      <div className="min-w-0 lg:col-span-8 lg:row-start-3">
        <ProductFactsCard product={product} />
      </div>
    </div>
  )
}

/** Cabeçalho de card da direção A: título em font-display e um fio embaixo */
export function CardHead({ id, title }: { id: string; title: string }) {
  return (
    <div className="border-b border-line px-5 py-4 md:px-6">
      <h2 id={id} className="font-display text-section font-bold text-fg">
        {title}
      </h2>
    </div>
  )
}
