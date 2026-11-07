/**
 * Tipos do domínio do Valide.
 *
 * Copiados de docs/01-references/api-contract.md. Não inventar campo aqui:
 * este arquivo e aquele documento precisam contar a mesma história, porque o
 * contrato é o que o Marcus entrega ao Pedro.
 */

import type { ExpiryStatus } from "@/lib/utils/expiry"

export type { ExpiryStatus }

export type ExitReason = "sale" | "damage" | "theft" | "expiry" | "internal"

/**
 * Os três perfis de `perfil_acesso`, em ordem crescente de nível no banco:
 * 1 Balconista, 2 Farmacêutico, 3 Administrador.
 */
export type UserRole = "clerk" | "pharmacist" | "admin"

/**
 * `integration` continua no tipo de propósito.
 *
 * A integração com o sistema da farmácia saiu do escopo do piloto em 17/09, mas
 * o valor faz parte do contrato já acordado com o Pedro, e um produto vindo dela
 * precisa ter como se identificar quando ela voltar. O que saiu foi a interface
 * para conectar, não a possibilidade de o dado existir.
 */
export type ImportSource = "file" | "integration" | "manual"

export type ImportStatus =
  | "pending"
  /** as partes do arquivo ainda chegando (issue 075, contrato v29) */
  | "uploading"
  | "mapping"
  | "previewing"
  | "running"
  | "done"
  | "failed"
  /** descartada antes de confirmar, ou desfeita durante a importação (issue 075, item 108) */
  | "canceled"

export type ProductUnit = "un" | "kg" | "cx"

export interface Address {
  zipCode: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
}

export interface Company {
  id: string
  cnpj: string
  legalName: string
  tradeName: string
  stateRegistration: string | null
  cityRegistration: string | null
  taxRegime: string
  address: Address
  phone: string
  email: string
  website: string | null
  logoUrl: string | null
  timezone: string
  currency: string
  locale: string
  /** Janela de "a vencer", em dias. Padrão 30, configurável por conta. */
  soonThresholdDays: number
}

export interface User {
  id: string
  name: string
  /** Nome de usuário de acesso, único. O banco não guarda e-mail de usuário. */
  login: string
  role: UserRole
  /** false bloqueia o acesso sem apagar o que a pessoa registrou. */
  active: boolean
  avatarUrl: string | null
}

export interface Folder {
  id: string
  name: string
  productCount: number
  /** false tira a pasta das escolhas; os produtos continuam nela (v30, issue 076) */
  active: boolean
}

export interface Lot {
  id: string
  productId: string
  code: string
  manufacturedAt: string | null
  expiresAt: string
  quantity: number
  status: ExpiryStatus
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  folderId: string | null
  folderName: string | null
  brand: string | null
  supplier: string | null
  unit: ProductUnit
  minStock: number
  maxStock: number | null
  /** centavos */
  acquisitionCost: number
  /** centavos */
  operationalCost: number
  /** centavos */
  salePrice: number
  totalQuantity: number
  nearestExpiry: string | null
  /** 'unknown' quando lots está vazio, nunca null */
  nearestExpiryStatus: ExpiryStatus
  lots: Lot[]
  source: ImportSource
  externalId: string | null
  /** false quando o produto sumiu da origem em uma reimportação. */
  active: boolean
  /** foto do produto (issue 070, contrato v26, proposto); null sem foto */
  photoUrl: string | null
}

/** Nota do produto (issue 070, contrato v26, proposto): registro, não se edita */
export interface ProductNote {
  id: string
  text: string
  userName: string
  createdAt: string
}

/** Campo do cadastro cuja mudança aparece em "Alterações do cadastro" */
export type ProductChangeField =
  | "name"
  | "salePrice"
  | "acquisitionCost"
  | "minStock"
  | "folder"
  | "barcode"
  | "brand"
  | "supplier"

/**
 * Uma alteração do cadastro (issue 070, contrato v26, proposto). `created` é o
 * cadastro em si; `userName` null quando veio da importação. Dinheiro em
 * centavos, mínimo em unidades do produto, pasta pelo nome.
 */
export type ProductChange =
  | { id: string; at: string; userName: string | null; kind: "created"; source: ImportSource }
  | {
      id: string
      at: string
      userName: string
      kind: "updated"
      field: ProductChangeField
      from: string | number | null
      to: string | number | null
    }

export interface Movement {
  id: string
  productId: string
  productName: string
  lotId: string
  lotCode: string
  /** `adjust` é o AJUSTE do banco: a correção de uma entrada ou saída (issue 073, contrato v28) */
  type: "in" | "out" | "adjust"
  reason: ExitReason | null
  /** sempre positiva em entrada e saída; no ajuste, com sinal (positivo volta para o lote) */
  quantity: number
  /** unidade do produto, para a quantidade nunca aparecer sem ela */
  unit: ProductUnit
  userId: string
  userName: string
  createdAt: string
  note: string | null
  /** no ajuste: o que ele corrige */
  corrects?: { id: string; type: "in" | "out"; quantity: number; createdAt: string } | null
  /** na entrada ou saída já corrigida: quando */
  correctedAt?: string | null
}

/** Quantas movimentações de cada tipo o filtro acha, sem contar o próprio tipo (contrato v28) */
export type MovementCounts = Record<Movement["type"], number>

/**
 * Filtros de GET /movements (contrato v15, issue 041). `from` é a data do
 * primeiro dia, "2026-10-04", no fuso da conta, como o resto das datas de calendário.
 */
export interface MovementFilters {
  page?: number
  perPage?: number
  productId?: string
  type?: Movement["type"]
  reason?: ExitReason
  userId?: string
  from?: string
  /** último dia, inclusive (v28, datas livres) */
  to?: string
}

