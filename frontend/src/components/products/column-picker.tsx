"use client"

import { useCallback, useId, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDismiss } from "@/lib/hooks/use-dismiss"
import { cn } from "@/lib/utils/cn"
import {
  COLUMNS_COOKIE,
  OPTIONAL_COLUMNS,
  type OptionalColumn,
} from "@/lib/utils/stock-columns"

/** Um ano. É preferência de quem usa o computador, não dado de sessão */
const ONE_YEAR = 60 * 60 * 24 * 365

function saveColumns(columns: OptionalColumn[]) {
  document.cookie = `${COLUMNS_COOKIE}=${columns.join(",")}; path=/; max-age=${ONE_YEAR}; samesite=lax`
}

/**
 * Liga e desliga as colunas opcionais do estoque.
 *
 * A escolha vai para um cookie e a página é desenhada de novo no servidor,
 * já com as colunas certas. Não é dado sensível: só nomes de coluna, que o
 * servidor valida antes de usar (`parseColumns`).
 */
export function ColumnPicker({ selected }: { selected: OptionalColumn[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  // A marcação muda na hora; a tabela chega quando o servidor desenhar de novo
  const [chosen, setChosen] = useState<OptionalColumn[]>(selected)
  const [pending, startTransition] = useTransition()
  const boxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])
  useDismiss({ open, onClose: close, containerRef: boxRef, triggerRef: buttonRef })

  function toggle(key: OptionalColumn, on: boolean) {
    const next = OPTIONAL_COLUMNS.map((c) => c.key).filter((k) =>
      k === key ? on : chosen.includes(k),
    )
    setChosen(next)
    saveColumns(next)
    startTransition(() => router.refresh())
  }

  return (
    <div ref={boxRef} className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(open && "bg-primary-soft text-fg")}
      >
        <Columns3 className="size-4" aria-hidden />
        Colunas
        {chosen.length > 0 ? <span className="tnum">({chosen.length})</span> : null}
      </Button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Colunas da tabela"
          aria-busy={pending}
          className="absolute right-0 z-40 mt-2 w-64 rounded-md border border-line bg-surface p-2 shadow-pop"
        >
          <p className="px-2 pt-1 pb-2 text-label text-fg-muted">
            Produto, validade, situação e quantidade aparecem sempre.
          </p>
          <ul>
            {OPTIONAL_COLUMNS.map((col) => {
              const id = `${panelId}-${col.key}`
              return (
                <li key={col.key}>
                  <label
                    htmlFor={id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 text-body text-fg hover:bg-primary-soft md:min-h-9"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={chosen.includes(col.key)}
                      onChange={(e) => toggle(col.key, e.target.checked)}
                      className="size-4 accent-primary"
                    />
                    {col.label}
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
