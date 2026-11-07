/**
 * Perdas em planilha (issue 051, item 52), para o contador ou para conferir
 * no Excel. Feita no navegador com o mesmo relatório que a tela mostra: nenhum
 * endpoint novo, e o arquivo nunca diz algo diferente da tela.
 *
 * Ponto e vírgula e vírgula decimal, porque é assim que o Excel em português
 * abre CSV; o BOM no início faz os acentos aparecerem certos.
 */

import type { LossReport } from "@/lib/types"

const REASON: Record<string, string> = { expiry: "Vencimento", damage: "Avaria", theft: "Roubo" }

/** Centavos para "1234,50": número que a planilha soma, sem "R$" */
function reais(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",")
}

/** Data ISO para "05/10/2026" */
function day(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`
}

function cell(value: string | number): string {
  const text = String(value)
  return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function lossReportCsv(report: LossReport, pharmacy: string): string {
  const rows: (string | number)[][] = [
    ["Perdas", pharmacy],
    ["De", day(report.from), "Até", day(report.to)],
    ["Total (R$)", reais(report.total), "Unidades", report.units],
    [],
    ["Por motivo", "Valor (R$)", "Unidades"],
    ...report.byReason.map((r) => [REASON[r.reason] ?? r.reason, reais(r.value), r.units]),
    [],
    [report.bucket === "week" ? "Semana que começa em" : "Mês que começa em", "Valor (R$)"],
    ...report.series.map((s) => [day(s.start), reais(s.value)]),
    [],
    ["Produtos com maior perda", "Unidades", "Valor (R$)", "Motivo principal"],
    ...report.topProducts.map((p) => [
      p.productName,
      `${p.units} ${p.unit}`,
      reais(p.value),
      REASON[p.mainReason],
    ]),
  ]
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n")
}
