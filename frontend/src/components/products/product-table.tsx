import Link from "next/link"
import { ArrowDownToLine, ArrowLeftRight } from "lucide-react"
import { StatusChip } from "@/components/ui/status-chip"
import { formatMoney, formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { OptionalColumn } from "@/lib/utils/stock-columns"
import type { Product } from "@/lib/types"
import { SortableTh, type ProductSort } from "@/components/products/sortable-th"
import { BAR, ExpiryCell, Td, Th, nearestLotCode } from "@/components/products/product-table-cells"
import { PageCheckbox, RowCheckbox } from "@/components/products/stock-selection"

/** A coluna do produto fica parada quando a tabela rola para o lado (issue 068) */
const STICKY = "sticky left-0 z-10 shadow-[inset_-1px_0_0_var(--line)] lg:shadow-none"

/**
 * Tabela do estoque (SPEC 5.2).
 *
 * Desde a issue 068 (item 10, decisão do Marcus), a mesma tabela em todas as
 * larguras: no celular ela rola para o lado, com a coluna do produto parada,
 * como recomenda a NN/g ("Mobile Tables") e o "Complex data tables on mobile".
 * Antes o celular via cartões.
 *
 * Quatro colunas respondem a pergunta da tela: produto, validade, situação e
 * quantidade. O resto liga no seletor de colunas. Saiu o selo "no mínimo",
 * que aparecia em quase toda linha e fala de reposição, não de validade: o
 * estoque mínimo virou coluna opcional e continua no detalhe.
 */
export function ProductTable({
  products,
  columns,
  sort = "expiry_asc",
  sortHref,
}: {
  products: Product[]
  columns: OptionalColumn[]
  /** a ordem atual; sem `sortHref`, o cabeçalho não ordena */
  sort?: ProductSort
  sortHref?: (sort: ProductSort) => string
}) {
  const show = new Set(columns)

  return (
    <>
      <p className="flex items-center gap-1.5 px-4 pt-3 pb-2 text-label text-fg-muted md:px-6 lg:hidden">
        <ArrowLeftRight className="size-3.5" aria-hidden />
        Arraste a tabela para o lado para ver todas as colunas.
      </p>
      {/* Região com foco: quem usa teclado rola com as setas (WCAG 2.1.1) */}
      <div role="region" aria-label="Tabela de produtos" tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse lg:min-w-0">
          <thead>
            <tr className="border-b border-line bg-sunken text-left">
              {sortHref ? (
                <SortableTh
                  label="Produto"
                  current={sort}
                  options={[{ sort: "name_asc", direction: "ascending", hint: "de A a Z" }]}
                  hrefFor={sortHref}
                  className={cn(STICKY, "bg-sunken")}
                  leading={<PageCheckbox />}
                />
              ) : (
                <Th className={cn(STICKY, "bg-sunken")}>Produto</Th>
              )}
              {show.has("codigo") ? <Th>Código interno</Th> : null}
              {show.has("pasta") ? <Th>Pasta</Th> : null}
              {show.has("lote") ? <Th>Lote</Th> : null}
              {sortHref ? (
                <SortableTh
                  label="Validade"
                  current={sort}
                  options={[
                    { sort: "expiry_asc", direction: "ascending", hint: "do que vence primeiro" },
                    { sort: "expiry_desc", direction: "descending", hint: "do que vence por último" },
                  ]}
                  hrefFor={sortHref}
                />
              ) : (
                <Th>Validade</Th>
              )}
              <Th>Situação</Th>
              {sortHref ? (
                <SortableTh
                  label="Quantidade"
                  current={sort}
                  options={[{ sort: "quantity_asc", direction: "ascending", hint: "da menor quantidade" }]}
                  hrefFor={sortHref}
                  className="text-right"
                />
              ) : (
                <Th className="text-right">Quantidade</Th>
              )}
              {show.has("minimo") ? <Th className="text-right">Estoque mínimo</Th> : null}
              {show.has("custo") ? <Th className="text-right">Custo parado</Th> : null}
              <Th className="w-12"><span className="sr-only">Ações</span></Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const lot = nearestLotCode(p)
              return (
                <tr key={p.id} className="group border-b border-line last:border-b-0 hover:bg-primary-soft">
                  <Td className={cn(STICKY, "bg-surface group-hover:bg-primary-soft")}>
                    <div className="flex min-h-10 items-stretch gap-3">
                      {/* Só aparece dentro de StockSelection (issue 069) */}
                      <RowCheckbox id={p.id} name={p.name} />
                      <span aria-hidden className={cn("w-1 shrink-0 rounded-pill", BAR[p.nearestExpiryStatus])} />
                      <Link
                        href={`/estoque/${p.id}`}
                        className="block w-36 self-center text-body font-semibold text-fg hover:underline sm:w-56 lg:w-auto lg:max-w-sm"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </Td>
                  {show.has("codigo") ? <Td className="text-body text-fg-muted">{p.sku}</Td> : null}
                  {show.has("pasta") ? (
                    <Td className="text-body text-fg-muted">{p.folderName ?? "Sem pasta"}</Td>
                  ) : null}
                  {show.has("lote") ? (
                    <Td className="text-body text-fg-muted">
                      {lot ?? "Sem lote"}
                      {p.lots.length > 1 ? (
                        <span className="ml-1 text-label">e mais {p.lots.length - 1}</span>
                      ) : null}
                    </Td>
                  ) : null}
                  <Td><ExpiryCell product={p} /></Td>
                  <Td><StatusChip status={p.nearestExpiryStatus} size="sm" /></Td>
                  <Td className="text-right text-body font-medium text-fg tnum">
                    {formatQuantity(p.totalQuantity, p.unit)}
                  </Td>
                  {show.has("minimo") ? (
                    <Td className="text-right text-body text-fg-muted tnum">
                      {formatQuantity(p.minStock, p.unit)}
                    </Td>
                  ) : null}
                  {show.has("custo") ? (
                    <Td className="text-right text-body text-fg-muted tnum">
                      {formatMoney(p.totalQuantity * p.acquisitionCost)}
                    </Td>
                  ) : null}
                  <Td className="text-right">
                    <Link
                      href={`/estoque/${p.id}/baixa`}
                      aria-label={`Registrar saída de ${p.name}`}
                      title="Registrar saída"
                      className="inline-grid size-9 place-items-center rounded-sm text-fg-muted transition-colors hover:bg-surface hover:text-fg"
                    >
                      <ArrowDownToLine className="size-4" aria-hidden />
                    </Link>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </>
  )
}
