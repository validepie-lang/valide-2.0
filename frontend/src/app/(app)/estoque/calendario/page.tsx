import { PageHeader } from "@/components/layout/page-header"
import { StockTabs } from "@/components/products/stock-tabs"
import { ExpiryDay } from "@/components/calendar/expiry-day"
import { ExpiryMonth } from "@/components/calendar/expiry-month"
import { getLotsExpiring } from "@/lib/services/lots"
import { calendarToday } from "@/lib/utils/calendar"
import { addMonths, monthKey, parseMonth } from "@/lib/utils/month-grid"

export const metadata = { title: "Calendário de vencimentos" }

/**
 * Calendário de vencimentos (issue 052): o mês à esquerda e os lotes do dia
 * escolhido ao lado, como o Kalee (Behance). Referências em
 * docs/04-issues/052-calendario-de-vencimentos.md.
 *
 * Busca a grade inteira (com os dias de fora do mês), para o dia apagado do
 * mês vizinho também mostrar o que vence nele.
 */
export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; dia?: string }>
}) {
  const { mes, dia } = await searchParams
  const today = calendarToday().toISOString().slice(0, 10)
  const first = parseMonth(mes) ?? parseMonth(today.slice(0, 7))!
  const month = monthKey(first)

  const gridStart = new Date(first)
  gridStart.setUTCDate(1 - first.getUTCDay())
  const nextMonth = addMonths(first, 1)
  const gridEnd = new Date(nextMonth)
  gridEnd.setUTCDate(nextMonth.getUTCDate() + ((7 - nextMonth.getUTCDay()) % 7) - 1)

  const lots = await getLotsExpiring({
    from: gridStart.toISOString().slice(0, 10),
    to: gridEnd.toISOString().slice(0, 10),
  })

  // O dia escolhido: o do endereço; senão o próximo dia com lote a partir de hoje (ou do dia 1, em
  // outro mês), que é o que a pessoa veio ver; sem nenhum, hoje ou o dia 1
  const validDay = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : null
  const startsAt = today.startsWith(month) ? today : `${month}-01`
  const next = lots.find((l) => l.expiresAt.startsWith(month) && l.expiresAt.slice(0, 10) >= startsAt)
  const selected = validDay ?? next?.expiresAt.slice(0, 10) ?? startsAt
  const dayLots = lots.filter((l) => l.expiresAt.startsWith(selected))

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Quando cada lote vence, mês a mês. Escolha um dia para ver os lotes dele."
        className="mb-0"
      />
      <StockTabs className="mt-5 mb-6" />

      <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-8">
          <ExpiryMonth first={first} lots={lots} selected={selected} today={today} />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <ExpiryDay day={selected} lots={dayLots} />
        </div>
      </div>
    </div>
  )
}
