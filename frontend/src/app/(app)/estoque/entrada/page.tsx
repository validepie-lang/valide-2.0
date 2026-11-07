import Link from "next/link"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { Card } from "@/components/ui/card"
import { EntryForm } from "@/components/products/entry-form"
import { EntrySearch } from "@/components/products/entry-search"
import { EntryToday } from "@/components/products/entry-today"
import { ScanSignal } from "@/components/products/scan-signal"
import { RegisteredBanner, parseRegistered } from "@/components/products/registered-banner"
import { getMovements } from "@/lib/services/movements"
import { getProduct, getProductFacets, getProducts } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"
import { calendarToday } from "@/lib/utils/calendar"
import { formatQuantity } from "@/lib/utils/format"

export const metadata = { title: "Registrar entrada" }

/** Quantos resultados mostrar: quem bipou quer um, quem escreveu o nome escolhe entre poucos */
const MAX_RESULTS = 8

/**
 * Entrada geral (issue 042): registrar o lote que chegou sem abrir o produto
 * antes. Passo 1 busca ou lê o código; passo 2 é o formulário da entrada pelo
 * produto (028). Referências em docs/04-issues/042-entrada-geral.md.
 */
export default async function EntradaGeralPage({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string
    produto?: string
    registrado?: string
    de?: string
    lote?: string
    qtd?: string
    /** o código lido que abriu o produto (issue 074): bipa ao chegar */
    lido?: string
    /** o nome que achou um produto só e o abriu direto (issue 074, item 83) */
    achado?: string
  }>
}) {
  const query = await searchParams
  const { busca, produto } = query
  const term = busca?.trim()

  const header = (
    <PageHeader
      title="Registrar entrada"
      description="O lote que chegou: primeiro o produto, depois o lote, a validade e a quantidade."
      back={{ href: "/estoque/movimentacoes", label: "Voltar às movimentações" }}
    />
  )

  if (produto) {
    const [product, { company }, { suppliers }] = await Promise.all([
      getProduct(produto),
      getSession(),
      getProductFacets(),
    ])
    if (product) {
      return (
        <div>
          {header}
          {query.lido || query.achado ? (
            <ScanSignal kind="found" signalKey={`${product.id}-${query.lido ?? query.achado}`} />
          ) : null}
          <Card className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {/* Aberto sozinho pelo nome (item 83): diz por quê, para quem esperava uma lista */}
              <p className="text-label text-fg-muted">
                {query.achado ? `Único produto para “${query.achado}”` : "Produto"}
              </p>
              <p className="mt-0.5 font-display text-section font-bold text-fg">{product.name}</p>
              <p className="mt-0.5 text-label text-fg-muted">
                <span className="whitespace-nowrap">{product.sku}</span>
                {product.barcode ? <span className="whitespace-nowrap"> · {product.barcode}</span> : null}
                {" · "}tem <span className="tnum">{formatQuantity(product.totalQuantity, product.unit)}</span>
              </p>
            </div>
            <Link
              href="/estoque/entrada"
              className="inline-flex min-h-11 shrink-0 items-center self-start text-label font-medium text-fg underline-offset-4 hover:underline sm:self-center"
            >
              Trocar produto
            </Link>
          </Card>
          <EntryForm
            product={product}
            soonThresholdDays={company.soonThresholdDays}
            backHref="/estoque/entrada"
            focusLot
            returnTo="entry"
            suppliers={suppliers}
          />
        </div>
      )
    }
  }

  let results = null
  if (term) {
    const { data } = await getProducts({ search: term, perPage: MAX_RESULTS })
    // Código exato (o que o leitor manda) abre o produto sem passar pela lista
    const exact = data.find((p) => p.barcode === term || p.sku.toLowerCase() === term.toLowerCase())
    if (exact) redirect(`/estoque/entrada?produto=${exact.id}&lido=${encodeURIComponent(term)}`)
    // Pelo nome, um resultado só também abre (issue 074, item 83); a tela do produto diz que foi o único
    if (data.length === 1)
      redirect(`/estoque/entrada?produto=${data[0].id}&achado=${encodeURIComponent(term)}`)
    results = data
  }

  // O que já entrou hoje pelas mãos de quem está usando (issue 074, item 81)
  const { user } = await getSession()
  const today = calendarToday().toISOString().slice(0, 10)
  const conferred = await getMovements({ type: "in", userId: user.id, from: today, to: today, perPage: 8 })

  // Volta da entrada gravada (issue 054): a confirmação e a busca pronta para o próximo produto
  const registered = parseRegistered(query)
  const registeredProduct = registered && query.de ? await getProduct(query.de) : null

  return (
    <div>
      {header}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {registered && registeredProduct ? (
            <RegisteredBanner
              registered={registered}
              unit={registeredProduct.unit}
              closeHref="/estoque/entrada"
              product={{ name: registeredProduct.name, href: `/estoque/${registeredProduct.id}` }}
            />
          ) : null}
          <EntrySearch term={term} results={results} />
        </div>
        <EntryToday
          movements={conferred.data}
          total={conferred.meta.total}
          allHref={`/estoque/movimentacoes?tipo=entrada&periodo=hoje&pessoa=${user.id}`}
        />
      </div>
    </div>
  )
}
