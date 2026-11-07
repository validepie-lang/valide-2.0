/**
 * Camada de dados de produto.
 *
 * Nenhuma tela importa mock direto e nenhuma tela sabe se o dado veio da API ou
 * de um arquivo local. Cada função tem os dois caminhos, e quem decide é a área
 * ligada em `NEXT_PUBLIC_API_LIVE`. Quando o Pedro entregar B27, B28 e B30,
 * basta acrescentar `products,folders` na variável.
 *
 * Endpoints em docs/01-references/api-contract.md.
 */

import { apiGet, apiGetList, apiPatch, apiPost } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { demoFolders, demoProducts, record } from "@/lib/services/demo-store"
import { CURRENT_COMPANY } from "@/lib/mocks/session"
import { getExpiryStatus } from "@/lib/utils/expiry"
import type { NewProductInput, ProductInput } from "@/lib/utils/product-draft"
import type { Folder, Paginated, Product, ProductFacets, ProductFilters } from "@/lib/types"
import { NO_FOLDER } from "@/lib/utils/no-folder"

/* --------------------------------------------------------------------------
   API
   -------------------------------------------------------------------------- */

/** GET /products */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<Paginated<Product>> {
  if (isLive("products")) {
    return apiGetList<Product>("/products", {
      page: filters.page,
      perPage: filters.perPage,
      search: filters.search,
      folderId: filters.folderId,
      // vários estados vão separados por vírgula: status=expired,soon
      status: Array.isArray(filters.status) ? filters.status.join(",") : filters.status,
      source: filters.source,
      supplier: filters.supplier,
      brand: filters.brand,
      belowMin: filters.belowMin || undefined,
      sort: filters.sort,
    })
  }
  return mockGetProducts(filters)
}

/** GET /products/:id */
export async function getProduct(id: string): Promise<Product | null> {
  if (isLive("products")) {
    return apiGet<Product>(`/products/${encodeURIComponent(id)}`)
  }
  return (await demoProducts()).find((p) => p.id === id) ?? null
}

/**
 * Fila de validades pendentes.
 *
 * Não tem rota própria: `status=unknown` já devolve exatamente os produtos sem
 * lote, e `value_desc` já ordena pelo custo total parado. A rota dedicada que eu
 * tinha proposto foi descartada com o Pedro em 16/09, porque era a mesma
 * consulta com outro nome.
 */
export async function getPendingExpiryProducts(
  filters: Pick<ProductFilters, "page" | "perPage"> = {},
): Promise<Paginated<Product>> {
  return getProducts({ ...filters, status: "unknown", sort: "value_desc" })
}

/**
 * GET /products/facets
 *
 * Fornecedores e marcas que existem no estoque, para o filtro ser uma escolha
 * e não um campo em que o balconista precisa lembrar a grafia exata.
 */
export async function getProductFacets(): Promise<ProductFacets> {
  if (isLive("products")) {
    return apiGet<ProductFacets>("/products/facets")
  }
  const active = (await demoProducts()).filter((p) => p.active)
  const distinct = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    )
  return {
    suppliers: distinct(active.map((p) => p.supplier)),
    brands: distinct(active.map((p) => p.brand)),
  }
}

/** GET /folders */
export async function getFolders(): Promise<Folder[]> {
  if (isLive("folders")) {
    const { data } = await apiGetList<Folder>("/folders")
    return data
  }
  // As contagens seguem o que foi gravado na demonstração (issue 071), e as pastas também (076)
  const [folders, products] = await Promise.all([demoFolders(), demoProducts()])
  return folders.map((f) => ({ ...f, productCount: products.filter((p) => p.folderId === f.id).length }))
}

/**
 * POST /products (B27; corpo detalhado na v18, proposto): o produto e os lotes
 * iniciais, que podem ser nenhum (o produto nasce Sem validade). Código de
 * barras é único no banco (`produtos.ean`): repetido, `409 BARCODE_TAKEN`.
 *
 * Sem a área ligada, confere o que o servidor conferiria e responde como ele,
 * e desde a issue 071 o produto fica no registro da demonstração (cookie).
 */
export async function createProduct(input: NewProductInput): Promise<Product> {
  if (isLive("products")) return apiPost<Product>("/products", input)
  await assertBarcodeFree(input.barcode, null)
  await assertSkuFree(input.sku, null)
  const id = `produto-simulado-${Date.now()}`
  await record({ t: "product", at: new Date().toISOString(), id, input: withoutLots(input), lots: input.lots })
  const lots = input.lots.map((lot, i) => ({
    id: `${id}-l${i + 1}`,
    productId: "",
    code: lot.code,
    manufacturedAt: lot.manufacturedAt,
    expiresAt: lot.expiresAt,
    quantity: lot.quantity,
    status: getExpiryStatus(lot.expiresAt, CURRENT_COMPANY.soonThresholdDays),
  }))
  return mockProduct(id, withoutLots(input), lots, await demoFolders())
}

/** PATCH /products/:id: o cadastro; lote e quantidade mudam por movimentação */
export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  if (isLive("products")) return apiPatch<Product>(`/products/${encodeURIComponent(id)}`, input)
  const current = (await demoProducts()).find((p) => p.id === id)
  if (!current) {
    throw new ApiError(
      "notFound",
      404,
      "Este produto não está mais no estoque. Volte ao estoque e confira se ele foi excluído.",
      "PRODUCT_NOT_FOUND",
    )
  }
  await assertBarcodeFree(input.barcode, id)
  await assertSkuFree(input.sku, id)
  await record({ t: "edit", at: new Date().toISOString(), id, input })
  return { ...mockProduct(id, input, current.lots, await demoFolders()), source: current.source, externalId: current.externalId }
}

