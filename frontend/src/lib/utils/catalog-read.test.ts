/**
 * Leitura da planilha no modo de demonstração (issue 075, item 106).
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { decodeText, isNumberCell, parseCsv, readCatalog, readCsv } from "./catalog-read.ts"

const bytes = (text: string) => new TextEncoder().encode(text)

describe("CSV", () => {
  it("ponto e vírgula do Excel em português, com aspas e linha vazia no fim", () => {
    const sample = readCsv(
      bytes(
        'DESCRICAO;COD_BARRAS;VLR_CUSTO\r\n"DIPIRONA; 500MG";7891058001148;7,42\r\nDORFLEX;;18,63\r\n;;\r\n',
      ),
    )
    assert.deepEqual(sample.columns, ["DESCRICAO", "COD_BARRAS", "VLR_CUSTO"])
    assert.deepEqual(sample.rows[0], ["DIPIRONA; 500MG", "7891058001148", "7,42"])
    assert.equal(sample.rowCount, 2)
    assert.deepEqual(sample.stats.empty, [0, 1, 0])
    assert.deepEqual(sample.stats.nonNumeric, [2, 0, 0])
  })

  it("vírgula e tabulação também, e aspas dobradas", () => {
    assert.deepEqual(parseCsv('a,b\n"x ""y""",2'), [
      ["a", "b"],
      ['x "y"', "2"],
    ])
    assert.deepEqual(parseCsv("a\tb\n1\t2"), [
      ["a", "b"],
      ["1", "2"],
    ])
  })

  it("UTF-8 com BOM e o formato do Excel antigo (acentos certos nos dois)", () => {
    assert.equal(decodeText(bytes("﻿DESCRIÇÃO")), "DESCRIÇÃO")
    assert.equal(
      decodeText(new Uint8Array([0x44, 0x45, 0x53, 0x43, 0x52, 0x49, 0xc7, 0xc3, 0x4f])),
      "DESCRIÇÃO",
    )
  })

  it("cabeçalho vazio vira Coluna N", () => {
    assert.deepEqual(readCsv(bytes("Nome;\nA;1")).columns, ["Nome", "Coluna 2"])
  })

  it("número no jeito brasileiro", () => {
    for (const ok of ["76", "7,42", "1.234,56", "R$ 18,63", "-3", "12.5"]) assert.ok(isNumberCell(ok), ok)
    for (const no of ["UN", "7,4,2", "abc", "12a"]) assert.ok(!isNumberCell(no), no)
  })
})

/* Um zip mínimo, com uma parte guardada e outra comprimida, como o Excel faz */
async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(data)]).stream().pipeThrough(new CompressionStream("deflate-raw"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function zip(files: Record<string, string>): Promise<Uint8Array> {
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = bytes(name)
    const raw = bytes(content)
    const compress = name.endsWith("sheet1.xml")
    const data = compress ? await deflate(raw) : raw
    const local = new Uint8Array(30 + nameBytes.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(8, compress ? 8 : 0, true)
    lv.setUint32(18, data.length, true)
    lv.setUint32(22, raw.length, true)
    lv.setUint16(26, nameBytes.length, true)
    local.set(nameBytes, 30)
    const dir = new Uint8Array(46 + nameBytes.length)
    const dv = new DataView(dir.buffer)
    dv.setUint32(0, 0x02014b50, true)
    dv.setUint16(10, compress ? 8 : 0, true)
    dv.setUint32(20, data.length, true)
    dv.setUint32(24, raw.length, true)
    dv.setUint16(28, nameBytes.length, true)
    dv.setUint32(42, offset, true)
    dir.set(nameBytes, 46)
    parts.push(local, data)
    central.push(dir)
    offset += local.length + data.length
  }
  const size = central.reduce((n, c) => n + c.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, central.length, true)
  ev.setUint16(10, central.length, true)
  ev.setUint32(12, size, true)
  ev.setUint32(16, offset, true)
  const all = [...parts, ...central, end]
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of all) {
    out.set(p, at)
    at += p.length
  }
  return out
}

describe("XLSX", () => {
  it("lê a primeira aba, com texto compartilhado, texto na célula, número e data", async () => {
    const file = await zip({
      "xl/workbook.xml":
        '<workbook><sheets><sheet name="Produtos" sheetId="1" r:id="rId3"/></sheets></workbook>',
      "xl/_rels/workbook.xml.rels":
        '<Relationships><Relationship Id="rId3" Type="x" Target="worksheets/sheet1.xml"/></Relationships>',
      "xl/sharedStrings.xml":
        '<sst><si><t>DESCRICAO</t></si><si><t>VALIDADE</t></si><si><r><t>DIPIRONA </t></r><r><t xml:space="preserve">&amp; CIA</t></r></si></sst>',
      "xl/worksheets/sheet1.xml":
        '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="s"><v>1</v></c></row>' +
        '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2"><v>76</v></c><c r="C2"><v>46538</v></c></row>' +
        '<row r="3"><c r="A3" t="inlineStr"><is><t>DORFLEX</t></is></c></row><row r="4"/></sheetData></worksheet>',
    })
    const sample = await readCatalog("catalogo.xlsx", file)
    assert.ok(sample)
    assert.deepEqual(sample.columns, ["DESCRICAO", "Coluna 2", "VALIDADE"])
    assert.deepEqual(sample.rows, [
      ["DIPIRONA & CIA", "76", "31/05/2027"],
      ["DORFLEX", "", ""],
    ])
    assert.equal(sample.rowCount, 2)
    assert.deepEqual(sample.stats.empty, [0, 1, 1])
  })

  it("arquivo que não é planilha vira null, sem erro", async () => {
    assert.equal(await readCatalog("catalogo.xlsx", bytes("isto não é um zip")), null)
  })
})
