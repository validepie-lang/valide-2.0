import { DEFAULT_TIME_ZONE, calendarToday } from "./calendar.ts"

/**
 * Formatação para exibição. Dinheiro chega sempre em centavos, número inteiro,
 * e só vira texto aqui. Ver docs/00-context/business-rules.md seção 8.
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
})

/** Reais inteiros, para indicador. Precisão que não muda a decisão é ruído */
const BRL_WHOLE = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const NUMBER = new Intl.NumberFormat("pt-BR")

/**
 * A hora de um evento aparece no fuso da farmácia. A API manda instante em UTC
 * (contrato, convenções), e mostrar em UTC deixaria toda movimentação 3 horas
 * adiantada. O fuso mora em calendar.ts, junto com o "que dia é hoje".
 */
export { DEFAULT_TIME_ZONE }

/**
 * Data de validade é data, não instante: chega como meia-noite UTC e é lida em
 * UTC, senão o fuso de Brasília mostraria o dia anterior.
 */
const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

/** Centavos para "R$ 4.280,00". Tabela, detalhe e formulário */
export function formatMoney(cents: number): string {
  return BRL.format(cents / 100)
}

/** Centavos para "R$ 4.280". Indicador; o valor completo vai no title e no leitor de tela */
export function formatMoneyWhole(cents: number): string {
  return BRL_WHOLE.format(cents / 100)
}

export function formatNumber(value: number): string {
  return NUMBER.format(value)
}

/** Sinal de menos tipográfico (U+2212): o hífen é curto e some ao lado do número */
const MINUS = "\u2212"

/**
 * Quantidade sempre com unidade: "14 un", "2,5 kg".
 * Com `signed`, para movimentação: "+24 un", "−6 un".
 */
export function formatQuantity(
  value: number,
  unit: string,
  { signed = false }: { signed?: boolean } = {},
): string {
  const body = `${NUMBER.format(Math.abs(value))} ${unit}`
  if (!signed) return value < 0 ? `${MINUS}${body}` : body
  if (value > 0) return `+${body}`
  if (value < 0) return `${MINUS}${body}`
  return body
}

/** Data de validade, "05/10/2026": é o formato impresso na embalagem */
export function formatDate(iso: string): string {
  return DATE.format(new Date(iso))
}

/** "out" a partir de "out.", sem o ponto que o Intl põe na abreviação */
function shortMonth(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone })
    .format(date)
    .replace(".", "")
}

function partsIn(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ""
  return { day: get("day"), year: get("year"), hour: get("hour"), minute: get("minute") }
}

/**
 * Quando algo aconteceu: "9 out, 14:22". Com o ano só quando não é o ano
 * corrente: "9 out 2025, 14:22". Na hora da farmácia, não em UTC.
 */
export function formatEventTime(
  iso: string,
  {
    now = new Date(),
    timeZone = DEFAULT_TIME_ZONE,
  }: { now?: Date; timeZone?: string } = {},
): string {
  const date = new Date(iso)
  const { day, year, hour, minute } = partsIn(date, timeZone)
  const sameYear = year === partsIn(now, timeZone).year
  const when = `${day} ${shortMonth(date, timeZone)}${sameYear ? "" : ` ${year}`}`
  return `${when}, ${hour}:${minute}`
}

/** Só a hora do evento, "14:22", para a lista que já agrupa por dia */
export function formatEventClock(iso: string, timeZone: string = DEFAULT_TIME_ZONE): string {
  const { hour, minute } = partsIn(new Date(iso), timeZone)
  return `${hour}:${minute}`
}

/** O dia do evento no fuso da farmácia, "2026-10-08": a chave para agrupar */
export function eventDayKey(iso: string, timeZone: string = DEFAULT_TIME_ZONE): string {
  return calendarToday(new Date(iso), timeZone).toISOString().slice(0, 10)
}

const WEEKDAY = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" })

/**
 * O título do grupo do dia (issue 041): "Hoje", "Ontem", ou o dia da semana
 * com a data, "quarta, 08/10". Recebe a chave de `eventDayKey`.
 */
export function formatEventDay(
  dayKey: string,
  { now = new Date(), timeZone = DEFAULT_TIME_ZONE }: { now?: Date; timeZone?: string } = {},
): string {
  const day = new Date(`${dayKey}T00:00:00Z`)
  const today = calendarToday(now, timeZone)
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000)
  if (diff === 0) return "Hoje"
  if (diff === 1) return "Ontem"
  const weekday = WEEKDAY.format(day).replace("-feira", "")
  const date = `${String(day.getUTCDate()).padStart(2, "0")}/${String(day.getUTCMonth() + 1).padStart(2, "0")}`
  return `${weekday}, ${date}`
}

/** Eixo de gráfico: "20 out". O dado é o início da semana, uma data em UTC */
export function formatAxisDay(iso: string): string {
  const date = new Date(iso)
  return `${date.getUTCDate()} ${shortMonth(date, "UTC")}`
}

/**
 * Distância em dias, escrita como o usuário fala.
 * "venceu hoje", "vence em 3 dias", "venceu há 12 dias"
 *
 * O dia do vencimento já é Vencido (08/10/2026), então o texto acompanha o
 * selo: "vence hoje" ao lado de Vencido pareceria contradição.
 */
export function formatExpiryDistance(days: number): string {
  if (days === 0) return "venceu hoje"
  if (days === 1) return "vence amanhã"
  if (days === -1) return "venceu ontem"
  if (days > 0) return `vence em ${days} dias`
  return `venceu há ${Math.abs(days)} dias`
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}
