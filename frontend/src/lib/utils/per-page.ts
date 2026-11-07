/**
 * Linhas por página do estoque (issue 068, item 7), como o "Rows per page" do
 * SaaS Data Table (Behance). A escolha vive num cookie, como as colunas
 * (`stock-columns.ts`): é preferência de quem usa o computador, e o servidor
 * já desenha a página com o tamanho certo.
 */

export const PER_PAGE_OPTIONS = [25, 50, 100] as const
export type PerPage = (typeof PER_PAGE_OPTIONS)[number]

/** 25 cabem numa tela de 1440 com a barra de estado legível (issue 029) */
export const DEFAULT_PER_PAGE: PerPage = 25

export const PER_PAGE_COOKIE = "valide_linhas"

/** Só aceita uma das opções; cookie adulterado ou antigo volta ao padrão */
export function parsePerPage(value: string | undefined | null): PerPage {
  const n = Number(value)
  return (PER_PAGE_OPTIONS as readonly number[]).includes(n) ? (n as PerPage) : DEFAULT_PER_PAGE
}
