/**
 * Regras da tela Pastas (issue 076, itens 64, 65 e 66): busca, ordem e página
 * da lista, as pastas que aparecem como escolha e a divisão das marcadas para
 * excluir. Funções puras, para ter teste.
 */

import type { Folder } from "../types/index.ts"

export type FolderSort =
  "name_asc" | "name_desc" | "products_desc" | "products_asc" | "risk_desc" | "risk_asc"

const SORTS: FolderSort[] = [
  "name_asc",
  "name_desc",
  "products_desc",
  "products_asc",
  "risk_desc",
  "risk_asc",
]

/** Como no Estoque: 25 por página */
export const FOLDERS_PER_PAGE = 25

export function parseFolderSort(raw: string | undefined): FolderSort {
  return SORTS.includes(raw as FolderSort) ? (raw as FolderSort) : "name_asc"
}

/** "Genéricos" acha com "genericos": sem acento e sem maiúscula */
export function plain(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
}

type Listable = { name: string; productCount: number; atRiskCount: number }

const byName = (a: Listable, b: Listable) => a.name.localeCompare(b.name, "pt-BR")

function compare(sort: FolderSort): (a: Listable, b: Listable) => number {
  switch (sort) {
    case "name_desc":
      return (a, b) => byName(b, a)
    case "products_desc":
      return (a, b) => b.productCount - a.productCount || byName(a, b)
    case "products_asc":
      return (a, b) => a.productCount - b.productCount || byName(a, b)
    case "risk_desc":
      return (a, b) => b.atRiskCount - a.atRiskCount || byName(a, b)
    case "risk_asc":
      return (a, b) => a.atRiskCount - b.atRiskCount || byName(a, b)
    default:
      return byName
  }
}

/** A página pedida da lista buscada e ordenada; página além da última vira a última */
export function listFolders<T extends Listable>(
  rows: T[],
  {
    search,
    sort,
    page,
    perPage = FOLDERS_PER_PAGE,
  }: { search?: string; sort: FolderSort; page: number; perPage?: number },
): { data: T[]; total: number; page: number; perPage: number } {
  const wanted = plain(search ?? "")
  const found = wanted ? rows.filter((row) => plain(row.name).includes(wanted)) : rows
  const sorted = [...found].sort(compare(sort))
  const pages = Math.max(1, Math.ceil(sorted.length / perPage))
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages)
  return {
    data: sorted.slice((current - 1) * perPage, current * perPage),
    total: sorted.length,
    page: current,
    perPage,
  }
}

/**
 * As pastas que se pode escolher (item 65): só as ativas. A que o produto já
 * tem continua na lista mesmo desativada, marcada, para a edição não trocá-la
 * sem ninguém pedir.
 */
export function folderChoices(folders: Folder[], keepId?: string | null): Folder[] {
  return folders.flatMap((folder) => {
    if (folder.active) return [folder]
    if (folder.id === keepId) return [{ ...folder, name: `${folder.name} (desativada)` }]
    return []
  })
}

/** Excluir várias (item 66): só as vazias saem; as que têm produto ficam, e a tela diz quais */
export function splitForDelete<T extends { productCount: number }>(
  marked: T[],
): { empty: T[]; withProducts: T[] } {
  return {
    empty: marked.filter((f) => f.productCount === 0),
    withProducts: marked.filter((f) => f.productCount > 0),
  }
}

/** "Infantil", "Infantil e Suplementos", "Infantil, Bebês e Suplementos" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ""
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`
}

export type FolderQuery = { busca?: string; ordem?: string; pagina?: string; cargo?: string }

/** O endereço da lista com uma mudança; mudar busca ou ordem volta à página 1, como no Estoque */
export function foldersHref(current: FolderQuery, patch: FolderQuery): string {
  const next: FolderQuery = { ...current, ...patch }
  if (!("pagina" in patch)) delete next.pagina
  if (next.ordem === "name_asc") delete next.ordem
  if (next.pagina === "1") delete next.pagina
  const params = new URLSearchParams()
  for (const key of ["busca", "ordem", "pagina", "cargo"] as const) {
    if (next[key]) params.set(key, next[key])
  }
  const query = params.toString()
  return query ? `/estoque/pastas?${query}` : "/estoque/pastas"
}
