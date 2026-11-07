import { Info } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import { StockPreviewRow } from "@/components/products/stock-preview-row"
import { formatDate, formatQuantity } from "@/lib/utils/format"
import type { Product } from "@/lib/types"

/**
 * "Como o estoque fica" da entrada (issue 028), com os lotes que já existem
 * para não repetir um código. Saiu de `entry-form.tsx` na issue 072, quando o
 * formulário ganhou fornecedor e nota fiscal.
 */
export function EntrySummary({ product, quantity }: { product: Product; quantity: string }) {
  const amount = Number(quantity)
  const valid = quantity !== "" && Number.isFinite(amount) && amount > 0
  const qty = (n: number) => formatQuantity(n, product.unit)
  const lots = [...product.lots].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
  return (
    <Card>
      <CardTitle>Como o estoque fica</CardTitle>
      <dl className="mt-4 space-y-3">
        <StockPreviewRow label="Total agora" value={qty(product.totalQuantity)} />
        <StockPreviewRow
          label="Entrando"
          value={valid ? formatQuantity(amount, product.unit, { signed: true }) : "nada ainda"}
        />
        <div className="border-t border-line pt-3">
          <StockPreviewRow
            label="Fica no total"
            value={qty(product.totalQuantity + (valid ? amount : 0))}
            strong
          />
        </div>
      </dl>

      {/* Os lotes que já existem, para não repetir um código por engano */}
      <h3 className="mt-6 text-label font-semibold text-fg-muted">Lotes deste produto</h3>
      {lots.length > 0 ? (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {lots.map((existing) => (
            <li key={existing.id} className="flex items-baseline justify-between gap-3 py-2.5">
              <span className="text-body text-fg">{existing.code}</span>
              <span className="text-label text-fg-muted tnum">
                {formatDate(existing.expiresAt)} · {qty(existing.quantity)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-body text-fg-muted">Nenhum ainda. Este será o primeiro.</p>
      )}

      {/* Decisão de 10/10: a entrada grava ENTRADA no histórico, como a saída */}
      <p className="mt-5 flex gap-2 rounded-md bg-sunken p-3 text-label text-fg-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        Seu nome, a data e a hora entram no histórico do produto automaticamente.
      </p>
    </Card>
  )
}
