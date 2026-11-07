"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { PER_PAGE_COOKIE, PER_PAGE_OPTIONS, type PerPage } from "@/lib/utils/per-page"

/** Um ano, como as colunas: é preferência de quem usa o computador */
const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * "Linhas por página" no rodapé da tabela (issue 068, item 7), do SaaS Data
 * Table (Behance). Trocar volta à primeira página: a página 4 de 25 linhas não
 * existe com 100.
 */
export function PerPageSelect({ value, firstPageHref }: { value: PerPage; firstPageHref: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <label className="inline-flex items-center gap-2 text-label text-fg-muted">
      Linhas por página
      <select
        value={value}
        aria-busy={pending}
        onChange={(event) => {
          document.cookie = `${PER_PAGE_COOKIE}=${event.target.value}; path=/; max-age=${ONE_YEAR}; samesite=lax`
          startTransition(() => {
            router.push(firstPageHref, { scroll: false })
            router.refresh()
          })
        }}
        className="h-11 rounded-pill border border-line bg-surface px-3 text-label font-medium text-fg tnum transition-colors hover:border-line-strong md:h-9"
      >
        {PER_PAGE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  )
}
