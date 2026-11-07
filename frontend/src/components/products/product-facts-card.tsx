import { formatMoney, formatQuantity } from "@/lib/utils/format"
import { SOURCE_LABEL, UNIT_LABEL, type Product } from "@/lib/types"

/**
 * Ficha do produto, embaixo dos lotes (issue 030), como o "Basic
 * information" do Inventar (Behance): pares de rótulo e valor, sem campo.
 * Rótulo em caixa normal: caixa alta espaçada é proibida (design-system 14.9).
 */
export function ProductFactsCard({ product }: { product: Product }) {
  return (
    <section aria-labelledby="ficha" className="rounded-md border border-line bg-surface shadow-card">
      <div className="border-b border-line px-5 py-4 md:px-6">
        <h2 id="ficha" className="font-display text-section font-bold text-fg">
          Ficha do produto
        </h2>
      </div>
      <div className="grid gap-6 px-5 py-5 md:grid-cols-3 md:gap-8 md:px-6">
        <Group title="Identificação">
          <Row label="Código interno" value={product.sku} />
          <Row label="Código de barras" value={product.barcode ?? "não informado"} />
          <Row label="Fornecedor" value={product.supplier ?? "não informado"} />
          <Row label="Origem" value={SOURCE_LABEL[product.source]} />
        </Group>
        <Group title="Valores">
          <Row label="Custo de aquisição" value={formatMoney(product.acquisitionCost)} numeric />
          <Row label="Custos operacionais" value={formatMoney(product.operationalCost)} numeric />
          <Row label="Preço de venda" value={formatMoney(product.salePrice)} numeric />
        </Group>
        <Group title="Estoque">
          <Row label="Estoque mínimo" value={formatQuantity(product.minStock, product.unit)} numeric />
          <Row
            label="Estoque máximo"
            value={product.maxStock ? formatQuantity(product.maxStock, product.unit) : "não definido"}
            numeric={Boolean(product.maxStock)}
          />
          <Row label="Unidade" value={UNIT_LABEL[product.unit]} />
        </Group>
      </div>
    </section>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-label font-semibold text-fg-muted">{title}</h3>
      <dl className="mt-2 divide-y divide-line border-y border-line">{children}</dl>
    </div>
  )
}

/** `numeric` liga os algarismos tabulares; código com hífen fica sem (a Inter alarga o hífen) */
function Row({ label, value, numeric }: { label: string; value: string; numeric?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-label text-fg-muted">{label}</dt>
      <dd className={numeric ? "text-right text-body text-fg tnum" : "text-right text-body text-fg"}>{value}</dd>
    </div>
  )
}
