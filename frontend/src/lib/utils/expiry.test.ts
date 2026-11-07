/**
 * Testes da regra de status de validade.
 *
 * Roda com o runner nativo do Node: `npm test`. Sem dependência nova.
 *
 * Duas convenções valem para o arquivo inteiro:
 *
 * 1. Toda data é montada em UTC, igual ao que o resto da aplicação faz
 *    (`new Date(lot.expiresAt)` e `${expiry}T00:00:00Z`). A função compara
 *    componentes UTC, então misturar data local aqui esconderia bug em vez
 *    de encontrar.
 * 2. `today` é sempre injetado. Nenhum teste deste arquivo pode mudar de
 *    resultado só porque o calendário virou.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_SOON_THRESHOLD_DAYS,
  daysUntil,
  getExpiryStatus,
  STATUS_LABEL,
  STATUS_ORDER,
  type ExpiryStatus,
} from "./expiry.ts"
import { calendarToday } from "./calendar.ts"

/** Data em UTC, mesma convenção que a aplicação usa ao montar data de lote. */
function utc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`)
}

const TODAY = utc("2026-09-17")

/** Data a N dias de TODAY, para nenhum teste depender de contar calendário na mão. */
function inDays(days: number): Date {
  const date = new Date(TODAY)
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

describe("daysUntil", () => {
  it("devolve 0 para o próprio dia", () => {
    assert.equal(daysUntil(utc("2026-09-17"), TODAY), 0)
  })

  it("devolve 1 para amanhã e -1 para ontem", () => {
    assert.equal(daysUntil(utc("2026-09-18"), TODAY), 1)
    assert.equal(daysUntil(utc("2026-09-16"), TODAY), -1)
  })

  it("ignora a hora do dia dos dois lados", () => {
    const lateOnTheSameDay = new Date("2026-09-17T23:59:59Z")
    const earlyToday = new Date("2026-09-17T00:00:01Z")
    assert.equal(daysUntil(lateOnTheSameDay, earlyToday), 0)
    assert.equal(daysUntil(new Date("2026-09-18T00:00:01Z"), lateOnTheSameDay), 1)
  })

  it("atravessa a virada de mês", () => {
    assert.equal(daysUntil(utc("2026-10-01"), utc("2026-09-30")), 1)
  })

  it("atravessa a virada de ano", () => {
    assert.equal(daysUntil(utc("2027-01-01"), utc("2026-12-31")), 1)
  })

  it("conta o dia extra do ano bissexto", () => {
    // 2028 é bissexto: de 28/02 a 01/03 são dois dias, não um.
    assert.equal(daysUntil(utc("2028-03-01"), utc("2028-02-28")), 2)
    // 2026 não é: de 28/02 a 01/03 é um dia.
    assert.equal(daysUntil(utc("2026-03-01"), utc("2026-02-28")), 1)
  })

  it("mede distância longa sem acumular erro", () => {
    assert.equal(daysUntil(utc("2027-09-17"), TODAY), 365)
  })
})

describe("getExpiryStatus: produto sem validade informada", () => {
  const withoutDate = [null, undefined, "", "amanhã", "31/02/2026", new Date("data inválida")]

  for (const input of withoutDate) {
    it(`devolve "unknown" para ${JSON.stringify(input) ?? String(input)}`, () => {
      assert.equal(getExpiryStatus(input, DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "unknown")
    })
  }

  it("Regra 2 da cor: sem lote nunca é No prazo", () => {
    // Confundir "não sei a validade" com "está no prazo" é o pior erro que
    // esta interface pode cometer. O teste afirma a negativa de propósito:
    // não basta ser "unknown" hoje, tem que nunca virar "ok".
    for (const input of withoutDate) {
      const status = getExpiryStatus(input, DEFAULT_SOON_THRESHOLD_DAYS, TODAY)
      assert.notEqual(status, "ok")
      assert.equal(STATUS_LABEL[status], "Sem validade")
    }
  })
})

describe("getExpiryStatus: os quatro status", () => {
  it("data passada é Vencido", () => {
    assert.equal(getExpiryStatus(inDays(-1), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "expired")
    assert.equal(getExpiryStatus(inDays(-60), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "expired")
  })

  it("vence hoje já é Vencido", () => {
    // Mudou em 08/10/2026 para bater com o banco: a vw_alerta_validade trata
    // dias_para_vencer <= 0 como VENCIDO. Até 07/10 era A vencer. Se o banco
    // mudar de novo, esta é a linha que denuncia a divergência.
    assert.equal(getExpiryStatus(inDays(0), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "expired")
  })

  it("vence amanhã é A vencer", () => {
    assert.equal(getExpiryStatus(inDays(1), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "soon")
  })

  it("dentro da janela é A vencer", () => {
    assert.equal(getExpiryStatus(inDays(1), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "soon")
    assert.equal(getExpiryStatus(inDays(10), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "soon")
  })

  it("o limite da janela é inclusivo: 30 dias ainda é A vencer", () => {
    assert.equal(getExpiryStatus(inDays(30), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "soon")
  })

  it("um dia além da janela já é No prazo", () => {
    assert.equal(getExpiryStatus(inDays(31), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "ok")
    assert.equal(getExpiryStatus(inDays(400), DEFAULT_SOON_THRESHOLD_DAYS, TODAY), "ok")
  })
})

describe("getExpiryStatus: janela configurável por conta", () => {
  it("a janela padrão é de 30 dias", () => {
    // Decisão fechada pela equipe em 16/09/2026.
    assert.equal(DEFAULT_SOON_THRESHOLD_DAYS, 30)
  })

  it("uma janela maior alarga o A vencer", () => {
    assert.equal(getExpiryStatus(inDays(45), 60, TODAY), "soon")
    assert.equal(getExpiryStatus(inDays(61), 60, TODAY), "ok")
  })

  it("uma janela de 0 elimina o A vencer: hoje é Vencido, amanhã é No prazo", () => {
    assert.equal(getExpiryStatus(inDays(0), 0, TODAY), "expired")
    assert.equal(getExpiryStatus(inDays(1), 0, TODAY), "ok")
    assert.equal(getExpiryStatus(inDays(-1), 0, TODAY), "expired")
  })
})

describe("getExpiryStatus: formatos de entrada", () => {
  it("trata string ISO e objeto Date do mesmo jeito", () => {
    const asDate = getExpiryStatus(utc("2026-10-01"), DEFAULT_SOON_THRESHOLD_DAYS, TODAY)
    const asIsoString = getExpiryStatus("2026-10-01T00:00:00Z", DEFAULT_SOON_THRESHOLD_DAYS, TODAY)
    const asDateOnlyString = getExpiryStatus("2026-10-01", DEFAULT_SOON_THRESHOLD_DAYS, TODAY)

    assert.equal(asDate, "soon")
    assert.equal(asIsoString, asDate)
    assert.equal(asDateOnlyString, asDate)
  })
})

describe("vocabulário de status", () => {
  it("os rótulos são exatamente os quatro acordados", () => {
    assert.deepEqual(STATUS_LABEL, {
      expired: "Vencido",
      soon: "A vencer",
      ok: "No prazo",
      unknown: "Sem validade",
    })
  })

  it("nenhum rótulo usa travessão", () => {
    for (const label of Object.values(STATUS_LABEL)) {
      assert.ok(!label.includes("—"), `o rótulo "${label}" usa travessão`)
    }
  })

  it("a ordem é a de urgência, do vencido ao sem validade", () => {
    assert.deepEqual(STATUS_ORDER, ["expired", "soon", "ok", "unknown"])
  })

  it("a ordem cobre todos os status, sem repetir nenhum", () => {
    // Quebra de propósito se alguém adicionar um status novo ao tipo e
    // esquecer de dar rótulo ou lugar na ordem. Uma legenda incompleta some
    // com uma fatia do estoque sem avisar ninguém.
    const labelled = Object.keys(STATUS_LABEL).sort()
    assert.deepEqual([...STATUS_ORDER].sort(), labelled)
    assert.equal(new Set(STATUS_ORDER).size, STATUS_ORDER.length)
  })

  it("todo status devolvido pela função tem rótulo", () => {
    const returned: ExpiryStatus[] = [
      getExpiryStatus(inDays(-1), DEFAULT_SOON_THRESHOLD_DAYS, TODAY),
      getExpiryStatus(inDays(10), DEFAULT_SOON_THRESHOLD_DAYS, TODAY),
      getExpiryStatus(inDays(90), DEFAULT_SOON_THRESHOLD_DAYS, TODAY),
      getExpiryStatus(null, DEFAULT_SOON_THRESHOLD_DAYS, TODAY),
    ]

    for (const status of returned) {
      assert.ok(STATUS_ORDER.includes(status))
      assert.ok(STATUS_LABEL[status].length > 0)
    }
  })
})

describe("hoje é o dia do calendário da farmácia", () => {
  // 01:00 de 09/10 em UTC são 22:00 de 08/10 em Brasília. Até 08/10/2026 a
  // conta usava a data UTC, e às 22h o lote de amanhã já aparecia como Vencido.
  const tenPmInBrasilia = calendarToday(new Date("2026-10-09T01:00:00Z"))

  it("às 22h, o lote que vence amanhã é A vencer, a um dia", () => {
    assert.equal(daysUntil(utc("2026-10-09"), tenPmInBrasilia), 1)
    assert.equal(getExpiryStatus(utc("2026-10-09"), DEFAULT_SOON_THRESHOLD_DAYS, tenPmInBrasilia), "soon")
  })

  it("às 22h, o lote que vence hoje continua Vencido", () => {
    assert.equal(daysUntil(utc("2026-10-08"), tenPmInBrasilia), 0)
    assert.equal(getExpiryStatus(utc("2026-10-08"), DEFAULT_SOON_THRESHOLD_DAYS, tenPmInBrasilia), "expired")
  })
})
