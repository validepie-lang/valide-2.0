"use client"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { FolderInput, PackageX, X } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { SavedNote } from "@/components/ui/form-status"
import { MoveFolderDialog } from "@/components/products/move-folder-dialog"
import type { StockFilter } from "@/lib/services/product-folders"
import { markedLabel, moveSummary, pageCheckState } from "@/lib/utils/stock-selection"
import type { Folder } from "@/lib/types"

type Selection = {
  selected: ReadonlySet<string>
  pageIds: string[]
  toggle: (id: string) => void
  togglePage: () => void
}

const SelectionContext = createContext<Selection | null>(null)

const CHECK = "size-4 shrink-0 cursor-pointer accent-[var(--primary)]"

/**
 * Marcar produtos no Estoque e agir em vários (issue 069, itens 8, 46 e 68),
 * do SaaS Data Table e do Data Table UX/UI (Behance). A tabela continua no
 * servidor; as caixas leem a seleção daqui. A página remonta este componente
 * a cada filtro, ordem ou página (`key`), e a seleção recomeça.
 */
export function StockSelection({
  pageIds,
  expiredIds,
  total,
  filter,
  expiredInFilter,
  retireFilterHref,
  folders,
  children,
}: {
  pageIds: string[]
  /** os produtos da página que têm lote vencido */
  expiredIds: string[]
  /** quantos produtos há no recorte inteiro */
  total: number
  filter: StockFilter
  /** quantos produtos do recorte inteiro têm lote vencido */
  expiredInFilter: number
  /** "Retirar vencidos" quando todos os N estão marcados: o recorte vai junto */
  retireFilterHref: string
  folders: Folder[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [all, setAll] = useState(false)
  const [moving, setMoving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const pageState = pageCheckState(pageIds, selected)
  const count = all ? total : selected.size
  const expiredMarked = all ? expiredInFilter : expiredIds.filter((id) => selected.has(id)).length
  const retireHref = all
    ? retireFilterHref
    : `/estoque/retirar-vencidos?produtos=${expiredIds.filter((id) => selected.has(id)).join(",")}`

  function change(next: Set<string>) {
    setAll(false)
    setNotice(null)
    setSelected(next)
  }

  const value: Selection = {
    selected,
    pageIds,
    toggle: (id) => {
      const next = new Set(selected)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      change(next)
    },
    togglePage: () => change(pageState === "all" ? new Set() : new Set(pageIds)),
  }

  return (
    <SelectionContext.Provider value={value}>
      <SavedNote message={notice} className={notice ? "px-4 py-3 md:px-6" : "sr-only"} />

      {count > 0 ? (
        <div
          role="region"
          aria-label="Ações para os produtos marcados"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line bg-primary-soft px-4 py-2.5 md:px-6"
        >
          <p className="mr-auto text-label font-semibold text-fg tnum" aria-live="polite">
            {markedLabel(count)}
          </p>
          <Button variant="secondary" size="sm" onClick={() => setMoving(true)}>
            <FolderInput className="size-4" aria-hidden />
            Mover de pasta
          </Button>
          {expiredMarked > 0 ? (
            <LinkButton href={retireHref} variant="secondary" size="sm">
              <PackageX className="size-4" aria-hidden />
              Retirar vencidos
            </LinkButton>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => change(new Set())}>
            <X className="size-4" aria-hidden />
            Desmarcar
          </Button>
        </div>
      ) : null}

      {/* Item 46: a página toda marcada e há mais no recorte (Data Table UX/UI) */}
      {pageState === "all" && total > pageIds.length ? (
        <p className="border-b border-line px-4 py-2.5 text-center text-label text-fg md:px-6">
          {all
            ? `Os ${total.toLocaleString("pt-BR")} produtos estão marcados. `
            : `Os ${pageIds.length} desta página estão marcados. `}
          <button
            type="button"
            onClick={() => setAll(!all)}
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            {all ? "Marcar só esta página" : `Marcar todos os ${total.toLocaleString("pt-BR")}`}
          </button>
        </p>
      ) : null}

      {children}

      <MoveFolderDialog
        open={moving}
        count={count}
        target={all ? { filter } : { ids: [...selected] }}
        folders={folders}
        onClose={() => setMoving(false)}
        onMoved={(result) => {
          setMoving(false)
          change(new Set())
          setNotice(moveSummary(result.moved, result.folderName))
          router.refresh()
        }}
      />
    </SelectionContext.Provider>
  )
}

/** A caixa de cada linha, dentro da coluna do produto */
export function RowCheckbox({ id, name }: { id: string; name: string }) {
  const selection = useContext(SelectionContext)
  if (!selection) return null
  return (
    <input
      type="checkbox"
      checked={selection.selected.has(id)}
      onChange={() => selection.toggle(id)}
      aria-label={`Marcar ${name}`}
      className={`${CHECK} self-center`}
    />
  )
}

/** A caixa do cabeçalho: marca ou desmarca a página, meio-marcada quando é só parte */
export function PageCheckbox() {
  const selection = useContext(SelectionContext)
  if (!selection) return null
  const state = pageCheckState(selection.pageIds, selection.selected)
  return (
    <input
      type="checkbox"
      checked={state === "all"}
      ref={(el) => {
        if (el) el.indeterminate = state === "some"
      }}
      onChange={selection.togglePage}
      aria-label={state === "all" ? "Desmarcar os produtos desta página" : "Marcar os produtos desta página"}
      className={CHECK}
    />
  )
}
