/**
 * Regras da seleção do Estoque (issue 069): o estado da caixa do cabeçalho e
 * os textos da barra e da confirmação. Separadas da tela para ter teste.
 */

export type PageCheck = "none" | "some" | "all"

/** A caixa do cabeçalho: vazia, meio-marcada ou marcada, olhando só a página */
export function pageCheckState(pageIds: string[], selected: ReadonlySet<string>): PageCheck {
  const marked = pageIds.filter((id) => selected.has(id)).length
  if (marked === 0) return "none"
  return marked === pageIds.length ? "all" : "some"
}

const n = (value: number) => value.toLocaleString("pt-BR")

export function markedLabel(count: number): string {
  return `${n(count)} ${count === 1 ? "marcado" : "marcados"}`
}

/** A confirmação depois de mover; sem pasta de destino, os produtos ficam "sem pasta" */
export function moveSummary(count: number, folderName: string | null): string {
  const what = `${n(count)} ${count === 1 ? "produto" : "produtos"}`
  if (folderName === null) return `${what} ${count === 1 ? "ficou" : "ficaram"} sem pasta.`
  return `${what} ${count === 1 ? "movido" : "movidos"} para ${folderName}.`
}
