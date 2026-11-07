import { apiGet } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { buildDashboard, mockDashboard } from "@/lib/mocks/dashboard"
import { demoMovements, demoProducts, readJournal } from "@/lib/services/demo-store"
import type { DashboardData } from "@/lib/types"

/** GET /dashboard: uma chamada só, para a Home carregar rápido. É o B32. */
export async function getDashboard(): Promise<DashboardData> {
  if (isLive("dashboard")) {
    return apiGet<DashboardData>("/dashboard")
  }
  // Com algo gravado na demonstração (issue 071), o painel é refeito com isso
  if ((await readJournal()).length === 0) return mockDashboard()
  return buildDashboard(await demoProducts(), await demoMovements())
}
