/**
 * Colunas opcionais da tabela do estoque.
 *
 * As padrão (produto, validade, situação, quantidade) respondem a pergunta da
 * tela e não desligam. As daqui ficam a um clique (SPEC 5.2). A escolha vive
 * num cookie para o servidor já desenhar a tabela certa; com `localStorage` a
 * tabela apareceria com as padrão e trocaria depois de carregar.
 */

export const OPTIONAL_COLUMNS = [
  { key: "codigo", label: "Código interno" },
  { key: "pasta", label: "Pasta" },
  { key: "lote", label: "Lote" },
  { key: "minimo", label: "Estoque mínimo" },
  { key: "custo", label: "Custo parado" },
] as const

export type OptionalColumn = (typeof OPTIONAL_COLUMNS)[number]["key"]

export const COLUMNS_COOKIE = "valide_colunas"

const KNOWN = new Set<string>(OPTIONAL_COLUMNS.map((c) => c.key))

/**
 * Lê o cookie. Só aceita nome conhecido, sem repetir, na ordem da tabela:
 * cookie adulterado ou de uma versão antiga vira as colunas padrão, nunca
 * quebra a tela.
 */
export function parseColumns(value: string | undefined | null): OptionalColumn[] {
  if (!value) return []
  const chosen = new Set(value.split(",").map((v) => v.trim()))
  return OPTIONAL_COLUMNS.map((c) => c.key).filter(
    (key): key is OptionalColumn => chosen.has(key) && KNOWN.has(key),
  )
}
