import { apiGet, apiGetList, apiPatch, apiPost, apiPostForm } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { readImportDraft, writeImportDraft, type ImportDraft } from "@/lib/services/import-store"
import type { CatalogSample } from "@/lib/utils/catalog-read"
import { checkCatalogFiles, sameColumns } from "@/lib/utils/import-draft"
import { previewFromSample, suggestMapping } from "@/lib/utils/import-sample"
import {
  DETECTED_COLUMNS,
  mockImportHistory,
  mockImportJob,
  PREVIEW_ROWS,
  SUGGESTED_MAPPING,
  VALIDE_FIELDS,
} from "@/lib/mocks/imports"
import type { ImportJob, ImportPreviewRow, ImportRowFilter, ImportStatus, Paginated } from "@/lib/types"

/**
 * Importação de catálogo.
 *
 * Os endpoints ainda são proposta, não acordo: falta o Pedro e o Antônio
 * fecharem a regra de duplicata (item 26, pendente), que é o que decide criar
 * ou atualizar cada linha. Enquanto isso, a área fica desligada e as telas
 * rodam com dado simulado. Ver docs/08-project/pauta-reuniao.md item 2.1.
 *
 * Desde a issue 075 (contrato v29) o arquivo sobe em partes de 1 MB, até 5
 * planilhas numa importação, e a importação pode ser desmarcada linha a
 * linha, guardada como rascunho e cancelada. No modo de demonstração, a
 * importação em andamento fica num cookie (`import-store.ts`).
 */

const UNFINISHED: ImportStatus[] = ["uploading", "mapping", "previewing"]
/** Quanto a importação de demonstração "roda" depois de confirmada: dá tempo de cancelar */
const DEMO_RUN_MS = 12_000

/* --------------------------------------------------------------------------
   Demonstração: a importação do cookie vira o ImportJob que o servidor daria
   -------------------------------------------------------------------------- */

function demoRows(draft: ImportDraft | null): ImportPreviewRow[] {
  if (!draft?.sample) return PREVIEW_ROWS
  return previewFromSample(draft.sample, draft.mapping ?? suggestMapping(draft.sample.columns)).rows
}

/** O status de agora: a importação confirmada termina sozinha quando passa o tempo */
function settle(draft: ImportDraft): ImportDraft {
  if (draft.status === "running" && draft.runningUntil && Date.parse(draft.runningUntil) <= Date.now()) {
    return { ...draft, status: "done", finishedAt: draft.runningUntil, runningUntil: null }
  }
  return draft
}

function jobFromDraft(draft: ImportDraft): ImportJob {
  const base = mockImportJob()
  const excludedRows = draft.excluded.length
  const status = settle(draft).status
  const files = draft.files.map(({ name, size }) => ({ name, size }))
  const fileName = files.map((f) => f.name).join(", ") || base.fileName
  const canceledOrFailed = status === "canceled"
  if (!draft.sample) {
    // Arquivo que o navegador não leu: segue com os números da importação de exemplo
    const validRows = Math.max(0, base.validRows - excludedRows)
    return {
      ...base,
      id: draft.id,
      status,
      fileName,
      files,
      mapping: draft.mapping ?? base.mapping,
      validRows,
      createdRows: canceledOrFailed ? 0 : Math.max(0, base.createdRows - excludedRows),
      warningRows: 2,
      excludedRows,
      createdAt: draft.createdAt,
      finishedAt: settle(draft).finishedAt,
    }
  }
  const mapping = draft.mapping ?? suggestMapping(draft.sample.columns)
  const { errorRows, warningRows } = previewFromSample(draft.sample, mapping)
  const validRows = Math.max(0, draft.sample.rowCount - errorRows - excludedRows)
  return {
    id: draft.id,
    source: "file",
    status,
    fileName,
    files,
    detectedColumns: draft.sample.columns,
    mapping,
    totalRows: draft.sample.rowCount,
    validRows,
    errorRows,
    warningRows,
    excludedRows,
    // Sem a regra de produto repetido (item 26), toda linha que entra é nova na demonstração
    createdRows: canceledOrFailed ? 0 : validRows,
    updatedRows: 0,
    createdAt: draft.createdAt,
    finishedAt: settle(draft).finishedAt,
  }
}

async function demoDraft(id: string): Promise<ImportDraft | null> {
  const draft = await readImportDraft()
  return draft && draft.id === id ? draft : null
}

