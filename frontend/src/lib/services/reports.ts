import { apiGet } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { mockLossReport } from "@/lib/mocks/losses"
import type { LossPeriod, LossReport } from "@/lib/types"

/**
 * GET /reports/losses?period= (contrato v12, proposto em 10/10). A soma, o
 * custo e o agrupamento são do servidor: o front só mostra.
 */
export async function getLossReport(period: LossPeriod): Promise<LossReport> {
  if (isLive("reports")) {
    return apiGet<LossReport>("/reports/losses", { period })
  }
  return mockLossReport(period)
}
