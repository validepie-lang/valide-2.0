"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { sliceColor, type FolderSlice } from "@/lib/utils/folder-share"

/**
 * A rosca de "Em risco por pasta" (issue 067). Só desenho: os números estão
 * na legenda ao lado, que é o que o leitor de tela e o teclado percorrem.
 * Começa no alto e gira no sentido do relógio, da maior fatia para a menor.
 */
export function FolderRiskDonut({ slices, total }: { slices: FolderSlice[]; total: number }) {
  return (
    <div className="relative size-40 shrink-0" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer={false}>
          <Pie
            data={slices}
            dataKey="count"
            nameKey="name"
            innerRadius="66%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="var(--surface)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {slices.map((slice, i) => (
              <Cell key={slice.id} fill={sliceColor(i)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span className="font-display text-[1.75rem] leading-none font-bold text-fg tnum">{total}</span>
        <span className="mt-1 text-micro text-fg-muted">em risco</span>
      </div>
    </div>
  )
}