/** A importação de exemplo (sem arquivo enviado) também guarda mapeamento e desmarcadas */
async function demoDraftOrExample(id: string): Promise<ImportDraft> {
  const draft = await demoDraft(id)
  if (draft) return draft
  const example = mockImportJob()
  return {
    id,
    status: example.status,
    createdAt: example.createdAt,
    finishedAt: null,
    runningUntil: null,
    files: [{ name: example.fileName ?? "catalogo.xlsx", size: 0, received: 0 }],
    sample: null,
    mapping: null,
    excluded: [],
  }
}

function notFound(): never {
  throw new ApiError(
    "notFound",
    404,
    "Esta importação não está mais disponível. Comece de novo pelo envio do arquivo.",
    "IMPORT_NOT_FOUND",
  )
}

/* --------------------------------------------------------------------------
   Endpoints
   -------------------------------------------------------------------------- */

/** GET /imports/:id */
export async function getImportJob(id = mockImportJob().id): Promise<ImportJob> {
  if (isLive("imports")) {
    return apiGet<ImportJob>(`/imports/${encodeURIComponent(id)}`)
  }
  const draft = await demoDraft(id)
  return draft ? jobFromDraft(draft) : mockImportJob()
}

/**
 * POST /imports (v29): abre a importação com a lista das planilhas
 * (`{ source: "file", files: [{ name, size }] }`) e devolve o `ImportJob` em
 * `uploading`. As partes vêm depois, por `uploadImportPart`.
 */
export async function beginImport(files: { name: string; size: number }[]): Promise<ImportJob> {
  if (isLive("imports")) {
    return apiPost<ImportJob>("/imports", { source: "file", files })
  }
  const problem = checkCatalogFiles(files)
  if (problem) throw new ApiError("invalid", 422, problem, "FILE_NOT_ACCEPTED")
  const draft: ImportDraft = {
    id: `imp_${Date.now().toString(36)}`,
    status: "uploading",
    createdAt: new Date().toISOString(),
    finishedAt: null,
    runningUntil: null,
    files: files.map((f) => ({ ...f, received: 0 })),
    sample: null,
    mapping: null,
    excluded: [],
  }
  await writeImportDraft(draft)
  return jobFromDraft(draft)
}

/**
 * POST /imports/:id/parts (v29), multipart: `fileIndex`, `partIndex` e `part`,
 * até 1 MB. Devolve quantos bytes daquele arquivo já chegaram. Na
 * demonstração, a parte é conferida e descartada: só a conta fica.
 */
export async function uploadImportPart(
  id: string,
  fileIndex: number,
  partIndex: number,
  part: Blob,
): Promise<{ received: number }> {
  if (isLive("imports")) {
    const form = new FormData()
    form.set("fileIndex", String(fileIndex))
    form.set("partIndex", String(partIndex))
    form.set("part", part)
    return apiPostForm<{ received: number }>(`/imports/${encodeURIComponent(id)}/parts`, form)
  }
  const draft = await demoDraft(id)
  if (!draft) notFound()
  if (draft.status !== "uploading") {
    throw new ApiError("conflict", 409, "Esta importação não está mais recebendo arquivos.", "IMPORT_NOT_UPLOADING")
  }
  const file = draft.files[fileIndex]
  if (!file) throw new ApiError("invalid", 422, "Esta parte não é de nenhum arquivo da importação.", "PART_INVALID")
  const received = Math.min(file.size, file.received + part.size)
  const files = draft.files.map((f, i) => (i === fileIndex ? { ...f, received } : f))
  await writeImportDraft({ ...draft, files })
  return { received }
}

/**
 * POST /imports/:id/read (v29): com todas as partes, o servidor lê as
 * planilhas, confere que têm as mesmas colunas (`422 COLUMNS_DIFFER`), sugere
 * o mapeamento e devolve o `ImportJob` em `mapping`.
 *
 * `samples` só existe no modo de demonstração (item 106): o que o navegador
 * leu de cada arquivo. Com a API ligada, não vai nada.
 */
