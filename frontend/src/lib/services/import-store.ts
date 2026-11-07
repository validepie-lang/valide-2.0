import { cookies } from "next/headers"
import type { CatalogSample } from "@/lib/utils/catalog-read"
import type { ImportStatus } from "@/lib/types"

/**
 * A importação em andamento no modo de demonstração (issue 075), num cookie
 * do navegador, como o registro da issue 071: a Vercel pode atender cada
 * passo numa máquina diferente, e o cookie vai junto em todo pedido. Só o
 * ramo simulado de `services/imports.ts` lê e escreve aqui; com a API ligada,
 * quem guarda a importação é o servidor.
 *
 * Uma importação por navegador: começar outra substitui a anterior.
 */

export const IMPORT_COOKIE = "valide_importacao"
const MAX_BYTES = 3500
const CELL = 30

export type ImportDraft = {
  id: string
  status: ImportStatus
  createdAt: string
  finishedAt: string | null
  /** até quando a importação "roda" depois de confirmada, para dar tempo de cancelar */
  runningUntil: string | null
  files: { name: string; size: number; received: number }[]
  /** o que o navegador leu do arquivo; `null` segue com a importação de exemplo */
  sample: CatalogSample | null
  mapping: Record<string, string> | null
  excluded: number[]
}

export async function readImportDraft(): Promise<ImportDraft | null> {
  const raw = (await cookies()).get(IMPORT_COOKIE)?.value
  if (!raw) return null
  try {
    const draft = JSON.parse(decodeURIComponent(raw)) as ImportDraft
    return typeof draft?.id === "string" && Array.isArray(draft.files) ? draft : null
  } catch {
    return null
  }
}

/** Corta as células e, se ainda não couber, tira linhas da amostra até caber */
function fit(draft: ImportDraft): string {
  let current: ImportDraft = draft.sample
    ? {
        ...draft,
        sample: {
          ...draft.sample,
          columns: draft.sample.columns.map((c) => c.slice(0, 40)),
          rows: draft.sample.rows.map((row) => row.map((cell) => cell.slice(0, CELL))),
        },
      }
    : draft
  let text = encodeURIComponent(JSON.stringify(current))
  while (text.length > MAX_BYTES && current.sample && current.sample.rows.length > 1) {
    current = { ...current, sample: { ...current.sample, rows: current.sample.rows.slice(0, -1) } }
    text = encodeURIComponent(JSON.stringify(current))
  }
  return text
}

export async function writeImportDraft(draft: ImportDraft): Promise<void> {
  ;(await cookies()).set(IMPORT_COOKIE, fit(draft), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}
