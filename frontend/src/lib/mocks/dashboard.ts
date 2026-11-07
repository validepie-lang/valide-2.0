/**
 * Dados da Home. Derivados do catálogo, nunca digitados à mão, para que clicar
 * em um indicador e cair na listagem filtrada mostre exatamente o mesmo número.
 */

import { daily, mockProducts, mockToday, isoInDays } from "@/lib/mocks/catalog"
import { mockMovements } from "@/lib/mocks/movements"
import { DEFAULT_SOON_THRESHOLD_DAYS, daysUntil, getExpiryStatus } from "@/lib/utils/expiry"
import type {
  DashboardCounts,
  DashboardData,
  ExpiringSoonItem,
  ExpiryWeekPoint,
  FolderRiskPoint,
  Movement,
  Product,
} from "@/lib/types"

function buildCounts(products: Product[]): DashboardCounts {
  const counts: DashboardCounts = { expired: 0, soon: 0, ok: 0, unknown: 0 }
  for (const p of products) counts[p.nearestExpiryStatus] += 1
  return counts
}

/** Custo parado em vencido mais a vencer. Não inclui sem validade. */
function buildValueAtRisk(products: Product[]): number {
  let total = 0
  for (const p of products) {
    for (const lot of p.lots) {
      if (lot.status === "expired" || lot.status === "soon") {
        total += lot.quantity * p.acquisitionCost
      }
    }
  }
  return total
}

/**
 * O valor em risco de sete dias atrás, com o estado de cada lote calculado
 * para aquele dia e a quantidade de hoje. O servidor de verdade guardaria o
 * número do dia (contrato v23); aqui basta ser coerente com o catálogo.
 */
function buildValueAtRiskLastWeek(products: Product[]): number {
  const weekAgo = new Date(mockToday())
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)
  let total = 0
  for (const p of products) {
    for (const lot of p.lots) {
      const status = getExpiryStatus(lot.expiresAt, DEFAULT_SOON_THRESHOLD_DAYS, weekAgo)
      if (status === "expired" || status === "soon") total += lot.quantity * p.acquisitionCost
    }
  }
  return total
}

/** Custo parado em produto sem validade informada. É o que justifica a fila. */
function buildValueAtStake(products: Product[]): number {
  return products.filter((p) => p.nearestExpiryStatus === "unknown").reduce(
    (sum, p) => sum + p.totalQuantity * p.acquisitionCost,
    0,
  )
}

/**
 * Oito semanas à frente, contando lotes que vencem em cada uma. Começa amanhã:
 * o lote que vence hoje já é Vencido e não "vence nas próximas semanas".
 */
function buildExpiryByWeek(products: Product[]): ExpiryWeekPoint[] {
  const weeks: ExpiryWeekPoint[] = []
  for (let w = 0; w < 8; w++) {
    const start = w * 7 + 1
    const end = start + 7
    let lotCount = 0
    for (const p of products) {
      for (const lot of p.lots) {
        const d = daysUntil(new Date(lot.expiresAt), mockToday())
        if (d >= start && d < end) lotCount += 1
      }
    }
    weeks.push({ weekStart: isoInDays(start), lotCount })
  }
  return weeks
}

function buildByFolder(products: Product[]): FolderRiskPoint[] {
  const map = new Map<string, FolderRiskPoint>()
  for (const p of products) {
    if (p.nearestExpiryStatus !== "expired" && p.nearestExpiryStatus !== "soon") continue
    if (!p.folderId || !p.folderName) continue
    const current = map.get(p.folderId)
    if (current) current.atRiskCount += 1
    else
      map.set(p.folderId, {
        folderId: p.folderId,
        folderName: p.folderName,
        atRiskCount: 1,
      })
  }
  return [...map.values()].sort((a, b) => b.atRiskCount - a.atRiskCount)
}

/**
 * Os cinco lotes A vencer que vencem primeiro. Os vencidos ficam de fora desde
 * 08/10: têm contagem e caminho próprios na faixa de status, e ocupariam a
 * lista para sempre numa farmácia que acumula vencido. Ver SPEC 3.3.
 */
function buildExpiringSoon(products: Product[]): ExpiringSoonItem[] {
  const items: ExpiringSoonItem[] = []
  for (const p of products) {
    for (const lot of p.lots) {
      if (lot.status !== "soon") continue
      items.push({
        productId: p.id,
        productName: p.name,
        lotCode: lot.code,
        expiresAt: lot.expiresAt,
        status: lot.status,
        quantity: lot.quantity,
        unit: p.unit,
      })
    }
  }
  return items
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
    .slice(0, 5)
}

/**
 * O painel montado de uma lista de produtos e de movimentações. Desde a issue
 * 071 o serviço passa o catálogo com o que foi gravado na demonstração.
 */
export function buildDashboard(products: Product[], movements: Movement[]): DashboardData {
  return {
    valueAtRisk: buildValueAtRisk(products),
    valueAtRiskLastWeek: buildValueAtRiskLastWeek(products),
    counts: buildCounts(products),
    pendingExpiry: {
      productCount: products.filter((p) => p.nearestExpiryStatus === "unknown").length,
      valueAtStake: buildValueAtStake(products),
    },
    expiryByWeek: buildExpiryByWeek(products),
    byFolder: buildByFolder(products),
    expiringSoon: buildExpiringSoon(products),
    recentMovements: movements.slice(0, 6),
  }
}

export const mockDashboard = daily((): DashboardData => buildDashboard(mockProducts(), mockMovements()))
