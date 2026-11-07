/**
 * Regras do lote informado na fila de validades pendentes (issue 053) e na
 * entrada (issue 054).
 *
 * São o aviso imediato, antes de enviar: quem recusa de verdade é o servidor
 * (código repetido, produto que não existe). Ver business-rules.md seção 2.
 */

/** O que vai para `POST /products/:id/lots` (contrato: validade como meia-noite UTC) */
export type LotInput = {
  code: string
  manufacturedAt: string | null
  expiresAt: string
  quantity: number
  /** de quem veio e em qual nota (issue 072, item 22, contrato v27): só na entrada */
  supplier?: string | null
  invoiceNumber?: string | null
}

/** `madeAt`, a fabricação, é opcional e entrou na fila na issue 072 (item 100) */
export type QueueLotDraft = { code: string; madeAt: string; expiresAt: string; quantity: string }
export type QueueLotErrors = Partial<Record<keyof QueueLotDraft, string>>

/** O que o campo de data do navegador entrega quando a data está completa */
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/

function isCalendarDay(value: string): boolean {
  const match = ISO_DAY.exec(value)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

const NO_CODE = "Informe o número do lote. Ele vem impresso na caixa, perto da validade."
const NO_EXPIRY = "Informe a data de validade completa: dia, mês e ano."
const NOT_POSITIVE = "A quantidade precisa ser maior que zero."

function parseQuantity(typed: string): number {
  return Number(typed.trim().replace(",", "."))
}

/** O lote da entrada e do cadastro: os quatro campos de `LotFields` */
export type LotDraftFields = { code: string; madeAt: string; expiresAt: string; quantity: string }
export type LotDraftErrors = Partial<Record<keyof LotDraftFields, string>>

/**
 * Entrada de lote (issue 054). Código repetido no produto é recusado (decisão
 * de 10/10): o aviso sai aqui, antes de enviar, e o servidor confirma com
 * `409 LOT_CODE_TAKEN`. Fabricação é opcional, mas, se vier, vem completa e
 * não depois da validade (business-rules.md seção 2).
 */
export function validateLot(
  draft: LotDraftFields,
  { takenCodes = [] }: { takenCodes?: readonly string[] } = {},
): { errors: LotDraftErrors; input: LotInput | null } {
  const errors: LotDraftErrors = {}
  const code = draft.code.trim()
  const taken = takenCodes.find((existing) => existing.toLowerCase() === code.toLowerCase())
  if (!code) errors.code = NO_CODE
  else if (taken) errors.code = `Este produto já tem o lote ${taken}. Confira o número impresso na caixa.`

  if (draft.madeAt && !isCalendarDay(draft.madeAt)) {
    errors.madeAt = "Informe a fabricação completa (dia, mês e ano) ou deixe em branco."
  }
  if (!isCalendarDay(draft.expiresAt)) errors.expiresAt = NO_EXPIRY
  else if (draft.madeAt && isCalendarDay(draft.madeAt) && draft.expiresAt < draft.madeAt) {
    errors.expiresAt = "A data de validade não pode ser anterior à data de fabricação."
  }

  const quantity = parseQuantity(draft.quantity)
  if (!draft.quantity.trim()) errors.quantity = "Informe quanto chegou deste lote."
  else if (!Number.isFinite(quantity) || quantity <= 0) errors.quantity = NOT_POSITIVE

  if (Object.keys(errors).length > 0) return { errors, input: null }
  return {
    errors,
    input: {
      code,
      manufacturedAt: draft.madeAt ? `${draft.madeAt}T00:00:00Z` : null,
      expiresAt: `${draft.expiresAt}T00:00:00Z`,
      quantity,
    },
  }
}

/**
 * Quantidade em branco vale o estoque atual do produto: o caso comum é a caixa
 * inteira ser de um lote só. Lote já vencido passa (a prévia avisa): produto
 * vencido existe e precisa ser registrado para ser descartado.
 */
export function validateQueueLot(
  draft: QueueLotDraft,
  { stock }: { stock: number },
): { errors: QueueLotErrors; input: LotInput | null } {
  const errors: QueueLotErrors = {}
  const code = draft.code.trim()
  if (!code) errors.code = NO_CODE
  if (draft.madeAt && !isCalendarDay(draft.madeAt)) {
    errors.madeAt = "Informe a fabricação completa (dia, mês e ano) ou deixe em branco."
  }
  if (!isCalendarDay(draft.expiresAt)) errors.expiresAt = NO_EXPIRY
  else if (draft.madeAt && isCalendarDay(draft.madeAt) && draft.expiresAt < draft.madeAt) {
    errors.expiresAt = "A data de validade não pode ser anterior à data de fabricação."
  }

  const typed = draft.quantity.trim()
  const quantity = typed === "" ? stock : parseQuantity(typed)
  if (typed === "" && stock <= 0) {
    errors.quantity = "Informe a quantidade deste lote."
  } else if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = NOT_POSITIVE
  }

  if (Object.keys(errors).length > 0) return { errors, input: null }
  return {
    errors,
    input: {
      code,
      manufacturedAt: draft.madeAt ? `${draft.madeAt}T00:00:00Z` : null,
      expiresAt: `${draft.expiresAt}T00:00:00Z`,
      quantity,
    },
  }
}

/* ------------------------------------------------- origem da entrada (22) */

export type EntryOriginDraft = { supplier: string; invoice: string }
export type EntryOriginErrors = Partial<Record<keyof EntryOriginDraft, string>>

/** A nota como vem impressa: números, com ponto, traço ou barra */
const INVOICE = /^[0-9][0-9./-]{0,19}$/

/**
 * Fornecedor e nota fiscal da entrada (issue 072, item 22). Os dois são
 * opcionais; em branco vão como null.
 */
export function validateEntryOrigin(draft: EntryOriginDraft): {
  errors: EntryOriginErrors
  value: { supplier: string | null; invoiceNumber: string | null }
} {
  const errors: EntryOriginErrors = {}
  const supplier = draft.supplier.trim().replace(/\s+/g, " ")
  const invoice = draft.invoice.trim()
  if (supplier.length > 80) errors.supplier = "O nome do fornecedor passou de 80 letras."
  if (invoice && !INVOICE.test(invoice)) {
    errors.invoice = "Use o número da nota como está impresso: só números, com ponto, traço ou barra."
  }
  return { errors, value: { supplier: supplier || null, invoiceNumber: invoice || null } }
}
