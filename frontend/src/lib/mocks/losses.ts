import { mockProducts, isoInDays } from "@/lib/mocks/catalog"
import type { LossPeriod, LossReason, LossReport } from "@/lib/types"

/**
 * Perdas simuladas de um ano, para a tela de Perdas (issue 036) funcionar
 * antes do GET /reports/losses. Determinístico: a mesma lista sempre, para a
 * captura e o teste não mudarem de um dia para o outro.
 */
type LossEvent = { daysAgo: number; productIndex: number; reason: LossReason; units: number }

function seeded(seed: number) {
  let x = seed
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648
    return x / 2147483648
  }
}

const EVENTS: LossEvent[] = (() => {
  const rand = seeded(20261010)
  const out: LossEvent[] = []
  for (let i = 0; i < 260; i++) {
    const r = rand()
    // Vencimento é a maior parte da perda de uma farmácia; avaria e roubo vêm depois
    const reason: LossReason = r < 0.68 ? "expiry" : r < 0.88 ? "damage" : "theft"
    out.push({
      daysAgo: Math.floor(rand() * 365),
      productIndex: Math.floor(rand() * mockProducts().length),
      reason,
      units: 1 + Math.floor(rand() * (reason === "expiry" ? 9 : 3)),
    })
  }
  return out
})()

const DAYS: Record<LossPeriod, number> = { "30d": 30, "90d": 90, year: 365 }

function sum(events: LossEvent[]) {
  return events.reduce((acc, e) => acc + e.units * mockProducts()[e.productIndex].acquisitionCost, 0)
}

/** Reproduz o que o servidor faria com GET /reports/losses?period= */
export function mockLossReport(period: LossPeriod): LossReport {
  const days = DAYS[period]
  const inRange = EVENTS.filter((e) => e.daysAgo < days)
  const before = EVENTS.filter((e) => e.daysAgo >= days && e.daysAgo < days * 2)

  const reasons: LossReason[] = ["expiry", "damage", "theft"]
  const byReason = reasons
    .map((reason) => {
      const list = inRange.filter((e) => e.reason === reason)
      return { reason, value: sum(list), units: list.reduce((a, e) => a + e.units, 0) }
    })
    .sort((a, b) => b.value - a.value)

  const bucket = period === "year" ? "month" : "week"
  const size = bucket === "month" ? 30 : 7
  const count = Math.ceil(days / size)
  const series = Array.from({ length: count }, (_, i) => {
    const startAgo = (count - i) * size
    const list = inRange.filter((e) => e.daysAgo < startAgo && e.daysAgo >= startAgo - size)
    return { start: isoInDays(-startAgo + 1), value: sum(list) }
  })

  const byProduct = new Map<number, LossEvent[]>()
  for (const e of inRange) byProduct.set(e.productIndex, [...(byProduct.get(e.productIndex) ?? []), e])
  const topProducts = [...byProduct.entries()]
    .map(([index, list]) => {
      const product = mockProducts()[index]
      const main = reasons
        .map((reason) => [reason, list.filter((e) => e.reason === reason).length] as const)
        .sort((a, b) => b[1] - a[1])[0][0]
      return {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        units: list.reduce((a, e) => a + e.units, 0),
        value: sum(list),
        mainReason: main,
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return {
    period,
    from: isoInDays(-days + 1),
    to: isoInDays(0),
    total: sum(inRange),
    previousTotal: period === "year" ? null : sum(before),
    units: inRange.reduce((a, e) => a + e.units, 0),
    byReason,
    bucket,
    series,
    topProducts,
  }
}