export async function readImport(id: string, samples?: (CatalogSample | null)[]): Promise<ImportJob> {
  if (isLive("imports")) {
    return apiPost<ImportJob>(`/imports/${encodeURIComponent(id)}/read`)
  }
  const draft = await demoDraft(id)
  if (!draft) notFound()
  if (draft.files.some((f) => f.received < f.size)) {
    throw new ApiError("conflict", 409, "Ainda faltam partes do arquivo. Envie de novo.", "UPLOAD_INCOMPLETE")
  }
  const read = samples && samples.length === draft.files.length && samples.every(Boolean) ? (samples as CatalogSample[]) : null
  if (read) {
    const differ = sameColumns(read.map((s, i) => ({ name: draft.files[i].name, columns: s.columns })))
    if (differ) throw new ApiError("invalid", 422, differ, "COLUMNS_DIFFER")
  }
  const [first] = read ?? []
  // Várias planilhas: as colunas da primeira, as linhas de exemplo dela e a conta de todas
  const sample: CatalogSample | null = first
    ? {
        columns: first.columns,
        rows: first.rows,
        rowCount: read!.reduce((n, s) => n + s.rowCount, 0),
        stats: {
          empty: first.columns.map((_, i) => read!.reduce((n, s) => n + (s.stats.empty[i] ?? 0), 0)),
          nonNumeric: first.columns.map((_, i) => read!.reduce((n, s) => n + (s.stats.nonNumeric[i] ?? 0), 0)),
        },
      }
    : null
  const next: ImportDraft = { ...draft, status: "mapping", sample, mapping: sample ? suggestMapping(sample.columns) : null }
  await writeImportDraft(next)
  return jobFromDraft(next)
}

/** PATCH /imports/:id/mapping: coluna do arquivo para campo do Valide */
export async function saveImportMapping(id: string, mapping: Record<string, string>): Promise<ImportJob> {
  if (isLive("imports")) {
    return apiPatch<ImportJob>(`/imports/${encodeURIComponent(id)}/mapping`, { mapping })
  }
  const draft = await demoDraftOrExample(id)
  const next: ImportDraft = { ...draft, status: "previewing", mapping, excluded: [] }
  await writeImportDraft(next)
  return jobFromDraft(next)
}

/**
 * PATCH /imports/:id/rows (v29, item 25): `{ rowNumber, excluded }` desmarca
 * ou marca de novo uma linha. Linha com erro já fica de fora e não aceita.
 */
export async function setImportRowExcluded(id: string, rowNumber: number, excluded: boolean): Promise<ImportJob> {
  if (isLive("imports")) {
    return apiPatch<ImportJob>(`/imports/${encodeURIComponent(id)}/rows`, { rowNumber, excluded })
  }
  const draft = await demoDraftOrExample(id)
  const row = demoRows(draft).find((r) => r.rowNumber === rowNumber)
  if (!row || row.action === "skip") {
    throw new ApiError("invalid", 422, "Esta linha tem erro e já fica de fora.", "ROW_NOT_SELECTABLE")
  }
  const set = new Set(draft.excluded)
  if (excluded) set.add(rowNumber)
  else set.delete(rowNumber)
  const next: ImportDraft = { ...draft, excluded: [...set].sort((a, b) => a - b) }
  await writeImportDraft(next)
  return jobFromDraft(next)
}

/**
 * POST /imports/:id/confirm: a partir daqui o servidor grava, sem as linhas
 * desmarcadas. Devolve o `ImportJob` em `running`; a tela acompanha por
 * `GET /imports/:id`.
 */
export async function confirmImport(id: string): Promise<ImportJob> {
  if (isLive("imports")) {
    return apiPost<ImportJob>(`/imports/${encodeURIComponent(id)}/confirm`)
  }
  const draft = await demoDraftOrExample(id)
  const next: ImportDraft = {
    ...draft,
    status: "running",
    runningUntil: new Date(Date.now() + DEMO_RUN_MS).toISOString(),
  }
  await writeImportDraft(next)
  return jobFromDraft(next)
}

/**
 * POST /imports/:id/cancel (v29, item 108): antes de confirmar, descarta a
 * importação; durante a importação, o servidor para e desfaz o que já gravou,
 * e nada entra. Depois de terminar, `409 IMPORT_FINISHED`.
 */
export async function cancelImport(id: string): Promise<ImportJob> {
  if (isLive("imports")) {
    return apiPost<ImportJob>(`/imports/${encodeURIComponent(id)}/cancel`)
  }
  const draft = settle(await demoDraftOrExample(id))
  if (draft.status === "done" || draft.status === "failed" || draft.status === "canceled") {
    throw new ApiError(
      "conflict",
      409,
      "Esta importação já terminou. Para tirar produtos, edite pelo estoque.",
      "IMPORT_FINISHED",
    )
  }
  const next: ImportDraft = {
    ...draft,
    status: "canceled",
    finishedAt: new Date().toISOString(),
    runningUntil: null,
  }
  await writeImportDraft(next)
  return jobFromDraft(next)
}

