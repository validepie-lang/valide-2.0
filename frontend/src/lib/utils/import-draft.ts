/**
 * Regras da importação que a tela confere antes de enviar (issue 056). Quem
 * lê o arquivo, reconhece as colunas e decide criar ou atualizar é o
 * servidor; aqui só o que evita uma ida e volta à toa.
 */

/**
 * O envio passa pelo servidor do Next, e a Vercel aceita até 4,5 MB por
 * requisição. Desde a issue 075 (item 109) o arquivo vai em partes de 1 MB, e
 * o limite passa a ser do total: 20 MB, até 5 planilhas (item 37).
 */
export const MAX_CATALOG_BYTES = 20 * 1024 * 1024
export const MAX_CATALOG_FILES = 5
/** Uma parte por requisição; também é o passo da barra de progresso (item 35) */
export const PART_BYTES = 1024 * 1024

/** Quantas partes um arquivo leva (um arquivo vazio não chega a ser enviado) */
export function partCount(size: number): number {
  return Math.max(1, Math.ceil(size / PART_BYTES))
}

const ACCEPTED = /\.(csv|xlsx)$/i

/** "1,2 MB", "380 KB": o tamanho como se lê no explorador de arquivos */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
}

/** O que impede de enviar este arquivo, ou null se pode enviar */
export function checkCatalogFile(file: { name: string; size: number }): string | null {
  if (!ACCEPTED.test(file.name)) {
    return "Este arquivo não é CSV nem Excel (XLSX). No seu sistema, exporte a lista de produtos para Excel e tente de novo."
  }
  if (file.size === 0) return "Este arquivo está vazio. Exporte a lista de novo e confira se ela tem linhas."
  if (file.size > MAX_CATALOG_BYTES) {
    return `Este arquivo tem ${formatFileSize(file.size)}, e o envio aceita até 20 MB. Divida a lista em duas planilhas e importe uma de cada vez.`
  }
  return null
}

/** As planilhas escolhidas juntas (item 37): o que impede de enviar, ou null */
export function checkCatalogFiles(files: readonly { name: string; size: number }[]): string | null {
  if (files.length === 0) return "Escolha o arquivo da lista de produtos."
  if (files.length > MAX_CATALOG_FILES) {
    return `Escolha até ${MAX_CATALOG_FILES} planilhas por vez. Importe as outras depois desta.`
  }
  for (const file of files) {
    const problem = checkCatalogFile(file)
    if (problem) return files.length > 1 ? `${file.name}: ${problem}` : problem
  }
  const total = files.reduce((sum, f) => sum + f.size, 0)
  if (total > MAX_CATALOG_BYTES) {
    return `As planilhas somam ${formatFileSize(total)}, e o envio aceita até 20 MB de uma vez. Importe parte delas agora e o resto depois.`
  }
  const names = new Set(files.map((f) => f.name.toLowerCase()))
  if (names.size < files.length) return "Você escolheu o mesmo arquivo duas vezes."
  return null
}

/**
 * Planilhas de uma importação só precisam ter as mesmas colunas: o mapeamento
 * vale para todas. Devolve a frase do primeiro arquivo diferente, ou null.
 */
export function sameColumns(files: readonly { name: string; columns: readonly string[] }[]): string | null {
  const [first, ...rest] = files
  if (!first) return null
  const key = (cols: readonly string[]) => cols.map((c) => c.trim().toLowerCase())
  for (const other of rest) {
    const a = key(first.columns)
    const b = key(other.columns)
    const missing = first.columns.filter((_, i) => !b.includes(a[i]))
    const extra = other.columns.filter((_, i) => !a.includes(b[i]))
    if (missing.length || extra.length) {
      const detail = missing.length ? `não tem ${missing.join(", ")}` : `tem a mais ${extra.join(", ")}`
      return `${other.name} tem colunas diferentes de ${first.name}: ${detail}. Exporte as duas do mesmo jeito, ou importe uma de cada vez.`
    }
  }
  return null
}

export type MappingErrors = { general?: string; columns: Record<string, string> }

/**
 * Cada campo do Valide em no máximo uma coluna, e o nome do produto em alguma:
 * sem ele, nenhuma linha entra. O erro de campo repetido vai na segunda coluna
 * que o escolheu, que é a que a pessoa acabou de mexer na ordem da tela.
 */
export function validateMapping(
  mapping: Record<string, string>,
  columns: readonly string[],
  fields: readonly { key: string; label: string; required: boolean }[],
): MappingErrors {
  const errors: MappingErrors = { columns: {} }
  const seen = new Map<string, string>()
  for (const column of columns) {
    const field = mapping[column]
    if (!field) continue
    const first = seen.get(field)
    if (first) {
      const label = fields.find((f) => f.key === field)?.label ?? field
      errors.columns[column] =
        `${label} já está na coluna ${first}. Escolha um campo diferente para cada coluna.`
    } else {
      seen.set(field, column)
    }
  }
  const missing = fields.filter((f) => f.required && !seen.has(f.key))
  if (missing.length > 0) {
    errors.general = `Escolha a coluna de ${missing.map((f) => f.label.toLowerCase()).join(" e ")}: sem ela, nenhuma linha entra.`
  }
  return errors
}

export function hasMappingErrors(errors: MappingErrors): boolean {
  return Boolean(errors.general) || Object.keys(errors.columns).length > 0
}
