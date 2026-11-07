import Link from "next/link"
import { FixMovement } from "@/components/movements/fix-movement"
import { MovementBadge, signedQuantity } from "@/components/products/movements-table"
import { eventDayKey, formatEventClock, formatEventDay } from "@/lib/utils/format"
import { canBeCorrected, movementNoteText, shortEventTime } from "@/lib/utils/movement-fix"
import type { Movement } from "@/lib/types"

type Day = { key: string; label: string; movements: Movement[] }

/** A lista já vem do mais recente para o mais antigo: basta cortar quando o dia muda */
function byDay(movements: Movement[]): Day[] {
  const days: Day[] = []
  for (const m of movements) {
    const key = eventDayKey(m.createdAt)
    const last = days.at(-1)
    if (last?.key === key) last.movements.push(m)
    else days.push({ key, label: formatEventDay(key), movements: [m] })
  }
  return days
}

function ProductCell({ m }: { m: Movement }) {
  return (
    <>
      <Link
        href={`/estoque/${m.productId}`}
        className="font-medium text-fg underline-offset-4 hover:underline"
      >
        {m.productName}
      </Link>
      <p className="mt-0.5 text-label text-fg-muted">
        Lote {m.lotCode}
        {movementNoteText(m) ? `. ${movementNoteText(m)}` : ""}
      </p>
    </>
  )
}

/** "Corrigir" para quem pode, "Corrigida em…" depois (issue 073, item 79) */
function FixCell({ m, fixHref }: { m: Movement; fixHref: string | null }) {
  if (m.correctedAt) {
    return (
      <span className="inline-block pt-1.5 pl-2 text-label whitespace-nowrap text-fg-muted">
        Corrigida em {shortEventTime(m.correctedAt)}
      </span>
    )
  }
  return fixHref && canBeCorrected(m) ? <FixMovement movement={m} doneHref={fixHref} /> : null
}

/**
 * Movimentações agrupadas por dia (issue 041), como a tabela do Ctrl Panel
 * (Behance): cada grupo abre com uma faixa cinza e as linhas vêm embaixo.
 * Da tela grande em diante é tabela; no tablet e no celular, lista (CLAUDE.md seção 10).
 * `fixHref`: quem pode corrigir (issue 073) e para onde a tela vai depois; `null` esconde o botão.
 */
export function MovementDayList({ movements, fixHref }: { movements: Movement[]; fixHref: string | null }) {
  const days = byDay(movements)
  return (
    <>
      <table className="hidden w-full border-collapse text-left text-body lg:table">
        <thead className="sr-only">
          <tr>
            <th scope="col">Hora</th>
            <th scope="col">Produto e lote</th>
            <th scope="col">Movimento</th>
            <th scope="col">Quantidade</th>
            <th scope="col">Quem fez</th>
            <th scope="col">Correção</th>
          </tr>
        </thead>
        {days.map((day) => (
          <tbody key={day.key}>
            <tr>
              <th
                scope="colgroup"
                colSpan={6}
                className="border-y border-line bg-sunken px-6 py-2.5 text-label font-semibold text-fg first-letter:uppercase"
              >
                {day.label}
              </th>
            </tr>
            {day.movements.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-b-0">
                <td className="w-20 py-3 pr-3 pl-6 align-top text-fg-muted tnum">
                  {formatEventClock(m.createdAt)}
                </td>
                <td className="px-3 py-3 align-top">
                  <ProductCell m={m} />
                </td>
                <td className="px-3 py-3 align-top">
                  <MovementBadge movement={m} />
                </td>
                <td className="px-3 py-3 text-right align-top font-medium whitespace-nowrap text-fg tnum">
                  {signedQuantity(m)}
                </td>
                <td className="px-3 py-3 align-top whitespace-nowrap text-fg-muted">{m.userName}</td>
                <td className="py-1.5 pr-6 pl-1 text-right align-top">
                  <FixCell m={m} fixHref={fixHref} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>

      <div className="lg:hidden">
        {days.map((day) => (
          <section key={day.key} aria-label={day.label}>
            <h3 className="border-y border-line bg-sunken px-4 py-2 text-label font-semibold text-fg first-letter:uppercase">
              {day.label}
            </h3>
            <ul className="divide-y divide-line">
              {day.movements.map((m) => (
                <li key={m.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <ProductCell m={m} />
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <MovementBadge movement={m} />
                      <span className="text-label text-fg-muted">
                        {formatEventClock(m.createdAt)}, {m.userName}
                      </span>
                    </div>
                    <div className="mt-1 -ml-2 empty:hidden">
                      <FixCell m={m} fixHref={fixHref} />
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold whitespace-nowrap text-fg tnum">
                    {signedQuantity(m)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
