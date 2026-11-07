import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatNumber } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"

/**
 * Rodapé da tabela (issue 029): "Mostrando 1–25 de 80 produtos" à esquerda e
 * as páginas à direita, como no SaaS Data Table e no Data table for inventory
 * (Behance). Até aqui o estoque mostrava 40 e escondia o resto.
 */
export function StockPagination({
  page,
  perPage,
  total,
  hrefFor,
  context,
  noun = ["produto", "produtos"],
  label = "Páginas do estoque",
  sizeControl,
}: {
  page: number
  perPage: number
  total: number
  hrefFor: (page: number) => string
  /** o recorte, depois de "produtos": ' com situação A vencer para "dipirona"' */
  context?: string
  /** o que se conta, no singular e no plural (Movimentações usa "movimentação") */
  noun?: [string, string]
  /** nome da navegação para leitor de tela */
  label?: string
  /** "Linhas por página" (issue 068), antes das páginas */
  sizeControl?: React.ReactNode
}) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  const first = total === 0 ? 0 : (page - 1) * perPage + 1
  const last = Math.min(total, page * perPage)

  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
      <p className="text-label text-fg-muted" aria-live="polite">
        Mostrando{" "}
        <span className="font-medium text-fg tnum">
          {formatNumber(first)}–{formatNumber(last)}
        </span>{" "}
        de <span className="tnum">{formatNumber(total)}</span> {total === 1 ? noun[0] : noun[1]}
        {context}
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {sizeControl}
        {pages > 1 ? (
          <nav aria-label={label}>
            <ul className="flex items-center gap-1">
              <li>
                <PageLink href={page > 1 ? hrefFor(page - 1) : undefined} label="Página anterior">
                  <ChevronLeft className="size-4" aria-hidden />
                </PageLink>
              </li>
              {pageWindow(page, pages).map((n, i) =>
                n === null ? (
                  <li key={`gap-${i}`} className="px-1 text-label text-fg-muted" aria-hidden>
                    …
                  </li>
                ) : (
                  <li key={n}>
                    <PageLink href={hrefFor(n)} current={n === page} label={`Página ${n}`}>
                      <span className="tnum">{n}</span>
                    </PageLink>
                  </li>
                ),
              )}
              <li>
                <PageLink href={page < pages ? hrefFor(page + 1) : undefined} label="Próxima página">
                  <ChevronRight className="size-4" aria-hidden />
                </PageLink>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  )
}

/** 1 … 4 5 6 … 12: a primeira, a última e as vizinhas da atual */
function pageWindow(page: number, pages: number): (number | null)[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))
  const sorted = [...wanted].sort((a, b) => a - b)
  const out: (number | null)[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(null)
    out.push(n)
  })
  return out
}

function PageLink({
  href,
  current,
  label,
  children,
}: {
  href?: string
  current?: boolean
  label: string
  children: React.ReactNode
}) {
  const base = "inline-flex size-11 items-center justify-center rounded-md text-label font-semibold md:size-9"
  if (!href) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(base, "text-fg-disabled")}>
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(
        base,
        current
          ? "bg-primary text-primary-fg"
          : "border border-line text-fg transition-colors hover:border-line-strong hover:bg-primary-soft",
      )}
    >
      {children}
    </Link>
  )
}
