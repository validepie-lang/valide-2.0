import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SearchX } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { StockTabs } from "@/components/products/stock-tabs"
import { StockHeader } from "@/components/products/stock-header"
import { FilterBar, buildHref, type StockSearchParams } from "@/components/products/filter-bar"
import { ProductTable } from "@/components/products/product-table"
import { EmptyStockState } from "@/components/products/empty-stock-state"
import { StockSelection } from "@/components/products/stock-selection"
import { ColumnPicker } from "@/components/products/column-picker"
import { StockPagination } from "@/components/products/stock-pagination"
import { PerPageSelect } from "@/components/products/per-page-select"
import { getFolders, getProductFacets, getProducts } from "@/lib/services/products"
import { getDashboard } from "@/lib/services/dashboard"
import { getSession } from "@/lib/services/session"
import { canEditProduct, demoRole } from "@/lib/utils/permissions"
import { folderChoices } from "@/lib/utils/folder-list"
import { COLUMNS_COOKIE, parseColumns } from "@/lib/utils/stock-columns"
import { PER_PAGE_COOKIE, PER_PAGE_OPTIONS, parsePerPage } from "@/lib/utils/per-page"
import { joinLabels, parsePage, parseSort, parseStatuses, retireHref, stockFilter } from "@/lib/utils/stock-params"

export const metadata = { title: "Estoque" }

/**
 * Estoque: o que eu tenho, e o que está perto de vencer (SPEC 5.2).
 *
 * A tabela é o nível 1. Ação primária é importar, porque é o caminho principal
 * de entrada de produto (import-strategy.md); adicionar um a um é secundário.
 *
 * Issue 029, a partir do SaaS Data Table e do Data table for inventory
 * (Behance): busca e filtros dentro do card da tabela, ordem no cabeçalho e
 * paginação no rodapé. Referências em docs/04-issues/029-estoque-referencias-behance.md.
 */
export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<StockSearchParams>
}) {
  // Desde a issue 071 o cadastro abre o produto novo; a confirmação mora lá
  const params = await searchParams
  const statuses = parseStatuses(params.status)
  const jar = await cookies()
  const columns = parseColumns(jar.get(COLUMNS_COOKIE)?.value)
  // Linhas por página (issue 068): preferência guardada como as colunas
  const perPage = parsePerPage(jar.get(PER_PAGE_COOKIE)?.value)
  const sort = parseSort(params.ordem)
  const page = parsePage(params.pagina)
  const filter = stockFilter(params)
  // "Retirar vencidos" com todos os N marcados (issue 069): quantos do recorte têm vencido
  const canHaveExpired = statuses.length === 0 || statuses.includes("expired")

  const [{ data: products, meta }, folders, facets, dashboard, { user }, expiredInFilter] = await Promise.all([
    getProducts({ ...filter, sort, page, perPage }),
    getFolders(),
    getProductFacets(),
    getDashboard(),
    getSession(),
    canHaveExpired
      ? getProducts({ ...filter, status: "expired", perPage: 1 }).then((r) => r.meta.total)
      : Promise.resolve(0),
  ])

  // Página além da última (link antigo, filtro que encolheu): vai para a última que existe
  if (products.length === 0 && meta.total > 0) {
    const lastPage = Math.ceil(meta.total / meta.perPage)
    redirect(buildHref(params, { pagina: lastPage > 1 ? String(lastPage) : undefined }))
  }


  const role = demoRole(params.cargo, user.role)
  const table = (
    <ProductTable
      products={products}
      columns={columns}
      sort={sort}
      sortHref={(next) => buildHref(params, { ordem: next === "expiry_asc" ? undefined : next })}
    />
  )

  const isFiltered = Boolean(
    statuses.length || filter.source || params.pasta || params.fornecedor || params.marca || params.busca,
  )

  return (
    <div>
      <StockHeader counts={dashboard.counts} />
      <StockTabs className="mt-5 mb-6" />

      {/* Busca, filtros e tabela no mesmo card, como no SaaS Data Table (Behance) */}
      <Card className="p-0 md:p-0">
        <div className="border-b border-line px-4 py-4 md:px-6">
          <FilterBar
            params={params}
            activeStatuses={statuses}
            // Pasta desativada some do filtro, a não ser a que já está filtrada (issue 076)
            folders={folderChoices(folders, params.pasta)}
            facets={facets}
            counts={dashboard.counts}
            canManageFolders={role === "admin"}
            // Desde a 068 o celular também vê a tabela, então escolhe as colunas
            aside={<ColumnPicker selected={columns} />}
          />
        </div>

        {/* A tabela vai de borda a borda do card, com o cabeçalho cinza; o vazio tem margem */}
        <div className={products.length > 0 ? undefined : "px-4 md:px-6"}>
          {products.length > 0 ? (
            // Marcar é para mover de pasta e retirar vencidos: Administrador e Farmacêutico (issue 070, item 18).
            // Mudar filtro, ordem ou página desmarca tudo: a chave remonta a seleção
            canEditProduct(role) ? (
              <StockSelection
                key={buildHref(params, { pagina: params.pagina })}
                pageIds={products.map((p) => p.id)}
                expiredIds={products.filter((p) => p.lots.some((l) => l.status === "expired")).map((p) => p.id)}
                total={meta.total}
                filter={filter}
                expiredInFilter={expiredInFilter}
                retireFilterHref={retireHref(params)}
                folders={folderChoices(folders)}
              >
                {table}
              </StockSelection>
            ) : (
              table
            )
          ) : isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="Nenhum resultado para essa busca"
              description="Tente outro termo ou limpe os filtros para ver o estoque inteiro."
              action={<LinkButton href="/estoque">Limpar filtros</LinkButton>}
            />
          ) : (
            <EmptyStockState />
          )}
        </div>

        {products.length > 0 ? (
          <StockPagination
            page={meta.page}
            perPage={meta.perPage}
            total={meta.total}
            hrefFor={(n) => buildHref(params, { pagina: n > 1 ? String(n) : undefined })}
            context={`${statuses.length ? ` com situação ${joinLabels(statuses)}` : ""}${params.busca ? ` para "${params.busca}"` : ""}`}
            sizeControl={
              // Só aparece quando há mais produtos que a menor opção
              meta.total > PER_PAGE_OPTIONS[0] ? (
                <PerPageSelect value={perPage} firstPageHref={buildHref(params, {})} />
              ) : null
            }
          />
        ) : null}
      </Card>
    </div>
  )
}
