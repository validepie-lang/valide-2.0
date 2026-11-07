import Link from "next/link"
import { ArrowRight, PackageCheck } from "lucide-react"
import { signedQuantity } from "@/components/products/movements-table"
import { formatEventClock, formatNumber } from "@/lib/utils/format"
import type { Movement } from "@/lib/types"

/**
 * "Conferido hoje" ao lado da busca da entrada geral (issue 074, item 81):
 * quem recebe uma caixa com vários produtos vê o que já entrou sem sair da
 * tela. É a coluna do pedido ao lado do catálogo do Point of Sale App (Ronas
 * IT, Behance, 2,7 mil curtidas) e o histórico de leituras do Zapper (653).
 *
 * Vem do histórico (as entradas de hoje feitas por quem está usando), então
 * continua certo depois de recarregar e em outro computador.
 */
export function EntryToday({
  movements,
  total,
  allHref,
}: {
  movements: Movement[]
  total: number
  allHref: string
}) {
  return (
    <section
      aria-labelledby="conferido-hoje"
      className="self-start overflow-hidden rounded-md border border-line bg-surface shadow-card"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <h2 id="conferido-hoje" className="font-display text-section font-bold text-fg">
          Conferido hoje
        </h2>
        <span className="text-label text-fg-muted tnum">
          {formatNumber(total)} {total === 1 ? "entrada" : "entradas"}
        </span>
      </div>
      {movements.length === 0 ? (
        <p className="flex items-start gap-2 px-5 py-4 text-body text-fg-muted">
          <PackageCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          Cada entrada que você registrar hoje aparece aqui, para conferir a caixa sem perder a conta.
        </p>
      ) : (
        <ol className="divide-y divide-line">
          {movements.map((m) => (
            <li key={m.id} className="flex items-baseline justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <Link
                  href={`/estoque/${m.productId}`}
                  className="block truncate text-body font-medium text-fg underline-offset-4 hover:underline"
                >
                  {m.productName}
                </Link>
                <p className="mt-0.5 text-label text-fg-muted">
                  Lote {m.lotCode} · <span className="tnum">{formatEventClock(m.createdAt)}</span>
                </p>
              </div>
              <span className="shrink-0 text-body font-semibold text-fg tnum">{signedQuantity(m)}</span>
            </li>
          ))}
        </ol>
      )}
      {total > 0 ? (
        <Link
          href={allHref}
          className="flex min-h-11 items-center gap-1.5 border-t border-line px-5 py-3 text-label font-semibold text-fg transition-colors hover:bg-primary-soft"
        >
          {total > movements.length
            ? `Ver as ${formatNumber(total)} em Movimentações`
            : "Ver em Movimentações"}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      ) : null}
    </section>
  )
}
