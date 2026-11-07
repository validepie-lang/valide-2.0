import { StatusChip } from "@/components/ui/status-chip"
import { daysUntil, type ExpiryStatus } from "@/lib/utils/expiry"
import { formatDate, formatExpiryDistance, formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { Lot, ProductUnit } from "@/lib/types"

/** Direção A: barra de estado à esquerda e distância na cor do estado, como no estoque */
const BAR: Record<ExpiryStatus, string> = {
  expired: "bg-status-expired",
  soon: "bg-status-soon",
  ok: "bg-status-ok",
  unknown: "bg-status-unknown",
}
const DISTANCE: Record<ExpiryStatus, string> = {
  expired: "font-semibold text-status-expired-fg",
  soon: "font-semibold text-status-soon-fg",
  ok: "text-fg-muted",
  unknown: "text-fg-muted",
}

/**
 * Lotes de um produto, do que vence primeiro ao último. Cada lote tem a
 * própria situação; a do produto é a do primeiro, e já está no topo da tela.
 */
export function LotsTable({ lots, unit }: { lots: Lot[]; unit: ProductUnit }) {
  return (
    <>
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-line text-left">
            <Th>Lote</Th>
            <Th>Validade</Th>
            <Th className="text-right">Quantidade</Th>
            <Th>Situação</Th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot, i) => (
            <tr key={lot.id} className="border-b border-line last:border-b-0">
              <Td>
                <div className="flex items-stretch gap-3">
                <span aria-hidden className={cn("w-1 shrink-0 rounded-pill", BAR[lot.status])} />
                <span className="block">
                <span className="block text-body font-semibold text-fg">
                  {lot.code}
                  {i === 0 && lots.length > 1 ? (
                    <span className="ml-2 text-label font-normal text-fg-muted">vence primeiro</span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-label text-fg-muted">
                  Fabricação{" "}
                  {lot.manufacturedAt ? <span className="tnum">{formatDate(lot.manufacturedAt)}</span> : "não informada"}
                </span>
                </span>
                </div>
              </Td>
              <Td>
                <span className="block text-body font-medium text-fg tnum">{formatDate(lot.expiresAt)}</span>
                <span className={cn("mt-0.5 block text-label", DISTANCE[lot.status])}>
                  {formatExpiryDistance(daysUntil(new Date(lot.expiresAt)))}
                </span>
              </Td>
              <Td className="text-right text-body font-medium text-fg tnum">
                {formatQuantity(lot.quantity, unit)}
              </Td>
              <Td>
                <StatusChip status={lot.status} size="sm" />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Celular: lote e situação em cima, validade e quantidade embaixo */}
      <ul className="divide-y divide-line md:hidden">
        {lots.map((lot, i) => (
          <li key={lot.id} className="flex gap-3 py-3.5">
            <span aria-hidden className={cn("w-1 shrink-0 rounded-pill", BAR[lot.status])} />
            <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-body font-medium text-fg">
                Lote {lot.code}
                {i === 0 && lots.length > 1 ? (
                  <span className="ml-2 text-label font-normal text-fg-muted">vence primeiro</span>
                ) : null}
              </p>
              <StatusChip status={lot.status} size="sm" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-3 text-label text-fg-muted">
              <span>
                <span className="tnum">{formatDate(lot.expiresAt)}</span> ·{" "}
                <span className={DISTANCE[lot.status]}>
                  {formatExpiryDistance(daysUntil(new Date(lot.expiresAt)))}
                </span>
              </span>
              <span className="shrink-0 font-medium text-fg tnum">{formatQuantity(lot.quantity, unit)}</span>
            </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("px-3 py-2.5 text-label font-medium text-fg-muted first:pl-0 last:pr-0", className)}>
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3 align-middle first:pl-0 last:pr-0", className)}>{children}</td>
}
