/**
 * A parte de cada pasta nos produtos em risco, para a rosca do Início (issue
 * 067, item 4). Até cinco pastas, da maior para a menor; o resto soma em
 * "Outras pastas", para a rosca não virar um leque de fatias finas.
 *
 * As porcentagens fecham 100 pelo maior resto: arredondar cada uma sozinha
 * dava 99 ou 101 na soma, e a legenda é lida como um todo.
 */

export type FolderPoint = { folderId: string; folderName: string; atRiskCount: number }
export type FolderSlice = {
  id: string
  name: string
  count: number
  percent: number
  folderId: string | null
}

export const MAX_SLICES = 5
export const OTHERS_ID = "outras"

export function folderShares(points: FolderPoint[], max: number = MAX_SLICES): FolderSlice[] {
  const sorted = points
    .filter((p) => p.atRiskCount > 0)
    .sort((a, b) => b.atRiskCount - a.atRiskCount || a.folderName.localeCompare(b.folderName, "pt-BR"))
  const total = sorted.reduce((sum, p) => sum + p.atRiskCount, 0)
  if (total === 0) return []

  // Mais de cinco: as quatro maiores e "Outras pastas", cinco fatias no máximo
  const keep = sorted.length > max ? sorted.slice(0, max - 1) : sorted
  const rest = sorted.slice(keep.length)
  const slices: Omit<FolderSlice, "percent">[] = keep.map((p) => ({
    id: p.folderId,
    name: p.folderName,
    count: p.atRiskCount,
    folderId: p.folderId,
  }))
  if (rest.length > 0) {
    const count = rest.reduce((sum, p) => sum + p.atRiskCount, 0)
    slices.push({ id: OTHERS_ID, name: "Outras pastas", count, folderId: null })
  }

  const exact = slices.map((s) => (s.count / total) * 100)
  const floors = exact.map(Math.floor)
  let missing = 100 - floors.reduce((a, b) => a + b, 0)
  const byRemainder = exact.map((v, i) => ({ i, r: v - floors[i] })).sort((a, b) => b.r - a.r)
  for (const { i } of byRemainder) {
    if (missing <= 0) break
    floors[i] += 1
    missing -= 1
  }
  return slices.map((s, i) => ({ ...s, percent: floors[i] }))
}

/**
 * Tons da tinta por ordem (tokens `--chart-share-1` a `4`); a quinta fatia,
 * ou "Outras pastas", fica na base neutra. Nunca cor de status
 */
export function sliceColor(index: number): string {
  return index < 4 ? `var(--chart-share-${index + 1})` : "var(--chart-base)"
}

/** Título com a conclusão (design-system 14.5): a pasta que mais pesa */
export function folderSharesHeadline(slices: FolderSlice[]): string {
  const total = slices.reduce((sum, s) => sum + s.count, 0)
  const top = slices.find((s) => s.id !== OTHERS_ID)
  if (!top) return "Nenhum produto em risco nas pastas"
  if (top.count === total) {
    return total === 1
      ? `O produto em risco está em ${top.name}`
      : `Os ${total} produtos em risco estão em ${top.name}`
  }
  return `${top.name} tem ${top.count} dos ${total} produtos em risco`
}
