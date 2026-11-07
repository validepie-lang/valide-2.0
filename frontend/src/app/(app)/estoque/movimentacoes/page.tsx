import { redirect } from "next/navigation"
import { ArrowDownToLine, ArrowLeftRight, PackagePlus } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FormFailure } from "@/components/ui/form-status"
import { SavedBanner } from "@/components/ui/saved-banner"
import { PageHeader } from "@/components/layout/page-header"
import { StockTabs } from "@/components/products/stock-tabs"
import { StockPagination } from "@/components/products/stock-pagination"
import { MovementDayList } from "@/components/movements/movement-day-list"
import { MovementFiltersPanel } from "@/components/movements/movement-filters"
import { MovementListHeader } from "@/components/movements/movement-list-header"
import {
  PERIODS,
  movementsHref,
  parseMovementParams,
  type MovementSearchParams,
} from "@/components/movements/movement-params"
import { getMovements } from "@/lib/services/movements"
import { getProduct } from "@/lib/services/products"
import { getSession, getUsers } from "@/lib/services/session"
import { calendarToday } from "@/lib/utils/calendar"
import { rangeLabel } from "@/lib/utils/date-range"
import { canAdjustStock, demoRole } from "@/lib/utils/permissions"

export const metadata = { title: "Movimentações" }

const PER_PAGE = 25

/**
 * Movimentações (issue 041): tudo o que entrou e saiu do estoque, de todos os
 * produtos, com quem fez e quando. Sub-item do Estoque como o "Stock
 * Adjustment List" do Inventar; filtros à esquerda, como no mesmo projeto; a
 * lista agrupada por dia, como o Ctrl Panel (Behance). Referências em
 * docs/04-issues/041-movimentacoes.md. Contagem nos tipos, datas livres,
 * planilha e correção por ajuste: issue 073.
 */
export default async function MovimentacoesPage({
  searchParams,
}: {
  searchParams: Promise<MovementSearchParams>
}) {
  const params = await searchParams
  const filters = parseMovementParams(params)
  const [{ data: movements, meta, counts }, users, product, { user }] = await Promise.all([
    getMovements({ ...filters, perPage: PER_PAGE }),
    getUsers(),
    filters.productId ? getProduct(filters.productId) : null,
    getSession(),
  ])
  // Página além da última (link antigo, filtro que encolheu): vai para a última que existe
  if (movements.length === 0 && meta.total > 0) {
    const last = Math.ceil(meta.total / meta.perPage)
    redirect(movementsHref(params, { pagina: last > 1 ? String(last) : undefined }))
  }

  const periodLabel = PERIODS.find((p) => p.slug === filters.period)?.label.toLowerCase()
  const title =
    filters.period === "datas"
      ? rangeLabel(filters.from, filters.to)
      : filters.period === "hoje"
        ? "Movimentações de hoje"
        : `Últimos ${periodLabel}`
  const filtered = Boolean(params.tipo || params.motivo || params.pessoa || params.produto)
  // Corrigir é de Farmacêutico e Administrador (business-rules.md 3.5); depois, a mesma tela com a faixa
  const fixHref = canAdjustStock(demoRole(params.cargo, user.role))
    ? movementsHref(params, { corrigido: "1", pagina: params.pagina })
    : null
  const today = calendarToday().toISOString().slice(0, 10)

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Tudo o que entrou e saiu, de todos os produtos, com quem fez e quando."
        actions={
          // Como o "+ New Stock Adjustment" na lista de ajustes do Inventar (issue 042); a saída
          // geral ao lado desde a issue 063, secundária para a entrada continuar a principal
          <>
            <LinkButton href="/estoque/saida" variant="secondary">
              <ArrowDownToLine className="size-4" aria-hidden />
              Registrar saída
            </LinkButton>
            <LinkButton href="/estoque/entrada">
              <PackagePlus className="size-4" aria-hidden />
              Registrar entrada
            </LinkButton>
          </>
        }
        className="mb-0"
      />
      <StockTabs className="mt-5 mb-6" />
      {params.corrigido ? (
        <SavedBanner closeHref={movementsHref(params, { pagina: params.pagina })} className="mb-5">
          Correção registrada. O ajuste entrou no histórico, e a movimentação corrigida ficou marcada.
        </SavedBanner>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <aside className="lg:col-span-3" aria-label="Filtros">
          <MovementFiltersPanel
            params={params}
            period={filters.period}
            range={{ from: filters.from, to: filters.to, today }}
            counts={counts}
            users={users}
          />
        </aside>

        <Card className="min-w-0 overflow-hidden p-0 md:p-0 lg:col-span-9">
          <MovementListHeader
            title={title}
            params={params}
            product={product}
            total={meta.total}
            filtered={filtered}
          />
          {filters.rangeError ? (
            <FormFailure
              message={filters.rangeError}
              after="Mostrando os últimos 30 dias."
              className="mx-4 mb-4 md:mx-6"
            />
          ) : null}

          {movements.length > 0 ? (
            <>
              <MovementDayList movements={movements} fixHref={fixHref} />
              <StockPagination
                page={filters.page}
                perPage={PER_PAGE}
                total={meta.total}
                noun={["movimentação", "movimentações"]}
                label="Páginas das movimentações"
                hrefFor={(page) => movementsHref(params, { pagina: page > 1 ? String(page) : undefined })}
              />
            </>
          ) : (
            <div className="border-t border-line">
              <EmptyState
                icon={ArrowLeftRight}
                title={
                  filtered ? "Nenhuma movimentação com esses filtros" : "Nenhuma movimentação no período"
                }
                description={
                  filtered
                    ? "Tente outro tipo, motivo ou pessoa, ou um período maior."
                    : "Entradas e saídas aparecem aqui assim que alguém registra uma."
                }
                action={
                  filtered ? (
                    <LinkButton href="/estoque/movimentacoes" variant="secondary">
                      Limpar filtros
                    </LinkButton>
                  ) : (
                    <LinkButton href="/estoque">Ir para os produtos</LinkButton>
                  )
                }
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