/**
 * GET /imports/:id/preview, com `issue=error|warning|excluded` desde a v29
 * (item 25). As linhas vêm com `excluded` quando foram desmarcadas.
 */
export async function getImportPreview(
  id = mockImportJob().id,
  { issue, page = 1, perPage = 25 }: { issue?: ImportRowFilter; page?: number; perPage?: number } = {},
): Promise<Paginated<ImportPreviewRow>> {
  if (isLive("imports")) {
    return apiGetList<ImportPreviewRow>(`/imports/${encodeURIComponent(id)}/preview`, { issue, page, perPage })
  }
  const draft = await demoDraft(id)
  const excluded = new Set(draft?.excluded ?? [])
  const all = demoRows(draft).map((row) => (excluded.has(row.rowNumber) ? { ...row, excluded: true } : row))
  const rows = all.filter((row) =>
    issue === "error"
      ? row.issues.some((i) => i.severity === "error")
      : issue === "warning"
        ? row.action !== "skip" && row.issues.some((i) => i.severity === "warning")
        : issue === "excluded"
          ? row.excluded
          : true,
  )
  const job = draft ? jobFromDraft(draft) : mockImportJob()
  const total =
    issue === "error"
      ? job.errorRows
      : issue === "warning"
        ? (job.warningRows ?? rows.length)
        : issue === "excluded"
          ? rows.length
          : job.totalRows
  const start = (page - 1) * perPage
  return { data: rows.slice(start, start + perPage), meta: { page, perPage, total } }
}

/** GET /imports */
export async function getImportHistory(): Promise<ImportJob[]> {
  if (isLive("imports")) {
    const { data } = await apiGetList<ImportJob>("/imports")
    return data
  }
  const draft = await readImportDraft()
  const current = draft ? jobFromDraft(draft) : null
  const finished = current && !UNFINISHED.includes(current.status) && current.status !== "running"
  return finished ? [current, ...mockImportHistory()] : mockImportHistory()
}

/**
 * GET /imports?status=uploading,mapping,previewing (v29, item 38): as
 * importações paradas no meio, para a primeira tela oferecer continuar.
 */
export async function getUnfinishedImports(): Promise<ImportJob[]> {
  if (isLive("imports")) {
    const { data } = await apiGetList<ImportJob>("/imports", { status: UNFINISHED.join(",") })
    return data
  }
  const draft = await readImportDraft()
  return draft && UNFINISHED.includes(draft.status) ? [jobFromDraft(draft)] : []
}

/**
 * GET /imports/:id/columns (v29): cada coluna do arquivo com até três
 * valores de exemplo, para o Mapear. Na demonstração, as do arquivo lido.
 */
export async function getDetectedColumns(id?: string): Promise<{ name: string; samples: string[] }[]> {
  if (isLive("imports") && id) {
    const { data } = await apiGet<{ data: { name: string; samples: string[] }[] }>(
      `/imports/${encodeURIComponent(id)}/columns`,
    )
    return data
  }
  const draft = id ? await demoDraft(id) : null
  if (!draft?.sample) return DETECTED_COLUMNS
  const { columns, rows } = draft.sample
  return columns.map((name, i) => ({ name, samples: rows.slice(0, 3).map((row) => row[i] ?? "") }))
}

/** O mapeamento que vale agora: o salvo, ou o sugerido pelo servidor */
export async function getSuggestedMapping(id?: string): Promise<Record<string, string>> {
  if (isLive("imports") && id) {
    return (await getImportJob(id)).mapping
  }
  const draft = id ? await demoDraft(id) : null
  if (draft?.mapping) return draft.mapping
  return draft?.sample ? suggestMapping(draft.sample.columns) : SUGGESTED_MAPPING
}

/**
 * Campos do Valide que o mapeamento pode preencher.
 *
 * Isto não vem da API: é a lista dos nossos próprios campos, que o frontend
 * conhece porque são os tipos do domínio. Fica aqui para a tela continuar
 * pedindo tudo pela camada de serviço, sem precisar saber a diferença.
 */
export async function getValideFields(): Promise<typeof VALIDE_FIELDS> {
  return VALIDE_FIELDS
}
