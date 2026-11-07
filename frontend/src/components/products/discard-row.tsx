"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { daysUntil } from "@/lib/utils/expiry"
import { formatDate, formatExpiryDistance, formatNumber, formatQuantity } from "@/lib/utils/format"
import type { ExpiredLotRow } from "@/components/products/discard-batch"

function Content({ row }: { row: ExpiredLotRow }) {
  return (
    <>
      <span aria-hidden className="w-1 shrink-0 self-stretch rounded-pill bg-status-expired" />
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-fg sm:truncate">{row.productName}</span>
        <span className="mt-0.5 block text-label text-fg-muted">
          Lote {row.lotCode} · {formatQuantity(row.quantity, row.unit)} no lote
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-label font-semibold text-fg tnum">{formatDate(row.expiresAt)}</span>
        <span className="block text-label font-semibold text-status-expired-fg">
          {formatExpiryDistance(daysUntil(new Date(row.expiresAt)))}
        </span>
      </span>
    </>
  )
}

/**
 * Uma linha de Retirar vencidos. Quem descarta marca a linha e, se nem tudo
 * estava na prateleira, ajusta quanto sai (issue 048, item 47): o lote todo é
 * o normal, então a quantidade começa cheia. Quem não descarta vê a linha como
 * link para o produto.
 */
export function DiscardRow({
  row,
  canDiscard,
  checked,
  quantity,
  onToggle,
  onQuantity,
}: {
  row: ExpiredLotRow
  canDiscard: boolean
  checked: boolean
  quantity: string
  onToggle: () => void
  onQuantity: (value: string) => void
}) {
  if (!canDiscard) {
    return (
      <Link
        href={`/estoque/${row.productId}`}
        className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-primary-soft md:px-6"
      >
        <Content row={row} />
      </Link>
    )
  }

  const amount = Number(quantity)
  const invalid = !Number.isFinite(amount) || amount < 1 || amount > row.quantity
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-primary-soft sm:flex-row sm:items-center md:px-6">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          aria-label={`${row.productName}, lote ${row.lotCode}`}
          className="size-4 shrink-0 accent-[var(--primary)]"
        />
        <Content row={row} />
      </label>
      {checked ? (
        <div className="flex items-center gap-3 pl-7.5 sm:w-44 sm:shrink-0 sm:pl-0">
          <label
            htmlFor={`sai-${row.lotId}`}
            className="text-label whitespace-nowrap text-fg-muted sm:sr-only"
          >
            Sai do estoque
          </label>
          <div className="flex-1">
            <QuantityStepper
              id={`sai-${row.lotId}`}
              min={1}
              max={row.quantity}
              value={quantity}
              onChange={onQuantity}
              invalid={invalid}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Depois de registrar: quanto saiu e onde fica o registro */
export function DiscardDone({ lots, units }: { lots: number; units: number }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-md border border-line bg-surface p-5 shadow-card md:p-7"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden />
      <div>
        <h2 className="font-display text-section font-bold text-fg">Descarte registrado</h2>
        <p className="mt-1 text-body text-fg-muted">
          {formatNumber(lots)} {lots === 1 ? "lote saiu" : "lotes saíram"} do estoque como Vencimento,{" "}
          <span className="tnum">{formatNumber(units)}</span> unidades. Fica no histórico de cada produto, com
          o seu nome, a data e a hora.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex text-label font-semibold text-fg underline-offset-4 hover:underline"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  )
}