/**
 * O que vira aviso no sino, por pessoa (issue 044, contrato v16, proposto).
 * Um campo por tipo de aviso que existe: `system` é o resumo da semana.
 */
export interface NotificationPreferences {
  expiringThisWeek: boolean
  minStock: boolean
  teamActivity: boolean
  importDone: boolean
}

export interface Notification {
  id: string
  kind: "min_stock" | "user_change" | "system" | "import_done"
  title: string
  body: string
  read: boolean
  createdAt: string
  link: string | null
}

export interface ImportJob {
  id: string
  source: ImportSource
  status: ImportStatus
  fileName: string | null
  detectedColumns: string[]
  mapping: Record<string, string>
  totalRows: number
  validRows: number
  errorRows: number
  createdRows: number
  updatedRows: number
  createdAt: string
  finishedAt: string | null
  /** as planilhas da importação (v29: até 5, com as mesmas colunas) */
  files?: { name: string; size: number }[]
  /** linhas que entram com aviso (v29, filtro da revisão) */
  warningRows?: number
  /** linhas desmarcadas na revisão, que não entram (v29, item 25) */
  excludedRows?: number
}

export interface ImportIssue {
  field: string
  severity: "error" | "warning"
  /** em português, pronto para exibir */
  message: string
}

export interface ImportPreviewRow {
  rowNumber: number
  data: Partial<Product>
  issues: ImportIssue[]
  action: "create" | "update" | "skip"
  /** desmarcada na revisão: não entra (v29, item 25) */
  excluded?: boolean
}

/** O que a revisão filtra (v29): `issue=error|warning|excluded` no `GET /imports/:id/preview` */
export type ImportRowFilter = "error" | "warning" | "excluded"

/* --------------------------------------------------------------------------
   Envelopes e filtros
   -------------------------------------------------------------------------- */

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ProductFilters {
  page?: number
  perPage?: number
  search?: string
  folderId?: string
  /** um estado, ou vários: a Home pede vencidos e a vencer juntos */
  status?: ExpiryStatus | ExpiryStatus[]
  source?: ImportSource
  supplier?: string
  brand?: string
  /** só os que estão abaixo do estoque mínimo (contrato v13, proposto; issue 037) */
  belowMin?: boolean
  sort?: "expiry_asc" | "expiry_desc" | "name_asc" | "quantity_asc" | "value_desc"
}

/** GET /products/facets: os valores que existem, para os filtros de seleção */
export interface ProductFacets {
  suppliers: string[]
  brands: string[]
}

/* --------------------------------------------------------------------------
   Dashboard: resposta de GET /dashboard
   -------------------------------------------------------------------------- */

export interface DashboardCounts {
  expired: number
  soon: number
  ok: number
  unknown: number
}

export interface ExpiryWeekPoint {
  weekStart: string
  lotCount: number
}

export interface FolderRiskPoint {
  folderId: string
  folderName: string
  atRiskCount: number
}

export interface ExpiringSoonItem {
  productId: string
  productName: string
  lotCode: string
  expiresAt: string
  status: ExpiryStatus
  quantity: number
  /** unidade do produto, para a quantidade nunca aparecer sem ela */
  unit: ProductUnit
}

/** Um lote no calendário de vencimentos (issue 052, contrato v17, proposto) */
export interface CalendarLot extends ExpiringSoonItem {
  lotId: string
}

export interface DashboardData {
  /** centavos: custo dos itens vencidos mais a vencer. Não inclui sem validade */
  valueAtRisk: number
  /**
   * centavos: o valor em risco de sete dias atrás, para a variação do Início
   * (contrato v23, proposto). null quando não há (conta com menos de uma semana)
   */
  valueAtRiskLastWeek: number | null
  counts: DashboardCounts
  pendingExpiry: {
    productCount: number
    /** centavos */
    valueAtStake: number
  }
  expiryByWeek: ExpiryWeekPoint[]
  byFolder: FolderRiskPoint[]
  expiringSoon: ExpiringSoonItem[]
  recentMovements: Movement[]
}

/* --------------------------------------------------------------------------
   Rótulos de interface, em português
   -------------------------------------------------------------------------- */

/** Motivos que contam como perda: o produto saiu sem virar venda (issue 036) */
export type LossReason = Extract<ExitReason, "expiry" | "damage" | "theft">

export type LossPeriod = "30d" | "90d" | "year"

/** GET /reports/losses (contrato v12, proposto). Dinheiro em centavos, a custo de aquisição */
export interface LossReport {
  period: LossPeriod
  from: string
  to: string
  total: number
  /** o mesmo intervalo, imediatamente antes; null se a conta não existia */
  previousTotal: number | null
  units: number
  byReason: { reason: LossReason; value: number; units: number }[]
  /** semanas nos períodos de 30 e 90 dias, meses no ano */
  bucket: "week" | "month"
  series: { start: string; value: number }[]
  topProducts: {
    productId: string
    productName: string
    unit: ProductUnit
    units: number
    value: number
    mainReason: LossReason
  }[]
}

export const EXIT_REASON_LABEL: Record<ExitReason, string> = {
  sale: "Venda",
  damage: "Avaria",
  theft: "Roubo",
  expiry: "Vencimento",
  internal: "Consumo interno",
}

export const ROLE_LABEL: Record<UserRole, string> = {
  clerk: "Balconista",
  pharmacist: "Farmacêutico",
  admin: "Administrador",
}

export const SOURCE_LABEL: Record<ImportSource, string> = {
  file: "Planilha",
  integration: "Integração",
  manual: "Manual",
}

export const UNIT_LABEL: Record<ProductUnit, string> = {
  un: "Unidade",
  kg: "Quilo",
  cx: "Caixa",
}
