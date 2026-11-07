import Link from "next/link"
import { Search, X } from "lucide-react"
import { StatusDot } from "@/components/ui/status-chip"
import { MoreFilters } from "@/components/products/more-filters"
import { STATUS_LABEL, STATUS_ORDER, type ExpiryStatus } from "@/lib/utils/expiry"
import { cn } from "@/lib/utils/cn"
import type { DashboardCounts, Folder, ProductFacets } from "@/lib/types"

export type StockSearchParams = {
  /** um estado ou vários, separados por vírgula: expired,soon */
  status?: string
  pasta?: string
  origem?: string
  fornecedor?: string
  marca?: string
  busca?: string
  /** ordem da tabela, pelo cabeçalho (issue 029) */
  ordem?: string
  /** página, a partir de 1 */
  pagina?: string
  /** cargo de demonstração (`demoRole`), até a sessão real existir */
  cargo?: string
}

/**
 * Monta a URL preservando os outros filtros. Filtro vive na URL, não em estado.
 * Mudar filtro, busca ou ordem volta à página 1: a página 3 de outro recorte
 * pode nem existir.
 */
export function buildHref(current: StockSearchParams, patch: StockSearchParams): string {
  const next: StockSearchParams = { ...current, ...patch }
  if (!("pagina" in patch)) delete next.pagina
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value)
  }
  const query = params.toString()
  return query ? `/estoque?${query}` : "/estoque"
}

/**
 * Faixa de filtro do estoque (SPEC 5.2).
 *
 * Na primeira linha, busca, "Mais filtros" e limpar. Na segunda, os quatro
 * estados, que são o filtro principal da tela. Pasta, fornecedor, marca e
 * origem ficam recolhidos em "Mais filtros": até 08/10 a linha de chips de
 * pasta competia com a de situação.
 */
export function FilterBar({
  params,
  activeStatuses,
  folders,
  facets,
  counts,
  aside,
  canManageFolders,
}: {
  params: StockSearchParams
  /** os estados já validados da URL */
  activeStatuses: ExpiryStatus[]
  folders: Folder[]
  facets: ProductFacets
  counts: DashboardCounts
  /** à direita da primeira linha, como "Export" no SaaS Data Table (Behance): aqui, "Colunas" */
  aside?: React.ReactNode
  canManageFolders?: boolean
}) {
  const hasFilter = Boolean(
    params.status || params.pasta || params.origem || params.fornecedor || params.marca || params.busca,
  )
  const active = new Set(activeStatuses)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form action="/estoque" role="search" className="relative flex-1 sm:max-w-md">
          {/* A busca mantém os outros filtros */}
          {(["status", "pasta", "origem", "fornecedor", "marca", "ordem"] as const).map((key) =>
            params[key] ? <input key={key} type="hidden" name={key} value={params[key]} /> : null,
          )}
          <label htmlFor="busca-estoque" className="sr-only">
            Buscar produto por nome, código interno ou código de barras
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-muted"
            aria-hidden
          />
          <input
            id="busca-estoque"
            name="busca"
            type="search"
            defaultValue={params.busca ?? ""}
            placeholder="Nome, código interno ou código de barras"
            className="h-11 w-full rounded-pill border border-line bg-surface pr-4 pl-10 text-body text-fg transition-colors placeholder:text-fg-muted hover:border-line-strong"
          />
        </form>

        <div className="flex flex-1 items-center gap-3">
          <MoreFilters params={params} folders={folders} facets={facets} canManageFolders={canManageFolders} />
          {hasFilter ? (
            <Link
              href={params.ordem ? `/estoque?ordem=${params.ordem}` : "/estoque"}
              className="inline-flex min-h-11 items-center gap-1 text-label font-medium text-fg-muted transition-colors hover:text-fg"
            >
              <X className="size-3.5" aria-hidden />
              Limpar filtros
            </Link>
          ) : null}
          {aside ? <div className="ml-auto">{aside}</div> : null}
        </div>
      </div>

      {/* O trilho rola, a página não. Chip nunca quebra para uma segunda linha */}
      <nav aria-label="Filtrar por situação" className="-mx-4 md:mx-0">
        <ul className="scroll-slim flex gap-2 overflow-x-auto px-4 pb-1 md:px-0">
          <li className="shrink-0">
            <Chip href={buildHref(params, { status: undefined })} active={active.size === 0}>
              Todos
            </Chip>
          </li>
          {STATUS_ORDER.map((status) => (
            <li key={status} className="shrink-0">
              <Chip href={buildHref(params, { status })} active={active.has(status)}>
                <StatusDot status={status} />
                {STATUS_LABEL[status]}
                <span className="text-fg-muted tnum">{counts[status]}</span>
              </Chip>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/**
 * Chip de filtro ativo usa a cor de ação. Cor de status nunca vira estado de interface.
 * Também usado em Movimentações (issue 041).
 */
export function Chip({
  href,
  active,
  children,
  className,
}: {
  href: string
  active: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        // Sem sombra: os chips moram dentro do card da tabela desde a 029
        "inline-flex h-10 items-center gap-2 rounded-pill border px-4 text-label font-semibold whitespace-nowrap transition-colors",
        active
          ? "border-primary bg-primary text-primary-fg [&_.tnum]:text-primary-fg"
          : "border-line bg-surface text-fg hover:border-line-strong [&_.tnum]:text-fg-muted",
        className,
      )}
    >
      {children}
    </Link>
  )
}
