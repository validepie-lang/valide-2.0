import Link from "next/link"
import { Settings2 } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { NoticeList } from "@/components/layout/notice-list"
import { getNotifications } from "@/lib/services/notifications"
import { getProducts } from "@/lib/services/products"
import { formatNumber, formatQuantity } from "@/lib/utils/format"

export const metadata = { title: "Avisos" }

/**
 * Avisos e estoque abaixo do mínimo (issue 037). Até aqui os avisos só
 * existiam no sino, e o mínimo (regra 7) só aparecia produto a produto.
 *
 * A lista de avisos segue o HR Management Dashboard; o estoque abaixo do
 * mínimo, a tabela "Stock Alert" do Gyle (Behance, 690 curtidas): o nome, a
 * quantidade e o mínimo, sem cor de status (falta de estoque não é validade).
 */
export default async function AvisosPage() {
  const [notifications, { data: low, meta }] = await Promise.all([
    getNotifications(),
    getProducts({ belowMin: true, sort: "quantity_asc", perPage: 50 }),
  ])

  return (
    <div>
      <PageHeader
        title="Avisos"
        description="O que mudou na farmácia e o que precisa de reposição."
        actions={
          <LinkButton href="/configuracoes/notificacoes" variant="secondary">
            <Settings2 className="size-4" aria-hidden />
            Escolher o que avisa
          </LinkButton>
        }
      />
      <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-7">
          <NoticeList items={notifications} />
        </div>

        <section
          aria-labelledby="abaixo-minimo"
          className="overflow-hidden rounded-md border border-line bg-surface shadow-card lg:col-span-5"
        >
          <div className="border-b border-line px-5 py-4 md:px-6">
            <h2 id="abaixo-minimo" className="font-display text-section font-bold text-fg">
              Abaixo do mínimo
            </h2>
            <p className="mt-0.5 text-label text-fg-muted">
              {meta.total > 0
                ? `${formatNumber(meta.total)} ${meta.total === 1 ? "produto pede" : "produtos pedem"} reposição, do mais em falta ao menos`
                : "Nenhum produto abaixo do mínimo"}
            </p>
          </div>
          {low.length > 0 ? (
            <ul className="divide-y divide-line">
              {low.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/estoque/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-primary-soft md:px-6"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body font-semibold text-fg">{p.name}</span>
                      <span className="mt-0.5 block text-label text-fg-muted">
                        Mínimo de {formatQuantity(p.minStock, p.unit)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-body font-semibold text-fg tnum">
                        {formatQuantity(p.totalQuantity, p.unit)}
                      </span>
                      <span className="block text-label text-fg-muted tnum">
                        faltam {formatQuantity(p.minStock - p.totalQuantity, p.unit)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  )
}
