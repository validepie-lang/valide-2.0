/**
 * Ler a planilha no navegador, **só no modo de demonstração** (issue 075, item
 * 106, import-strategy.md seção 6). Com a API ligada, quem lê é o servidor.
 *
 * Lê o cabeçalho, as cinco primeiras linhas e, de cada coluna, quantas células
 * vieram vazias e quantas não são número: é o que o Mapear e a Revisão
 * precisam para mostrar o arquivo de verdade. CSV e XLSX, sem biblioteca: o
 * XLSX é um zip de XML, e o navegador já descomprime (`DecompressionStream`).
 */

export type CatalogSample = {
  columns: string[]
  /** as primeiras linhas de dado, cada uma com uma célula por coluna */
  rows: string[][]
  /** linhas de dado (sem o cabeçalho e sem linha toda vazia) */
  rowCount: number
  /** por coluna: células vazias e células preenchidas que não são número */
  stats: { empty: number[]; nonNumeric: number[] }
}

const SAMPLE_ROWS = 5
const CELL_MAX = 60

/** "7,42", "1.234,56", "R$ 18,63", "76", "-3", "12.5" */
export function isNumberCell(value: string): boolean {
  const v = value.replace(/^R\$\s*/i, "").trim()
  return /^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(v) || /^-?\d+([.,]\d+)?$/.test(v)
}

function summarize(table: string[][]): CatalogSample {
  const [header = [], ...data] = table
  const rows = data.filter((row) => row.some((cell) => cell.trim() !== ""))
  const width = Math.max(header.length, ...rows.slice(0, 50).map((r) => r.length), 0)
  const columns = Array.from({ length: width }, (_, i) => header[i]?.trim() || `Coluna ${i + 1}`)
  const empty = Array<number>(width).fill(0)
  const nonNumeric = Array<number>(width).fill(0)
  for (const row of rows) {
    for (let i = 0; i < width; i++) {
      const cell = (row[i] ?? "").trim()
      if (!cell) empty[i] += 1
      else if (!isNumberCell(cell)) nonNumeric[i] += 1
    }
  }
  return {
    columns,
    rows: rows
      .slice(0, SAMPLE_ROWS)
      .map((row) => columns.map((_, i) => (row[i] ?? "").trim().slice(0, CELL_MAX))),
    rowCount: rows.length,
    stats: { empty, nonNumeric },
  }
}

/* ---------------------------------- CSV ---------------------------------- */

/** UTF-8 quando é; senão, o formato do Excel antigo em português (Windows-1252) */
export function decodeText(bytes: Uint8Array): string {
  const text = (() => {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    } catch {
      return new TextDecoder("windows-1252").decode(bytes)
    }
  })()
  return text.replace(/^﻿/, "")
}

/** Ponto e vírgula (Excel em português), vírgula ou tabulação: o que mais aparece no cabeçalho */
function delimiterOf(firstLine: string): string {
  const counts = [";", ",", "\t"].map((d) => [d, firstLine.split(d).length] as const)
  return counts.sort((a, b) => b[1] - a[1])[0][0]
}

export function parseCsv(text: string): string[][] {
  const firstLine = text.slice(0, text.search(/\r?\n|$/))
  const delimiter = delimiterOf(firstLine)
  const table: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"' && cell === "") quoted = true
    else if (ch === delimiter) {
      row.push(cell)
      cell = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++
      row.push(cell)
      table.push(row)
      row = []
      cell = ""
    } else cell += ch
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell)
    table.push(row)
  }
  return table
}

export function readCsv(bytes: Uint8Array): CatalogSample {
  return summarize(parseCsv(decodeText(bytes)))
}

/* ---------------------------------- XLSX --------------------------------- */

type ZipEntry = { name: string; method: number; size: number; offset: number }

function zipEntries(bytes: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let end = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new Error("not a zip")
  const count = view.getUint16(end + 10, true)
  let at = view.getUint32(end + 16, true)
  const entries = new Map<string, ZipEntry>()
  for (let n = 0; n < count; n++) {
    if (view.getUint32(at, true) !== 0x02014b50) throw new Error("bad central directory")
    const method = view.getUint16(at + 10, true)
    const size = view.getUint32(at + 20, true)
    const nameLength = view.getUint16(at + 28, true)
    const extra = view.getUint16(at + 30, true)
    const comment = view.getUint16(at + 32, true)
    const offset = view.getUint32(at + 42, true)
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength))
    entries.set(name, { name, method, size, offset })
    at += 46 + nameLength + extra + comment
  }
  return entries
}

