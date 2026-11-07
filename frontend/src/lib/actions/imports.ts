"use server"

import {
  beginImport,
  cancelImport,
  confirmImport,
  getImportJob,
  getImportPreview,
  readImport,
  saveImportMapping,
  setImportRowExcluded,
  uploadImportPart,
} from "@/lib/services/imports"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import type { CatalogSample } from "@/lib/utils/catalog-read"
import { importIssuesCsv } from "@/lib/utils/import-issues-csv"
import type { ImportJob, ImportPreviewRow } from "@/lib/types"

/**
 * Pontes da importação para o servidor (issues 056 e 075). Não leem nem
 * gravam nada: repassam para a API do backend, onde o arquivo é lido e o
 * catálogo gravado.
 */

async function bridge<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/** Abre a importação com a lista das planilhas (item 37) */
export async function openImport(files: { name: string; size: number }[]): Promise<ActionResult<ImportJob>> {
  return bridge(() => beginImport(files))
}

/** Uma parte de até 1 MB, no campo `parte` (itens 35 e 109) */
export async function sendImportPart(form: FormData): Promise<ActionResult<{ received: number }>> {
  const id = String(form.get("importacao") ?? "")
  const part = form.get("parte")
  if (!id || !(part instanceof Blob)) {
    return { ok: false, message: "Não foi possível enviar esta parte do arquivo.", code: null }
  }
  return bridge(() => uploadImportPart(id, Number(form.get("arquivo")), Number(form.get("indice")), part))
}

/** Todas as partes chegaram: o servidor lê as planilhas (no modo de demonstração, com o que o navegador leu) */
export async function finishUpload(
  id: string,
  samples?: (CatalogSample | null)[],
): Promise<ActionResult<ImportJob>> {
  return bridge(() => readImport(id, samples))
}

export async function saveMapping(
  id: string,
  mapping: Record<string, string>,
): Promise<ActionResult<ImportJob>> {
  return bridge(() => saveImportMapping(id, mapping))
}

/** Desmarca ou marca de novo uma linha da revisão (item 25) */
export async function toggleImportRow(
  id: string,
  rowNumber: number,
  excluded: boolean,
): Promise<ActionResult<ImportJob>> {
  return bridge(() => setImportRowExcluded(id, rowNumber, excluded))
}

export async function runImport(id: string): Promise<ActionResult<ImportJob>> {
  return bridge(() => confirmImport(id))
}

/** Descarta antes de confirmar, ou desfaz durante a importação (item 108) */
export async function stopImport(id: string): Promise<ActionResult<ImportJob>> {
  return bridge(() => cancelImport(id))
}

/** Para acompanhar a importação em andamento */
export async function checkImport(id: string): Promise<ActionResult<ImportJob>> {
  return bridge(() => getImportJob(id))
}

/**
 * As linhas com erro e com aviso numa planilha (item 107): a mesma prévia
 * da revisão, de 100 em 100, sem endpoint novo.
 */
export async function exportImportIssues(
  id: string,
): Promise<ActionResult<{ csv: string; filename: string }>> {
  return bridge(async () => {
    const rows: ImportPreviewRow[] = []
    for (const issue of ["error", "warning"] as const) {
      for (let page = 1; page <= 50; page++) {
        const { data, meta } = await getImportPreview(id, { issue, page, perPage: 100 })
        rows.push(...data)
        if (data.length < 100 || page * 100 >= meta.total) break
      }
    }
    const job = await getImportJob(id)
    return { csv: importIssuesCsv(rows, job.fileName), filename: `linhas-com-problema-${job.id}.csv` }
  })
}
