import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { DiscardBatch, type ExpiredLotRow } from "@/components/products/discard-batch"
import { DiscardPrintSheet } from "@/components/products/discard-print-sheet"
import { PrintButton } from "@/components/ui/print-button"
import { calendarToday } from "@/lib/utils/calendar"
import { formatDate } from "@/lib/utils/format"
import { getProducts } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"
import { stockFilter, type StockQuery } from "@/lib/utils/stock-params"
import { canDiscard, demoRole } from "@/lib/utils/permissions"

export const metadata = { title: "Retirar vencidos" }

/**
 * Todos os lotes vencidos numa lista só, para retirar da prateleira e
 * registrar o descarte de uma vez (issue 035). A Home manda "retirar da
 * prateleira", e até aqui a baixa era produto a produto.
 */
export default async function RetirarVencidosPage({
  searchParams,
}: {
  searchParams: Promise<StockQuery & { cargo?: string; produtos?: string }>
}) {
  const params = await searchParams
  const { cargo } = params
  // Vindo do Estoque com produtos marcados (issue 069): só eles, ou o recorte da tela
  const only = params.produtos ? new Set(params.produtos.split(",").filter(Boolean)) : null
  const narrowed = Boolean(
    only || params.pasta || params.origem || params.fornecedor || params.marca || params.busca,
  )
  const [{ user, company }, { data: found }] = await Promise.all([
    getSession(),
    getProducts({ ...stockFilter(params), status: "expired", sort: "expiry_asc", perPage: 200 }),
  ])
  const products = only ? found.filter((p) => only.has(p.id)) : found

  const rows: ExpiredLotRow[] = products
    .flatMap((p) =>
      p.lots
        .filter((lot) => lot.status === "expired")
        .map((lot) => ({
          lotId: lot.id,
          lotCode: lot.code,
          productId: p.id,
          productName: p.name,
          expiresAt: lot.expiresAt,
          quantity: lot.quantity,
          unit: p.unit,
          unitCost: p.acquisitionCost,
        })),
    )
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))

  return (
    <div>
      <PageHeader
        title="Retirar vencidos"
        description={
          narrowed ? (
            <>
              Só os lotes vencidos dos produtos que você marcou no estoque.{" "}
              <Link
                href="/estoque/retirar-vencidos"
                className="font-medium text-fg underline underline-offset-4"
              >
                Ver todos os vencidos
              </Link>
            </>
          ) : (
            "Todos os lotes vencidos, do que venceu há mais tempo ao mais recente. Desmarque o que não está mais na loja."
          )
        }
        back={
          narrowed
            ? { href: "/estoque", label: "Voltar ao estoque" }
            : { href: "/", label: "Voltar ao painel" }
        }
        className="print:hidden"
        // A folha para percorrer as gôndolas (issue 048, item 48)
        actions={rows.length > 0 ? <PrintButton /> : undefined}
      />
      {rows.length > 0 ? (
        <>
          <div className="print:hidden">
            <DiscardBatch rows={rows} canDiscard={canDiscard(demoRole(cargo, user.role))} />
          </div>
          <DiscardPrintSheet
            rows={rows}
            pharmacy={company.tradeName}
            today={formatDate(calendarToday().toISOString())}
          />
        </>
      ) : (
        <Card className="max-w-2xl">
          <EmptyState
            align="start"
            icon={CheckCircle2}
            title="Nenhum lote vencido"
            description="Não há nada para retirar da prateleira hoje."
            action={<LinkButton href="/">Voltar ao painel</LinkButton>}
          />
        </Card>
      )}
    </div>
  )
}
