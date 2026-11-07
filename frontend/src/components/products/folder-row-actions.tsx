import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import type { FolderRow } from "@/components/products/folder-table"

const ACTION =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2.5 text-label font-medium text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg disabled:cursor-wait md:min-h-9"

export type RowHandlers = {
  onRename: (folder: FolderRow) => void
  onToggle: (folder: FolderRow) => void
  onDelete: (folder: FolderRow) => void
}

/**
 * Renomear, Desativar ou Ativar (issue 076, item 65) e Excluir no fim da
 * linha, como no Ventor "Category". O texto aparece da tela grande em diante.
 */
export function FolderRowActions({
  folder,
  busy,
  onRename,
  onToggle,
  onDelete,
}: { folder: FolderRow; busy: boolean } & RowHandlers) {
  const Toggle = folder.active ? EyeOff : Eye
  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <button type="button" onClick={() => onRename(folder)} className={ACTION}>
        <Pencil className="size-3.5" aria-hidden />
        <span className="sr-only lg:not-sr-only">Renomear</span>
        <span className="sr-only"> {folder.name}</span>
      </button>
      <button
        type="button"
        onClick={() => onToggle(folder)}
        disabled={busy}
        aria-busy={busy}
        // "Ativar" é mais curto que "Desativar": a largura fixa não deixa os botões andarem
        className={`${ACTION} lg:min-w-26 lg:justify-start`}
      >
        <Toggle className="size-3.5" aria-hidden />
        <span className="sr-only lg:not-sr-only">{folder.active ? "Desativar" : "Ativar"}</span>
        <span className="sr-only"> {folder.name}</span>
      </button>
      <button type="button" onClick={() => onDelete(folder)} className={ACTION}>
        <Trash2 className="size-3.5" aria-hidden />
        <span className="sr-only lg:not-sr-only">Excluir</span>
        <span className="sr-only"> {folder.name}</span>
      </button>
    </div>
  )
}

/** "Desativada" ao lado do nome: neutro, nunca verde ou vermelho (regra 9.1) */
export function InactiveBadge() {
  return (
    <span className="shrink-0 rounded-pill bg-sunken px-2 py-0.5 text-micro font-medium text-fg-muted">
      Desativada
    </span>
  )
}

const CHECK = "size-4 shrink-0 cursor-pointer accent-[var(--primary)]"

export function FolderCheckbox({
  folder,
  checked,
  onToggle,
}: {
  folder: FolderRow
  checked: boolean
  onToggle: (id: string) => void
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onToggle(folder.id)}
      aria-label={`Marcar ${folder.name}`}
      className={CHECK}
    />
  )
}

/** A caixa do cabeçalho: marca ou desmarca a página, meio-marcada quando é só parte */
export function FolderPageCheckbox({
  state,
  onToggle,
}: {
  state: "none" | "some" | "all"
  onToggle: () => void
}) {
  return (
    <input
      type="checkbox"
      checked={state === "all"}
      ref={(el) => {
        if (el) el.indeterminate = state === "some"
      }}
      onChange={onToggle}
      aria-label={state === "all" ? "Desmarcar as pastas desta página" : "Marcar as pastas desta página"}
      className={CHECK}
    />
  )
}