/* --------------------------------------------------------------------------
   Mock
   Reproduz o que o servidor faz, para as telas se comportarem igual nos dois
   modos. Sai de cena assim que a área entrar em NEXT_PUBLIC_API_LIVE.
   -------------------------------------------------------------------------- */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function rankExpiry(p: Product): number {
  if (!p.nearestExpiry) return Number.MAX_SAFE_INTEGER
  return new Date(p.nearestExpiry).getTime()
}

function sortProducts(list: Product[], sort: ProductFilters["sort"]): Product[] {
  const copy = [...list]
  switch (sort) {
    case "name_asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    case "quantity_asc":
      return copy.sort((a, b) => a.totalQuantity - b.totalQuantity)
    case "value_desc":
      return copy.sort(
        (a, b) =>
          b.totalQuantity * b.acquisitionCost - a.totalQuantity * a.acquisitionCost,
      )
    case "expiry_desc":
      // O que vence por último no topo. Sem validade vai para o fim também aqui
      // (issue 068, item 11, decisão do Marcus): a ordem é pela data, e ele não tem
      return copy.sort((a, b) => {
        if (!a.nearestExpiry || !b.nearestExpiry) return Number(!a.nearestExpiry) - Number(!b.nearestExpiry)
        return rankExpiry(b) - rankExpiry(a) || b.name.localeCompare(a.name, "pt-BR")
      })
    default:
      // expiry_asc: o que vence primeiro no topo. Sem validade vai para o fim.
      return copy.sort((a, b) => rankExpiry(a) - rankExpiry(b))
  }
}

async function mockGetProducts(
  filters: ProductFilters,
): Promise<Paginated<Product>> {
  const { page = 1, perPage = 20, search, folderId, status, source, supplier, brand, belowMin, sort } =
    filters

  // O servidor devolve só produto ativo por padrão. O mock faz o mesmo, senão
  // as telas se comportam diferente nos dois modos.
  let list = (await demoProducts()).filter((p) => p.active)

  if (search) {
    const term = normalize(search)
    list = list.filter(
      (p) =>
        normalize(p.name).includes(term) ||
        normalize(p.sku).includes(term) ||
        (p.barcode ?? "").includes(term),
    )
  }
  // "none" é o filtro "Sem pasta" (issue 068, contrato v24)
  if (folderId) list = list.filter((p) => (folderId === NO_FOLDER ? !p.folderId : p.folderId === folderId))
  if (status) {
    const wanted = new Set(Array.isArray(status) ? status : [status])
    list = list.filter((p) => wanted.has(p.nearestExpiryStatus))
  }
  if (source) list = list.filter((p) => p.source === source)
  if (supplier) list = list.filter((p) => p.supplier === supplier)
  if (brand) list = list.filter((p) => p.brand === brand)
  if (belowMin) list = list.filter((p) => p.totalQuantity < p.minStock)

  const sorted = sortProducts(list, sort)
  const start = (page - 1) * perPage

  return {
    data: sorted.slice(start, start + perPage),
    meta: { page, perPage, total: sorted.length },
  }
}

async function assertBarcodeFree(barcode: string | null, ownId: string | null) {
  const owner = barcode ? (await demoProducts()).find((p) => p.barcode === barcode && p.id !== ownId) : undefined
  if (owner) {
    throw new ApiError(
      "conflict",
      409,
      `O código de barras ${barcode} já é do produto ${owner.name}. Confira o número ou abra aquele produto.`,
      "BARCODE_TAKEN",
    )
  }
}

/**
 * Código interno repetido (issue 072, item 105, contrato v27): `409 SKU_TAKEN`,
 * como o código de barras. Maiúscula e minúscula contam como o mesmo código.
 */
async function assertSkuFree(sku: string | null, ownId: string | null) {
  if (!sku) return
  const same = (value: string) => value.trim().toLowerCase() === sku.trim().toLowerCase()
  const owner = (await demoProducts()).find((p) => p.id !== ownId && p.sku && same(p.sku))
  if (owner) {
    throw new ApiError(
      "conflict",
      409,
      `O código interno ${owner.sku} já é do produto ${owner.name}. Use outro ou deixe em branco.`,
      "SKU_TAKEN",
    )
  }
}

/** O cadastro sem os lotes: os lotes vão à parte no registro */
function withoutLots({ lots, ...rest }: NewProductInput): ProductInput {
  void lots
  return rest
}

/** O produto como o servidor devolveria; o status de verdade é do servidor */
function mockProduct(id: string, input: ProductInput, lots: Product["lots"], folders: Folder[]): Product {
  const folder = folders.find((f) => f.id === input.folderId)
  const sorted = [...lots].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
  return {
    id,
    ...input,
    sku: input.sku ?? "",
    folderName: folder?.name ?? null,
    totalQuantity: lots.reduce((sum, lot) => sum + lot.quantity, 0),
    nearestExpiry: sorted[0]?.expiresAt ?? null,
    nearestExpiryStatus: sorted[0]?.status ?? "unknown",
    lots: lots.map((lot) => ({ ...lot, productId: id })),
    source: "manual",
    externalId: null,
    active: true,
    photoUrl: null,
  }
}
