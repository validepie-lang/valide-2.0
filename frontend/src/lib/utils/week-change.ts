/**
 * Variação do valor em risco desde a semana passada (issue 067, item 1), no
 * formato da pílula do Pharmly e do Vault: "+12% desde a semana passada".
 *
 * Sem o valor da semana passada (conta nova, ou o servidor ainda não manda),
 * não há variação: devolve null e a pílula não aparece. Partir de zero também
 * não tem porcentagem, então diz o que aconteceu em palavras.
 */

/** Sinal de menos tipográfico, como em format.ts */
const MINUS = "−"

export type WeekChange = { direction: "up" | "down" | "flat"; text: string }

export function weekChange(current: number, lastWeek: number | null | undefined): WeekChange | null {
  if (lastWeek === null || lastWeek === undefined || lastWeek < 0) return null
  if (current === lastWeek) return { direction: "flat", text: "Igual à semana passada" }
  if (lastWeek === 0) return { direction: "up", text: "Era zero na semana passada" }

  const percent = ((current - lastWeek) / lastWeek) * 100
  const direction = percent > 0 ? "up" : "down"
  const rounded = Math.round(Math.abs(percent))
  const amount = rounded === 0 ? "menos de 1%" : `${rounded.toLocaleString("pt-BR")}%`
  const sign = rounded === 0 ? "" : direction === "up" ? "+" : MINUS
  return { direction, text: `${sign}${amount} desde a semana passada` }
}
