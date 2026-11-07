import { cookies } from "next/headers"
import { FOLDERS, mockProducts, mockToday } from "@/lib/mocks/catalog"
import { mockMovements } from "@/lib/mocks/movements"
import { CURRENT_COMPANY, CURRENT_USER } from "@/lib/mocks/session"
import {
  JOURNAL_COOKIE,
  applyFolders,
  applyToProducts,
  journalMovements,
  markCorrected,
  parseJournal,
  serializeJournal,
  type JournalEntry,
} from "@/lib/utils/demo-journal"
import type { Folder, Movement, Product } from "@/lib/types"

/**
 * O registro do modo de demonstração no cookie (issue 071, item 99). Só os
 * serviços chamam daqui, e só no ramo simulado: com a área ligada à API,
 * nada é lido nem escrito.
 *
 * Escrever o cookie só é permitido dentro de server action, que é de onde
 * vêm todas as gravações.
 */

const THIRTY_DAYS = 60 * 60 * 24 * 30

export async function readJournal(): Promise<JournalEntry[]> {
  return parseJournal((await cookies()).get(JOURNAL_COOKIE)?.value)
}

/** Acrescenta uma ação ao registro (`at` e o resto já preenchidos por quem chama) */
export async function record(entry: JournalEntry): Promise<void> {
  const jar = await cookies()
  const journal = parseJournal(jar.get(JOURNAL_COOKIE)?.value)
  jar.set(JOURNAL_COOKIE, serializeJournal([...journal, entry]), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  })
}

/**
 * Tira uma ação do registro pelo id (issue 072: desfazer lote e saída). Devolve
 * false quando ela não está lá: o que veio do exemplo original não se desfaz.
 */
export async function unrecord(id: string): Promise<boolean> {
  const jar = await cookies()
  const journal = parseJournal(jar.get(JOURNAL_COOKIE)?.value)
  const kept = journal.filter((entry) => !("id" in entry) || entry.id !== id)
  if (kept.length === journal.length) return false
  jar.set(JOURNAL_COOKIE, serializeJournal(kept), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  })
  return true
}

export async function clearJournal(): Promise<void> {
  ;(await cookies()).delete(JOURNAL_COOKIE)
}

/** As pastas de exemplo com o que a pessoa criou, renomeou, desativou e excluiu (issue 076), sem contagem */
export async function demoFolders(): Promise<Folder[]> {
  return applyFolders(FOLDERS, await readJournal())
}

/** O catálogo de exemplo com o que a pessoa gravou neste navegador */
export async function demoProducts(): Promise<Product[]> {
  const journal = await readJournal()
  if (journal.length === 0) return mockProducts()
  return applyToProducts(mockProducts(), journal, {
    today: mockToday(),
    threshold: CURRENT_COMPANY.soonThresholdDays,
    folders: applyFolders(FOLDERS, journal),
  })
}

/** As movimentações de exemplo, com as entradas e saídas gravadas por cima */
export async function demoMovements(): Promise<Movement[]> {
  const journal = await readJournal()
  if (journal.length === 0) return mockMovements()
  const list = [...journalMovements(journal, await demoProducts(), CURRENT_USER), ...mockMovements()]
  return markCorrected(list, journal)
}
