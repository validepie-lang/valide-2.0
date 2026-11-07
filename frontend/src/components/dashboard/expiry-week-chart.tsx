"use client"

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts"
import { peakWeeks } from "@/components/dashboard/expiry-week-headline"
import { daysUntil } from "@/lib/utils/expiry"
import { formatAxisDay } from "@/lib/utils/format"
import type { ExpiryWeekPoint } from "@/lib/types"

/**
 * Vencimentos por semana, no padrão de gráfico (design-system.md, seção 14.5).
 *
 * Direção A (09/10/2026): a semana que começa dentro da janela de A vencer
 * pinta em âmbar, porque os lotes dela são A vencer; as de depois ficam na
 * base neutra. O pico ganha o âmbar mais fundo. O valor vai escrito em cima de
 * cada barra, então não há eixo Y, grade nem dica flutuante repetindo o número.
 */
export function ExpiryWeekChart({
  data,
  soonThresholdDays,
}: {
  data: ExpiryWeekPoint[]
  soonThresholdDays: number
}) {
  const peaks = new Set(peakWeeks(data).map((d) => d.weekStart))
  const rows = data.map((d) => ({
    ...d,
    label: formatAxisDay(d.weekStart),
    isPeak: peaks.has(d.weekStart),
    inWindow: daysUntil(new Date(d.weekStart)) <= soonThresholdDays,
  }))

  const summary = rows
    .map((r) => `${r.label}, ${r.lotCount} ${r.lotCount === 1 ? "lote" : "lotes"}`)
    .join("; ")

  return (
    /**
     * O gráfico sai do caminho do Tab e vira uma imagem com nome. Os números
     * continuam disponíveis para leitor de tela na lista abaixo.
     */
    <div className="h-60 w-full" role="img" aria-label={`Lotes que vencem por semana: ${summary}`}>
      <ul className="sr-only">
        {rows.map((r) => (
          <li key={r.weekStart}>
            {r.label}: {r.lotCount} {r.lotCount === 1 ? "lote" : "lotes"}
          </li>
        ))}
      </ul>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 24, right: 0, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--fg-muted)", fontSize: 12 }}
            // Em card estreito as datas se sobrepunham. O eixo pula rótulos
            // quando falta espaço; o valor de cada barra continua escrito nela
            interval="preserveStartEnd"
            minTickGap={12}
            tickMargin={8}
          />
          {/* Sem animação: o público usa máquina fraca, e gráfico que desliza
              na entrada parece lentidão, não capricho */}
          {/* minPointSize: semana sem lote ganha um traço com o "0" em cima. Sem
              isso a semana some do gráfico e parece dado faltando */}
          <Bar
            dataKey="lotCount"
            radius={[4, 4, 0, 0]}
            maxBarSize={56}
            minPointSize={2}
            isAnimationActive={false}
          >
            {rows.map((row) => (
              <Cell
                key={row.weekStart}
                fill={
                  row.inWindow
                    ? row.isPeak
                      ? "var(--chart-soon-focus)"
                      : "var(--chart-soon)"
                    : "var(--chart-base)"
                }
              />
            ))}
            <LabelList
              dataKey="lotCount"
              position="top"
              offset={6}
              content={({ x, y, width, value, index }) => {
                if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number") {
                  return null
                }
                const isPeak = typeof index === "number" && rows[index]?.isPeak
                return (
                  <text
                    x={x + width / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={isPeak ? 600 : 500}
                    fill={isPeak ? "var(--fg)" : "var(--fg-muted)"}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {value}
                  </text>
                )
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
