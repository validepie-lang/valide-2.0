/**
 * Testes dos formatos de dado (design-system.md, seção 14.4).
 *
 * `now` e o fuso são sempre injetados quando a função depende deles: nenhum
 * teste pode mudar de resultado porque o ano virou ou porque a máquina está
 * em outro fuso.
 *
 * O Intl separa número de moeda com espaço sem quebra (U+00A0). Os textos
 * esperados usam `nbsp` para isso ficar visível no teste.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  formatAxisDay,
  formatDate,
  eventDayKey,
  formatEventClock,
  formatEventDay,
  formatEventTime,
  formatExpiryDistance,
  formatMoney,
  formatMoneyWhole,
  formatQuantity,
} from "./format.ts"

const nbsp = " "
const minus = "−"

describe("dinheiro", () => {
  it("tabela e detalhe mostram centavos", () => {
    assert.equal(formatMoney(857267), `R$${nbsp}8.572,67`)
  })

  it("indicador mostra reais inteiros, arredondando", () => {
    assert.equal(formatMoneyWhole(857267), `R$${nbsp}8.573`)
    assert.equal(formatMoneyWhole(56392), `R$${nbsp}564`)
  })

  it("indicador nunca abrevia com mil", () => {
    assert.equal(formatMoneyWhole(1006017), `R$${nbsp}10.060`)
  })

  it("zero é R$ 0, não vazio", () => {
    assert.equal(formatMoneyWhole(0), `R$${nbsp}0`)
  })
})

describe("data de validade", () => {
  it("dd/mm/aaaa, como na embalagem", () => {
    assert.equal(formatDate("2026-10-05T00:00:00Z"), "05/10/2026")
  })

  it("não volta um dia por causa do fuso de Brasília", () => {
    // Meia-noite UTC é 21:00 do dia anterior em Brasília. Validade é data, não hora.
    assert.equal(formatDate("2026-11-01T00:00:00Z"), "01/11/2026")
  })
})

describe("hora de evento", () => {
  const now = new Date("2026-10-08T15:00:00Z")

  it("mostra a hora de Brasília, não a de UTC", () => {
    // 17:22 em UTC é 14:22 em Brasília
    assert.equal(formatEventTime("2026-10-09T17:22:00Z", { now }), "9 out, 14:22")
  })

  it("tira o ponto e o 'de' da abreviação do mês", () => {
    assert.equal(formatEventTime("2026-09-30T13:00:00Z", { now }), "30 set, 10:00")
  })

  it("mostra o ano só quando não é o ano corrente", () => {
    assert.equal(formatEventTime("2025-10-09T17:22:00Z", { now }), "9 out 2025, 14:22")
  })

  it("decide o ano no fuso da farmácia", () => {
    // 01/01 às 01:00 em UTC ainda é 31/12 às 22:00 em Brasília
    const newYearsEve = new Date("2026-12-31T20:00:00Z")
    assert.equal(
      formatEventTime("2027-01-01T01:00:00Z", { now: newYearsEve }),
      "31 dez, 22:00",
    )
  })

  it("aceita outro fuso", () => {
    assert.equal(
      formatEventTime("2026-10-09T17:22:00Z", { now, timeZone: "America/Manaus" }),
      "9 out, 13:22",
    )
  })

  it("usa 24 horas", () => {
    assert.equal(formatEventTime("2026-10-09T03:05:00Z", { now }), "9 out, 00:05")
  })
})

describe("eixo de gráfico", () => {
  it("dia e mês abreviado, sem zero à esquerda", () => {
    assert.equal(formatAxisDay("2026-10-05T00:00:00Z"), "5 out")
    assert.equal(formatAxisDay("2026-11-20T00:00:00Z"), "20 nov")
  })
})

describe("quantidade", () => {
  it("sempre com unidade", () => {
    assert.equal(formatQuantity(14, "un"), "14 un")
    assert.equal(formatQuantity(2.5, "kg"), "2,5 kg")
    assert.equal(formatQuantity(1200, "un"), "1.200 un")
  })

  it("movimentação leva sinal, e o de menos é o tipográfico", () => {
    assert.equal(formatQuantity(24, "un", { signed: true }), "+24 un")
    assert.equal(formatQuantity(-6, "un", { signed: true }), `${minus}6 un`)
  })

  it("zero não ganha sinal", () => {
    assert.equal(formatQuantity(0, "un", { signed: true }), "0 un")
  })
})

describe("distância até a validade", () => {
  it("fala como o usuário fala", () => {
    assert.equal(formatExpiryDistance(12), "vence em 12 dias")
    assert.equal(formatExpiryDistance(1), "vence amanhã")
    assert.equal(formatExpiryDistance(0), "venceu hoje")
    assert.equal(formatExpiryDistance(-1), "venceu ontem")
    assert.equal(formatExpiryDistance(-3), "venceu há 3 dias")
  })
})

describe("dia e hora do evento (issue 041)", () => {
  const now = new Date("2026-10-10T15:00:00Z")

  it("a hora sai no fuso da farmácia", () => {
    assert.equal(formatEventClock("2026-10-10T17:22:00Z", "America/Sao_Paulo"), "14:22")
  })

  it("o dia vira no fuso da farmácia, não em UTC", () => {
    // 01h UTC do dia 10 ainda é dia 9 em Brasília
    assert.equal(eventDayKey("2026-10-10T01:30:00Z", "America/Sao_Paulo"), "2026-10-09")
  })

  it("hoje e ontem por extenso", () => {
    assert.equal(formatEventDay("2026-10-10", { now, timeZone: "America/Sao_Paulo" }), "Hoje")
    assert.equal(formatEventDay("2026-10-09", { now, timeZone: "America/Sao_Paulo" }), "Ontem")
  })

  it("antes disso, o dia da semana sem \"-feira\" e a data", () => {
    assert.equal(formatEventDay("2026-10-07", { now, timeZone: "America/Sao_Paulo" }), "quarta, 07/10")
    assert.equal(formatEventDay("2026-10-04", { now, timeZone: "America/Sao_Paulo" }), "domingo, 04/10")
  })
})
