import { Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/utils/format"
import type { FolderQuery } from "@/lib/utils/folder-list"

/**
 * Busca da lista de pastas (issue 076, item 64, do Ventor "Category"). É um
 * formulário comum: a busca vai no endereço e mantém a ordem.
 */
export function FolderSearch({ query }: { query: FolderQuery }) {
  return (
    <form action="/estoque/pastas" role="search" className="relative w-full sm:max-w-xs">
      {query.ordem ? <input type="hidden" name="ordem" value={query.ordem} /> : null}
      {query.cargo ? <input type="hidden" name="cargo" value={query.cargo} /> : null}
      <label htmlFor="busca-pasta" className="sr-only">
        Buscar pasta pelo nome
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden
      />
      <input
        id="busca-pasta"
        name="busca"
        type="search"
        defaultValue={query.busca ?? ""}
        placeholder="Buscar pasta"
        className="h-11 w-full rounded-pill border border-line bg-surface pr-4 pl-10 text-body text-fg transition-colors placeholder:text-fg-muted hover:border-line-strong"
      />
    </form>
  )
}

/** A faixa das marcadas (item 66), como a do Estoque (issue 069) */
export function FolderBulkBar({
  count,
  onDelete,
  onClear,
}: {
  count: number
  onDelete: () => void
  onClear: () => void
}) {
  return (
    <div
      role="region"
      aria-label="Ações para as pastas marcadas"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line bg-primary-soft px-4 py-2.5 md:px-6"
    >
      <p className="mr-auto text-label font-semibold text-fg tnum" aria-live="polite">
        {formatNumber(count)} {count === 1 ? "pasta marcada" : "pastas marcadas"}
      </p>
      {/* Os dois juntos: no celular não quebram um de cada lado */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onDelete}>
          <Trash2 className="size-4" aria-hidden />
          Excluir
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="size-4" aria-hidden />
          Desmarcar
        </Button>
      </div>
    </div>
  )
}
