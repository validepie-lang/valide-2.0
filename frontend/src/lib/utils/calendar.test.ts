/**
 * Testes de "que dia é hoje" no fuso da farmácia.
 *
 * O instante é sempre injetado em UTC, então o resultado não depende do fuso
 * da máquina que roda o teste.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { calendarToday } from "./calendar.ts"

/** Data de calendário como a aplicação representa: meia-noite UTC */
function day(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toISOString()
}

describe("calendarToday", () => {
  it("de dia, é o mesmo dia em UTC e em Brasília", () => {
    assert.equal(calendarToday(new Date("2026-10-08T15:00:00Z")).toISOString(), day("2026-10-08"))
  })

  it("às 22h em Brasília ainda é hoje, mesmo com o UTC já no dia seguinte", () => {
    // 01:00 de 09/10 em UTC são 22:00 de 08/10 em Brasília
    assert.equal(calendarToday(new Date("2026-10-09T01:00:00Z")).toISOString(), day("2026-10-08"))
  })

  it("vira o dia à meia-noite de Brasília, não à de UTC", () => {
    assert.equal(calendarToday(new Date("2026-10-09T02:59:00Z")).toISOString(), day("2026-10-08"))
    assert.equal(calendarToday(new Date("2026-10-09T03:00:00Z")).toISOString(), day("2026-10-09"))
  })

  it("atravessa a virada de mês e de ano", () => {
    assert.equal(calendarToday(new Date("2026-11-01T01:00:00Z")).toISOString(), day("2026-10-31"))
    assert.equal(calendarToday(new Date("2027-01-01T02:00:00Z")).toISOString(), day("2026-12-31"))
  })

  it("aceita outro fuso", () => {
    // 03:30 em UTC: em Manaus (UTC-4) ainda é 23:30 do dia anterior
    const instant = new Date("2026-10-09T03:30:00Z")
    assert.equal(calendarToday(instant, "America/Manaus").toISOString(), day("2026-10-08"))
    assert.equal(calendarToday(instant).toISOString(), day("2026-10-09"))
  })
})
