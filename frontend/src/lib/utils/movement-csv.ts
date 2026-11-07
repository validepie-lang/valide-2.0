/**
 * Movimentações em planilha (issue 073, item 77), como o "Export" do SaaS Data
 * Table (Behance). Mesmo formato da planilha de Perdas (issue 051): ponto e
 * vírgula, vírgula decimal e o BOM, para o Excel em português abrir certo.
 * A quantidade vai com sinal, como número, para a planilha somar.
 */

import { eventDayKey, formatEventClock } from "./format.ts"
import { movementNoteText } from "./movement-fix.ts"
import { EXIT_REASON_LABEL, type Movement } from "../types/index.ts"

/** "2026-09-30" para "30/09/2026" */
function day(key: string): string {
  const [year, month, date] = key.split("-")
  return `${date}/${month}/${year}`
}

function cell(value: string | number): string {
  const text = String(value)
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function kind(m: Movement): string {
  if (m.type === "in") return "Entrada"
  if (m.type === "adjust") return "Ajuste"
  return m.reason ? `Saída, ${EXIT_REASON_LABEL[m.reason].toLowerCase()}` : "Saída"
}

function signed(m: Movement): string {
  const value = m.type === "out" ? -m.quantity : m.quantity
  return String(value).replace(".", ",")
}

export function movementsCsv({
  movements,
  pharmacy,
  from,
  to,
  total,
}: {
  movements: Movement[]
  pharmacy: string
  /** primeiro e último dia, "2026-09-01" */
  from: string
  to: string
  /** quantas o filtro achou; acima do que veio, a planilha diz */
  total: number
}): string {
  const n = (value: number) => value.toLocaleString("pt-BR")
  const count =
    total > movements.length
      ? `As ${n(movements.length)} mais recentes de ${n(total)} movimentações`
      : `${n(total)} ${total === 1 ? "movimentação" : "movimentações"}`
  const rows: (string | number)[][] = [
    ["Movimentações", pharmacy],
    ["De", day(from), "Até", day(to)],
    [count],
    [],
    [
      "Data",
      "Hora",
      "Produto",
      "Lote",
      "Movimento",
      "Quantidade",
      "Unidade",
      "Quem fez",
      "Observação",
      "Corrigida em",
    ],
    ...movements.map((m) => [
      day(eventDayKey(m.createdAt)),
      formatEventClock(m.createdAt),
      m.productName,
      m.lotCode,
      kind(m),
      signed(m),
      m.unit,
      m.userName,
      movementNoteText(m) ?? "",
      m.correctedAt ? `${day(eventDayKey(m.correctedAt))} ${formatEventClock(m.correctedAt)}` : "",
    ]),
  ]
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n")
}
