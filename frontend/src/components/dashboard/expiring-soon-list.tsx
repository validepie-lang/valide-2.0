import Link from "next/link"
import { daysUntil } from "@/lib/utils/expiry"
import { formatDate, formatExpiryDistance, formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { ExpiringSoonItem } from "@/lib/types"

/**
 * Lista de lotes da Home, na direção A (09/10/2026). Serve às duas listas:
 * os vencidos, para retirar da prateleira, e os A vencer que vencem primeiro.
 *
 * A barra de cor à esquerda diz o estado da lista inteira; a distância em
 * dias, na cor de texto do estado, diz a urgência de cada linha. Sem chip
 * repetido em toda linha: o título já diz o estado.
 *
 * `layout="table"` (issue 027): a partir de `lg`, tabela com cabeçalho de
 * colunas, como a "Stock Alert" do Gyle e a "Latest Orders" do Pharmly
 * (Behance). No celular continua a lista de duas linhas.
 */
const TONE = {
  expired: { bar: "bg-status-expired", ink: "text-status-expired-fg" },
  soon: { bar: "bg-status-soon", ink: "text-status-soon-fg" },
} as const

export function LotList({
  id,
  title,
  tone,
  items,
  action,
  empty,
  layout = "list",
  className,
}: {
  id: string
  title: string
  tone: keyof typeof TONE
  items: ExpiringSoonItem[]
  /** link do cabeçalho, ex.: "Ver os 22" */
  action?: { href: string; label: string }
  empty: string
  /** "table" mostra colunas a partir de lg */
  layout?: "list" | "table"
  className?: string
}) {
  const t = TONE[tone]
  return (
    <section
      aria-labelledby={id}
      className={cn("min-w-0 overflow-hidden rounded-md border border-line bg-surface shadow-card", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
        <h2 id={id} className="font-display text-section font-bold text-fg">
          {title}
        </h2>
        {action && items.length > 0 ? (
          <Link
            href={action.href}
            className="inline-flex min-h-11 shrink-0 items-center text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
          >
            {action.label}
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-6 text-body text-fg-muted md:px-6">{empty}</p>
      ) : (
        <>
          {layout === "table" ? <LotTable items={items} tone={tone} /> : null}
          <ul className={cn("divide-y divide-line", layout === "table" && "lg:hidden")}>
            {items.map((item) => (
              <li key={`${item.productId}-${item.lotCode}`}>
                <Link
                  href={`/estoque/${item.productId}`}
                  className="flex items-stretch gap-3.5 px-5 py-3.5 transition-colors hover:bg-primary-soft focus-visible:-outline-offset-2 md:px-6"
                >
                  <span aria-hidden className={cn("w-1 shrink-0 rounded-pill", t.bar)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-semibold text-fg">
                      {item.productName}
                    </span>
                    <span className="mt-0.5 block truncate text-label text-fg-muted">
                      Lote {item.lotCode} · {formatQuantity(item.quantity, item.unit)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-label font-semibold text-fg tnum">
                      {formatDate(item.expiresAt)}
                    </span>
                    <span className={cn("mt-0.5 block text-label font-semibold", t.ink)}>
                      {formatExpiryDistance(daysUntil(new Date(item.expiresAt)))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

/** A mesma lista em colunas, para a largura de tabela */
function LotTable({ items, tone }: { items: ExpiringSoonItem[]; tone: keyof typeof TONE }) {
  const t = TONE[tone]
  return (
    <table className="hidden w-full border-collapse lg:table">
      <thead>
        <tr className="border-b border-line bg-sunken text-left">
          <Th>Produto</Th>
          <Th>Lote</Th>
          <Th>Validade</Th>
          <Th className="text-right">Quantidade</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={`${item.productId}-${item.lotCode}`}
            className="border-b border-line transition-colors last:border-b-0 hover:bg-primary-soft"
          >
            <Td>
              <div className="flex min-h-10 items-stretch gap-3">
                <span aria-hidden className={cn("w-1 shrink-0 rounded-pill", t.bar)} />
                <Link
                  href={`/estoque/${item.productId}`}
                  className="self-center text-body font-semibold text-fg underline-offset-4 hover:underline"
                >
                  {item.productName}
                </Link>
              </div>
            </Td>
            <Td className="text-body text-fg-muted">{item.lotCode}</Td>
            <Td>
              <span className="block text-body text-fg tnum">{formatDate(item.expiresAt)}</span>
              <span className={cn("block text-label font-semibold", t.ink)}>
                {formatExpiryDistance(daysUntil(new Date(item.expiresAt)))}
              </span>
            </Td>
            <Td className="text-right text-body text-fg tnum">{formatQuantity(item.quantity, item.unit)}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("px-3 py-3 text-label font-semibold text-fg-muted first:pl-6 last:pr-6", className)}
    >
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3 align-middle first:pl-6 last:pr-6", className)}>{children}</td>
}
