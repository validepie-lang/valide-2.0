import { CheckCircle2 } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { QuickFillForm } from "@/components/products/quick-fill-form"
import { getPendingExpiryProducts } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"

export const metadata = { title: "Validades pendentes" }

/**
 * `?produto=` abre a fila nesse produto: "Informar validade" no detalhe do
 * produto leva para ele, não para o primeiro da fila. O resto segue na ordem.
 */
export default async function ValidadesPendentesPage({
  searchParams,
}: {
  searchParams: Promise<{ produto?: string }>
}) {
  const [{ produto }, { data: pending }, { company }] = await Promise.all([
    searchParams,
    getPendingExpiryProducts({ perPage: 100 }),
    getSession(),
  ])
  const requested = pending.find((p) => p.id === produto)
  const products = requested ? [requested, ...pending.filter((p) => p !== requested)] : pending

  return (
    <div>
      <PageHeader
        title="Validades pendentes"
        description="Um produto por vez, do maior valor parado ao menor."
        back={{ href: "/estoque", label: "Voltar ao estoque" }}
      />

      {products.length > 0 ? (
        <QuickFillForm products={products} soonThresholdDays={company.soonThresholdDays} />
      ) : (
        <Card className="mx-auto max-w-2xl">
          <EmptyState
            icon={CheckCircle2}
            title="Todos os produtos têm validade informada"
            description="Não há nada na fila. O painel já consegue acompanhar o estoque inteiro."
            action={<LinkButton href="/">Voltar ao painel</LinkButton>}
          />
        </Card>
      )}
    </div>
  )
}
