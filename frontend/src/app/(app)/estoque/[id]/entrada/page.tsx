import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { EntryForm } from "@/components/products/entry-form"
import { getProduct, getProductFacets } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"

export const metadata = { title: "Registrar entrada" }

/** Referências e escopo em docs/04-issues/028-registrar-entrada.md */
export default async function EntradaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, { company }, { suppliers }] = await Promise.all([
    getProduct(id),
    getSession(),
    getProductFacets(),
  ])
  if (!product) notFound()

  return (
    <div>
      <PageHeader
        title="Registrar entrada"
        description={
          <>
            {product.name} · {/* Código não quebra no hífen */}
            <span className="whitespace-nowrap">{product.sku}</span>
          </>
        }
        back={{ href: `/estoque/${product.id}`, label: "Voltar ao produto" }}
      />
      <EntryForm product={product} soonThresholdDays={company.soonThresholdDays} suppliers={suppliers} />
    </div>
  )
}
