import Link from "next/link"
import { Plus } from "lucide-react"
import { daysUntil, type ExpiryStatus } from "@/lib/utils/expiry"
import { formatDate, formatExpiryDistance } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { Product } from "@/lib/types"

/**
 * Direção A (09/10/2026): a barra à esquerda da linha e o texto de distância
 * levam a cor do estado. É a mesma linguagem das listas da Home
 * (docs/03-specs/direcao-visual-a.md, regra 2).
 */
export const BAR: Record<ExpiryStatus, string> = {
  expired: "bg-status-expired",
  soon: "bg-status-soon",
  ok: "bg-status-ok",
  unknown: "bg-status-unknown",
}
export const DISTANCE: Record<ExpiryStatus, string> = {
  expired: "font-semibold text-status-expired-fg",
  soon: "font-semibold text-status-soon-fg",
  ok: "text-fg-muted",
  unknown: "text-fg-muted",
}

/**
 * Produto sem lote mostra o botão "Informar" na coluna de validade, nunca um
 * traço. Traço comunica ausência mas não comunica que o usuário pode agir ali.
 * Ver docs/07-decisions/ux-decisions.md, 16/09/2026.
 */
export function ExpiryCell({ product }: { product: Product }) {
  if (!product.nearestExpiry) {
    return (
      <Link
        href={`/estoque/validades-pendentes?produto=${product.id}`}
        className="inline-flex items-center gap-1 rounded-pill border border-line px-2.5 py-1 text-label font-medium text-fg-muted transition-colors hover:border-line-strong hover:bg-primary-soft hover:text-fg"
      >
        <Plus className="size-3.5" aria-hidden />
        Informar
      </Link>
    )
  }
  return (
    <span className="block">
      <span className="block text-body font-medium text-fg tnum">{formatDate(product.nearestExpiry)}</span>
      <span className={cn("mt-0.5 block text-label", DISTANCE[product.nearestExpiryStatus])}>
        {formatExpiryDistance(daysUntil(new Date(product.nearestExpiry)))}
      </span>
    </span>
  )
}

/** O lote que vence primeiro, que é o que dá a situação do produto */
export function nearestLotCode(p: Product): string | null {
  if (!p.lots.length) return null
  return [...p.lots].sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())[0].code
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-3 text-label font-semibold text-fg-muted first:pl-4 md:first:pl-6 last:pr-6",
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-3 py-3 align-middle first:pl-4 md:first:pl-6 last:pr-6", className)}>{children}</td>
  )
}
