/**
 * Que dia é hoje, para a farmácia.
 *
 * O servidor da Vercel roda em UTC e o computador do caixa pode estar com o
 * fuso errado, então nada aqui depende do fuso da máquina: o fuso é explícito
 * e a data é lida pelo Intl. Entre 21h e meia-noite de Brasília o UTC já está
 * no dia seguinte, e usar a data UTC tirava um dia de "vence em N dias".
 * Ver docs/07-decisions/technical-decisions.md, 08/10/2026.
 */

/**
 * Fuso da farmácia. O certo é o da conta (`Company.timezone`); até a sessão
 * chegar aos componentes que contam dias e mostram hora, vale este padrão.
 */
export const DEFAULT_TIME_ZONE = "America/Sao_Paulo"

/**
 * O dia do calendário no fuso da farmácia, como meia-noite UTC daquela data.
 *
 * É a mesma representação da data de validade (`2026-10-09T00:00:00Z`), então
 * comparar as duas continua sendo comparar data com data.
 */
export function calendarToday(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone,
  }).formatToParts(now)
  const get = (type: "year" | "month" | "day") =>
    Number(parts.find((p) => p.type === type)?.value)
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")))
}
