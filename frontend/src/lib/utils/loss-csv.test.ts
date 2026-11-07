/** A planilha de Perdas (issue 051): o que o Excel em português precisa para abrir certo */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { lossReportCsv } from "./loss-csv.ts"

const report = {
  period: "30d" as const,
  from: "2026-09-11T00:00:00Z",
  to: "2026-10-10T00:00:00Z",
  total: 239012,
  previousTotal: null,
  units: 87,
  byReason: [{ reason: "expiry" as const, value: 218100, units: 76 }],
  bucket: "week" as const,
  series: [{ start: "2026-10-04T00:00:00Z", value: 18500 }],
  topProducts: [
    {
      productId: "p1",
      productName: 'Xarelto 20mg; "caixa"',
      unit: "un" as const,
      units: 3,
      value: 56200,
      mainReason: "expiry" as const,
    },
  ],
}

describe("lossReportCsv", () => {
  const csv = lossReportCsv(report, "Farmácia Preço Popular")

  it("começa com o BOM, para os acentos", () => {
    assert.equal(csv.charCodeAt(0), 0xfeff)
  })

  it("usa ponto e vírgula e vírgula decimal, sem R$", () => {
    assert.match(csv, /Total \(R\$\);2390,12;Unidades;87/)
  })

  it("datas como na embalagem", () => {
    assert.match(csv, /De;11\/09\/2026;Até;10\/10\/2026/)
  })

  it("protege texto com ponto e vírgula e aspas", () => {
    assert.match(csv, /"Xarelto 20mg; ""caixa""";3 un;562,00;Vencimento/)
  })
})
