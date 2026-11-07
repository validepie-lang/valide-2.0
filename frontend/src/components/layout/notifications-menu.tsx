"use client"

import { useCallback, useId, useRef, useState } from "react"
import Link from "next/link"
import { markRead } from "@/lib/actions/notifications"
import { useDismiss } from "@/lib/hooks/use-dismiss"
import { Bell, FileSpreadsheet, TriangleAlert, UserCog, type LucideIcon } from "lucide-react"
import { formatEventTime } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { Notification } from "@/lib/types"

/** O ícone diz de onde veio o aviso. Sem círculo colorido: reconhecer, não enfeitar */
export const KIND_ICON: Record<Notification["kind"], LucideIcon> = {
  min_stock: TriangleAlert,
  user_change: UserCog,
  system: Bell,
  import_done: FileSpreadsheet,
}

/**
 * Sino com os avisos, em todas as telas. Até 08/10 os avisos eram um painel
 * fixo na Home, disputando espaço com o que a tela precisa responder.
 *
 * Painel não modal com nome (`role="dialog"`), não `role="menu"`: um aviso tem
 * título, texto e hora, e `menuitem` lê só um rótulo curto. Fecha com Esc e
 * clique fora, e devolve o foco ao sino, como o menu da conta.
 *
 * Desde a issue 060, abrir um aviso marca como lido (PATCH
 * /notifications/:id/read), e o número do sino desconta na hora.
 */
export function NotificationsMenu({ items }: { items: Notification[] }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const titleId = useId()
  // Lidos agora, antes de o servidor mandar a lista de novo
  const [readNow, setReadNow] = useState<Set<string>>(() => new Set())
  const isRead = (item: Notification) => item.read || readNow.has(item.id)
  const unread = items.filter((i) => !isRead(i)).length

  function openNotice(item: Notification) {
    setOpen(false)
    if (isRead(item)) return
    setReadNow((s) => new Set(s).add(item.id))
    void markRead([item.id])
  }

  const close = useCallback(() => setOpen(false), [])
  useDismiss({ open, onClose: close, containerRef: boxRef, triggerRef: buttonRef })

  return (
    <div ref={boxRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread > 0 ? `Avisos, ${unread} não lidos` : "Avisos"}
        className={cn(
          "relative grid size-11 place-items-center rounded-pill border border-line bg-surface md:size-10",
          "text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg",
          open && "bg-primary-soft text-fg",
        )}
      >
        <Bell className="size-[18px]" aria-hidden />
        {unread > 0 ? (
          // Contador neutro: o acento fica para foco e item ativo
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-pill bg-fg px-1 text-[10px] leading-none font-semibold text-surface tnum"
          >
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          className="fixed inset-x-4 top-16 z-50 rounded-md border border-line bg-surface shadow-pop sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3">
            <h2 id={titleId} className="text-body font-semibold text-fg">
              Avisos
            </h2>
            {unread > 0 ? (
              <span className="text-label text-fg-muted tnum">
                {unread} {unread === 1 ? "não lido" : "não lidos"}
              </span>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-body text-fg-muted">Nenhum aviso por enquanto.</p>
          ) : (
            <ul className="scroll-slim max-h-[min(28rem,70vh)] divide-y divide-line overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <NoticeRow item={item} read={isRead(item)} onNavigate={() => openNotice(item)} />
                </li>
              ))}
            </ul>
          )}
          {/* A página com todos e o estoque abaixo do mínimo (issue 037) */}
          <div className="flex border-t border-line">
            <Link
              href="/avisos"
              onClick={() => setOpen(false)}
              className="flex min-h-11 flex-1 items-center justify-center px-4 py-3 text-label font-semibold text-fg transition-colors hover:bg-primary-soft"
            >
              Ver todos os avisos
            </Link>
            {/* O caminho para escolher o que avisa (issue 044), como no HR Management */}
            <Link
              href="/configuracoes/notificacoes"
              onClick={() => setOpen(false)}
              className="flex min-h-11 flex-1 items-center justify-center border-l border-line px-4 py-3 text-label font-medium text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg"
            >
              Escolher o que avisa
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NoticeRow({
  item,
  read,
  onNavigate,
}: {
  item: Notification
  read: boolean
  onNavigate: () => void
}) {
  const Icon = KIND_ICON[item.kind]
  const body = (
    <>
      <Icon className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className="min-w-0 flex-1 text-label font-semibold text-fg">{item.title}</span>
          {!read ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-pill bg-accent">
              <span className="sr-only">Não lido</span>
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-label text-fg-muted">{item.body}</span>
        <span className="mt-1 block text-label text-fg-muted">{formatEventTime(item.createdAt)}</span>
      </span>
    </>
  )

  // Aviso sem destino é texto, não link para lugar nenhum
  if (!item.link) return <div className="flex gap-3 px-4 py-3">{body}</div>

  return (
    <Link
      href={item.link}
      onClick={onNavigate}
      className="flex gap-3 px-4 py-3 transition-colors hover:bg-primary-soft focus-visible:-outline-offset-2"
    >
      {body}
    </Link>
  )
}
