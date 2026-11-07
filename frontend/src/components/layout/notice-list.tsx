"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { KIND_ICON } from "@/components/layout/notifications-menu"
import { FormFailure } from "@/components/ui/form-status"
import { markRead } from "@/lib/actions/notifications"
import { UNREACHABLE } from "@/lib/actions/result"
import { formatEventTime } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { Notification } from "@/lib/types"

/**
 * Todos os avisos, na página Avisos (issue 037), como a página de
 * notificações do HR Management Dashboard (Behance, 1.074 curtidas): título
 * com "Marcar todos como lidos" à direita; cada aviso com título, texto, hora
 * e o ponto de não lido; a ação logo abaixo do texto.
 *
 * Desde a issue 060 marcar como lido grava (PATCH /notifications/:id/read):
 * abrir um aviso marca o dele; "Marcar todos" marca os que faltam. A lista
 * muda na hora; se o servidor recusar o "Marcar todos", ela volta e diz por quê.
 */
/** Os filtros da lista (issue 050, item 58): não lidos, e um por tipo de aviso que existe */
const FILTERS: { id: string; label: string; match: (n: Notification, read: boolean) => boolean }[] = [
  { id: "todos", label: "Todos", match: () => true },
  { id: "nao-lidos", label: "Não lidos", match: (_, read) => !read },
  { id: "validade", label: "Validade", match: (n) => n.kind === "system" },
  { id: "minimo", label: "Estoque mínimo", match: (n) => n.kind === "min_stock" },
  { id: "equipe", label: "Equipe", match: (n) => n.kind === "user_change" },
  { id: "importacao", label: "Importação", match: (n) => n.kind === "import_done" },
]

export function NoticeList({ items }: { items: Notification[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState("todos")
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.read).map((i) => i.id)),
  )
  const [marking, setMarking] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const unread = items.filter((i) => !readIds.has(i.id)).length

  async function markAll() {
    if (marking) return
    const before = readIds
    const ids = items.filter((i) => !before.has(i.id)).map((i) => i.id)
    setReadIds(new Set(items.map((i) => i.id)))
    setMarking(true)
    setFailure(null)
    const result = await markRead(ids).catch(() => UNREACHABLE)
    setMarking(false)
    if (!result.ok) {
      setReadIds(before)
      return setFailure(result.message)
    }
    // O sino, no alto, conta de novo
    router.refresh()
  }
  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0]
  const shown = items.filter((i) => active.match(i, readIds.has(i.id)))

  return (
    <section
      aria-labelledby="todos-avisos"
      className="overflow-hidden rounded-md border border-line bg-surface shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
        <div>
          <h2 id="todos-avisos" className="font-display text-section font-bold text-fg">
            Todos os avisos
          </h2>
          <p className="mt-0.5 text-label text-fg-muted" aria-live="polite">
            {unread > 0 ? `${unread} ${unread === 1 ? "não lido" : "não lidos"}` : "Tudo lido"}
          </p>
        </div>
        {unread > 0 ? (
          <button
            type="button"
            onClick={() => void markAll()}
            className="inline-flex min-h-11 items-center text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
          >
            Marcar todos como lidos
          </button>
        ) : null}
      </div>

      {failure ? (
        <FormFailure
          message={failure}
          after="Os avisos continuam como não lidos."
          className="mx-5 mt-4 md:mx-6"
        />
      ) : null}

      {/* Filtros em pílula, como os chips do Estoque; o trilho rola no celular */}
      <div role="group" aria-label="Filtrar avisos" className="border-b border-line">
        <ul className="scroll-slim flex gap-2 overflow-x-auto px-5 py-3 md:px-6">
          {FILTERS.map((f) => {
            const count = items.filter((i) => f.match(i, readIds.has(i.id))).length
            const on = f.id === active.id
            return (
              <li key={f.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-pill border px-3.5 text-label font-semibold whitespace-nowrap transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-fg"
                      : "border-line bg-surface text-fg hover:border-line-strong",
                  )}
                >
                  {f.label}
                  <span className={cn("tnum", on ? "text-primary-fg" : "text-fg-muted")}>{count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {shown.length === 0 ? (
        <p className="px-5 py-6 text-body text-fg-muted md:px-6">
          {items.length === 0
            ? "Nenhum aviso por enquanto."
            : `Nenhum aviso em “${active.label}”. Os outros continuam em Todos.`}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((item) => {
            const Icon = KIND_ICON[item.kind]
            const isRead = readIds.has(item.id)
            return (
              <li
                key={item.id}
                className={cn("flex gap-3.5 px-5 py-4 md:px-6", !isRead && "bg-primary-soft/40")}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <p
                      className={cn(
                        "min-w-0 flex-1 text-body text-fg",
                        isRead ? "font-medium" : "font-semibold",
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-label text-fg-muted">
                      {formatEventTime(item.createdAt)}
                    </span>
                    {!isRead ? (
                      <span className="mt-1.5 size-2 shrink-0 rounded-pill bg-fg">
                        <span className="sr-only">Não lido</span>
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-label text-fg-muted">{item.body}</p>
                  {item.link ? (
                    <Link
                      href={item.link}
                      onClick={() => {
                        // Sai da página: se não gravar, o aviso só continua não lido
                        if (!isRead) void markRead([item.id])
                        setReadIds((s) => new Set(s).add(item.id))
                      }}
                      className="mt-2 inline-flex min-h-11 items-center gap-1 text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
                    >
                      Abrir
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
