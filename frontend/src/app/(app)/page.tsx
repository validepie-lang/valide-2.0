import { ArrowDownToLine, Plus } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { StatusSummary } from "@/components/dashboard/status-summary"
import { ValueAtRiskCard } from "@/components/dashboard/value-at-risk-card"
import { FolderRiskCard } from "@/components/dashboard/folder-risk-card"
import { ShelfTipCard } from "@/components/dashboard/shelf-tip-card"
import { LotList } from "@/components/dashboard/expiring-soon-list"
import { ExpiryWeekChart } from "@/components/dashboard/expiry-week-chart"
import { expiryWeekHeadline } from "@/components/dashboard/expiry-week-headline"
import { getDashboard } from "@/lib/services/dashboard"
import { getProducts } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"
import { DEFAULT_TIME_ZONE } from "@/lib/utils/calendar"
import { formatNumber } from "@/lib/utils/format"
import type { ExpiringSoonItem, Product } from "@/lib/types"

/**
 * Home reconstruída a partir de painéis bem avaliados do Behance (issue 027):
 * fileira de indicadores com o principal em cartão cheio (Gyle, Pharmly, Vault),
 * gráfico largo com lista estreita ao lado, tabela com "Ver todos". Referências
 * e o que ficou de fora em docs/04-issues/027-home-referencias-behance.md.
 *
 * Direção A, "Painel de controle" (escolhida pelo Marcus em 09/10/2026).
 *
 * O redesign de 08/10 acertou a hierarquia e tirou força demais: tudo cinza,
 * plano e do mesmo tamanho. A direção A devolve contraste entre planos (card
 * com sombra curta sobre o fundo), cor de status com presença e escala
 * tipográfica, sem voltar a vidro, degradê ou recorte.
 *
 *   1. Valor em risco (cartão cheio) | quatro estados               nível 1 e 2
 *   2. Vencimentos por semana | vencidos para retirar             nível 2 e 3
 *   3. Lotes que vencem nos próximos dias, em tabela              nível 2
 *   4. Em risco por pasta (rosca) | foto com dica da Ajuda         nível 3 (067)
 */
const today = () => {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(new Date())
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** O lote vencido mais antigo de cada produto, no formato das listas da Home */
function firstExpiredLot(product: Product): ExpiringSoonItem | null {
  const lot = [...product.lots]
    .filter((l) => l.status === "expired")
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))[0]
  if (!lot) return null
  return {
    productId: product.id,
    productName: product.name,
    lotCode: lot.code,
    expiresAt: lot.expiresAt,
    status: lot.status,
    quantity: lot.quantity,
    unit: product.unit,
  }
}

export default async function DashboardPage() {
  const [dashboard, { company }, expiredPage] = await Promise.all([
    getDashboard(),
    getSession(),
    getProducts({ status: "expired", sort: "expiry_asc", perPage: 5 }),
  ])
  const threshold = company.soonThresholdDays
  const weeks = dashboard.expiryByWeek
  const hasUpcoming = weeks.some((w) => w.lotCount > 0)
  const expired = expiredPage.data.map(firstExpiredLot).filter((i): i is ExpiringSoonItem => i !== null)

  const { expired: expiredCount, soon: soonCount } = dashboard.counts

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* Título à esquerda, ação à direita, como no Vault ("Add New Product") */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label font-semibold text-fg-muted">{today()}</p>
          <h1 className="mt-1 font-display text-display-sm font-bold text-fg md:text-display">
            {company.tradeName}
          </h1>
        </div>
        {/* As duas tarefas mais comuns ao lado do título (issue 063). Secundárias: a ação
            principal da tela continua no cartão de valor em risco */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <LinkButton href="/estoque/saida" variant="secondary" className="w-full sm:w-auto">
            <ArrowDownToLine className="size-4" aria-hidden />
            Registrar saída
          </LinkButton>
          <LinkButton href="/estoque/novo" variant="secondary" className="w-full sm:w-auto">
            <Plus className="size-4" aria-hidden />
            Adicionar produto
          </LinkButton>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <ValueAtRiskCard dashboard={dashboard} threshold={threshold} />

        <div className="min-w-0 lg:col-span-8">
          <StatusSummary
            counts={dashboard.counts}
            pendingValue={dashboard.pendingExpiry.valueAtStake}
            soonThresholdDays={threshold}
          />
        </div>
      </div>

      {/* Gráfico largo e lista estreita ao lado: Pharmly, Gyle e Vault */}
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <section
          aria-labelledby="vencimentos-por-semana"
          className="min-w-0 rounded-md border border-line bg-surface p-5 shadow-card md:p-7 lg:col-span-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 id="vencimentos-por-semana" className="font-display text-section font-bold text-fg">
                {expiryWeekHeadline(weeks)}
              </h2>
              <p className="mt-1 text-label text-fg-muted">
                Lotes que vencem por semana, nas próximas {weeks.length} semanas
              </p>
            </div>
            <p className="flex gap-4 text-label text-fg-muted">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-[3px] bg-chart-soon" />
                Dentro dos {threshold} dias
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-[3px] bg-chart-base" />
                Depois
              </span>
            </p>
          </div>
          {hasUpcoming ? (
            <div className="mt-5">
              <ExpiryWeekChart data={weeks} soonThresholdDays={threshold} />
            </div>
          ) : null}
        </section>
        <LotList
          id="retirar"
          title="Retirar da prateleira"
          tone="expired"
          items={expired}
          action={{ href: "/estoque/retirar-vencidos", label: `Retirar os ${formatNumber(expiredCount)}` }}
          empty="Nenhum lote vencido. Nada para retirar hoje."
          className="lg:col-span-4"
        />
      </div>

      {/* Tabela com cabeçalho de colunas e "Ver todos": Gyle ("Stock Alert") e Pharmly */}
      <LotList
        id="vencem-em-breve"
        title={`Vencem nos próximos ${threshold} dias`}
        tone="soon"
        items={dashboard.expiringSoon}
        action={{ href: "/estoque?status=soon", label: `Ver os ${formatNumber(soonCount)}` }}
        empty={`Nenhum lote vence nos próximos ${threshold} dias.`}
        layout="table"
      />

      {/* Rosca do Gyle e foto do Pharmly (issue 067): o que menos pede ação fica por último */}
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <FolderRiskCard points={dashboard.byFolder} className="lg:col-span-8" />
        <ShelfTipCard className="lg:col-span-4" />
      </div>
    </div>
  )
}