async function unzipText(bytes: Uint8Array, entry: ZipEntry): Promise<string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const start =
    entry.offset + 30 + view.getUint16(entry.offset + 26, true) + view.getUint16(entry.offset + 28, true)
  const raw = bytes.slice(start, start + entry.size)
  if (entry.method === 0) return new TextDecoder().decode(raw)
  if (entry.method !== 8) throw new Error("unsupported compression")
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))
  return new Response(stream).text()
}

function xmlText(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
}

/** Todo `<t>` de um trecho, juntos: o texto com formatação vem picado em vários */
function joinedText(fragment: string): string {
  return [...fragment.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => xmlText(m[1])).join("")
}

/** "A" é 0, "Z" é 25, "AA" é 26 */
function columnIndex(ref: string): number {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? ""
  return [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1
}

/** Data do Excel (dias desde 30/12/1899) para "31/05/2027" */
function excelDate(serial: number): string {
  const date = new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86_400_000)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(date.getUTCDate())}/${p(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`
}

export function parseSheet(sheetXml: string, shared: string[]): string[][] {
  const table: string[][] = []
  for (const rowMatch of sheetXml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const row: string[] = []
    let next = 0
    for (const c of (rowMatch[1] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1]
      const body = c[2] ?? ""
      const ref = attrs.match(/\br="([A-Z]+\d+)"/)?.[1]
      const index = ref ? columnIndex(ref) : next
      const type = attrs.match(/\bt="(\w+)"/)?.[1]
      const v = body.match(/<v>([\s\S]*?)<\/v>/)?.[1]
      const value =
        type === "s"
          ? (shared[Number(v)] ?? "")
          : type === "inlineStr"
            ? joinedText(body)
            : type === "b"
              ? v === "1"
                ? "VERDADEIRO"
                : "FALSO"
              : v !== undefined
                ? xmlText(v)
                : ""
      row[index] = value
      next = index + 1
    }
    table.push(Array.from(row, (cell) => cell ?? ""))
  }
  return table
}

/** Coluna de data que veio como número do Excel vira data, para a prévia não mostrar "46538" */
function datesAsText(table: string[][]): string[][] {
  const [header = []] = table
  const dateColumns = header.flatMap((name, i) => (/valid|venc|fabric|data/i.test(name) ? [i] : []))
  if (dateColumns.length === 0) return table
  return table.map((row, r) =>
    r === 0
      ? row
      : row.map((cell, i) =>
          dateColumns.includes(i) && /^\d{5}(\.\d+)?$/.test(cell) ? excelDate(Number(cell)) : cell,
        ),
  )
}

export async function readXlsx(bytes: Uint8Array): Promise<CatalogSample> {
  const entries = zipEntries(bytes)
  const text = async (name: string) => {
    const entry = entries.get(name)
    return entry ? unzipText(bytes, entry) : ""
  }
  // A primeira aba do caderno, pelo que o workbook e os relacionamentos dizem
  const workbook = await text("xl/workbook.xml")
  const rels = await text("xl/_rels/workbook.xml.rels")
  const firstId = workbook.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1]
  const target = firstId
    ? (rels.match(new RegExp(`<Relationship\\b[^>]*Id="${firstId}"[^>]*Target="([^"]+)"`))?.[1] ??
      rels.match(new RegExp(`<Relationship\\b[^>]*Target="([^"]+)"[^>]*Id="${firstId}"`))?.[1])
    : undefined
  const sheetName = target
    ? target.startsWith("/")
      ? target.slice(1)
      : `xl/${target.replace(/^\.\//, "")}`
    : "xl/worksheets/sheet1.xml"
  const shared = [...(await text("xl/sharedStrings.xml")).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    joinedText(m[1]),
  )
  const sheet = await text(sheetName)
  if (!sheet) throw new Error("no sheet")
  return summarize(datesAsText(parseSheet(sheet, shared)))
}

/** O arquivo inteiro; `null` quando não dá para ler (XLS antigo, arquivo corrompido) */
export async function readCatalog(name: string, bytes: Uint8Array): Promise<CatalogSample | null> {
  try {
    const sample = /\.xlsx$/i.test(name) ? await readXlsx(bytes) : readCsv(bytes)
    return sample.columns.length > 0 ? sample : null
  } catch {
    return null
  }
}
