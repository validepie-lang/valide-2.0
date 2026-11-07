import { Info } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import { StockPreviewRow } from "@/components/products/stock-preview-row"
import { formatQuantity } from "@/lib/utils/format"
import type { Lot, Product } from "@/lib/types"

/**
 * Como o estoque fica depois da saída, antes de gravar: erro no balcão
 * acontece. Separado do formulário na issue 054, que passava de 200 linhas.
 */
export function ExitSummary({
  product,
  lot,
  quantity,
}: {
  product: Product
  lot: Lot | undefined
  quantity: string
}) {
  const amount = Number(quantity)
  const valid = Number.isFinite(amount) && amount > 0
  const tooMany = valid && lot ? amount > lot.quantity : false
  const remaining = lot ? lot.quantity - (valid ? amount : 0) : 0
  // Quantidade sempre com unidade (SPEC 4.4): "14" sozinho não diz se é caixa ou quilo
  const qty = (n: number) => formatQuantity(n, product.unit)

  return (
    <Card>
      <CardTitle>Como o estoque fica</CardTitle>
      <dl className="mt-4 space-y-3">
        <StockPreviewRow label="Neste lote, agora" value={qty(lot?.quantity ?? 0)} />
        <StockPreviewRow
          label="Saindo"
          value={valid ? formatQuantity(-amount, product.unit, { signed: true }) : "nada ainda"}
        />
        <div className="border-t border-line pt-3">
          <StockPreviewRow
            label="Fica neste lote"
            value={tooMany ? "confira a quantidade" : qty(Math.max(0, remaining))}
            strong
          />
        </div>
        <StockPreviewRow
          label="Total do produto"
          value={tooMany || !valid ? qty(product.totalQuantity) : qty(product.totalQuantity - amount)}
        />
      </dl>

      <p className="mt-5 flex gap-2 rounded-md bg-sunken p-3 text-label text-fg-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        Seu nome, a data e a hora entram no registro automaticamente.
      </p>
    </Card>
  )
}
