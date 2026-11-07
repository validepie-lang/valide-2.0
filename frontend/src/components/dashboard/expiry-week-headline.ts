import { formatAxisDay, formatNumber } from "@/lib/utils/format"
import type { ExpiryWeekPoint } from "@/lib/types"

/*
 * Fora do arquivo do gráfico de propósito: o gráfico é "use client", e uma
 * função exportada de lá vira referência de cliente se a página, que roda no
 * servidor, tentar chamá-la.
 */

/** Semanas de pico. Destaque em uma, em duas se empatar, em nenhuma se forem muitas */
export function peakWeeks(data: ExpiryWeekPoint[]): ExpiryWeekPoint[] {
  const peak = Math.max(0, ...data.map((d) => d.lotCount))
  if (peak === 0) return []
  const top = data.filter((d) => d.lotCount === peak)
  return top.length <= 2 ? top : []
}

/**
 * O título do gráfico diz a conclusão, não o tipo de dado
 * (design-system.md, seção 14.5): "A semana de 20 out concentra 6 lotes".
 */
export function expiryWeekHeadline(data: ExpiryWeekPoint[]): string {
  const total = data.reduce((sum, d) => sum + d.lotCount, 0)
  if (total === 0) return "Nenhum lote vence nas próximas semanas"

  const peaks = peakWeeks(data)
  const lots = (n: number) => `${formatNumber(n)} ${n === 1 ? "lote" : "lotes"}`
  if (peaks.length === 1) {
    return `A semana de ${formatAxisDay(peaks[0].weekStart)} concentra ${lots(peaks[0].lotCount)}`
  }
  if (peaks.length === 2) {
    const [a, b] = peaks
    return `As semanas de ${formatAxisDay(a.weekStart)} e ${formatAxisDay(b.weekStart)} concentram ${lots(a.lotCount)} cada`
  }
  // Muitas semanas iguais: não há pico para apontar, então o título diz o total
  return `${lots(total)} vencem nas próximas ${data.length} semanas`
}
