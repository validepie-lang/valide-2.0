import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusChip } from "@/components/ui/status-chip"
import { formatQuantity } from "@/lib/utils/format"
import type { CalendarLot } from "@/lib/types"

const DAY = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
})

/**
 * Os lotes do dia escolhido (issue 052), a agenda ao lado do mês no Kalee;
 * cada linha com o produto, o lote e a quantidade, como os lotes do
 * Restaurant Inventory (Behance).
 */
export function ExpiryDay({ day, lots }: { day: string; lots: CalendarLot[] }) {
  const label = DAY.format(new Date(`${day}T00:00:00Z`)).replace("-feira", "")
  return (
    <Card className="p-0 md:p-0">
      <div className="p-4 md:px-6 md:pt-6 md:pb-4">
        <CardTitle className="first-letter:uppercase">{label}</CardTitle>
        <CardSubtitle>
          {lots.length === 0
            ? "Nenhum lote vence neste dia."
            : `${lots.length} ${lots.length === 1 ? "lote vence" : "lotes vencem"} neste dia.`}
        </CardSubtitle>
      </div>
      {lots.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {lots.map((lot) => (
            <li key={lot.lotId}>
              <Link
                href={`/estoque/${lot.productId}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary-soft md:px-6"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-medium text-fg">{lot.productName}</span>
                  <span className="mt-0.5 block text-label text-fg-muted">
                    Lote {lot.lotCode} · {formatQuantity(lot.quantity, lot.unit)}
                  </span>
                </span>
                <StatusChip status={lot.status} size="sm" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-t border-line">
          <EmptyState
            icon={CalendarCheck}
            title="Dia livre"
            description="Escolha outro dia no calendário. Os dias com uma barrinha têm lote vencendo."
          />
        </div>
      )}
    </Card>
  )
}
