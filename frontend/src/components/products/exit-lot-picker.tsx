import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { StatusChip } from "@/components/ui/status-chip"
import { formatDate, formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { ExpiryStatus } from "@/lib/utils/expiry"
import type { Lot, ProductUnit } from "@/lib/types"

/** Direção A: barra de estado à esquerda de cada lote, como no estoque e no detalhe */
const LOT_BAR: Record<ExpiryStatus, string> = {
  expired: "border-l-status-expired",
  soon: "border-l-status-soon",
  ok: "border-l-status-ok",
  unknown: "border-l-status-unknown",
}

/**
 * De qual lote sai (saída do produto). Separado do formulário na issue 047
 * (item 31): o formulário passava de 200 linhas.
 *
 * FEFO sugere, não obriga: `lots` chega do que vence primeiro ao último, e o
 * primeiro vem marcado, mas qualquer um pode ser escolhido.
 */
export function ExitLotPicker({
  lots,
  value,
  onChange,
  unit,
}: {
  lots: Lot[]
  value: string
  onChange: (lotId: string) => void
  unit: ProductUnit
}) {
  return (
    <Card>
      <CardTitle>De qual lote vai sair</CardTitle>
      <CardSubtitle>Sugerimos o que vence primeiro. Se precisar tirar de outro, é só escolher.</CardSubtitle>

      <fieldset className="mt-5">
        <legend className="sr-only">Escolha o lote</legend>
        <div className="grid gap-2">
          {lots.map((option, i) => {
            const checked = option.id === value
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-l-[5px] p-4 transition-colors",
                  checked ? "border-primary bg-primary-soft" : "border-line hover:border-line-strong",
                  // Por último: a cor da seleção, nos quatro lados, apagaria a da barra
                  LOT_BAR[option.status],
                )}
              >
                <input
                  type="radio"
                  name="lote"
                  value={option.id}
                  checked={checked}
                  onChange={() => onChange(option.id)}
                  className="size-4 accent-[var(--primary)]"
                />
                <span className="text-body font-medium text-fg tnum">Lote {option.code}</span>
                {/* Texto neutro, como na tabela de lotes: a pílula cheia em cor de
                    ação competia com o botão de registrar */}
                {i === 0 ? <span className="text-label text-fg-muted">vence primeiro</span> : null}
                <span className="text-label text-fg-muted tnum">
                  {option.status === "expired" ? "venceu em" : "vence em"} {formatDate(option.expiresAt)}
                </span>
                <span className="ml-auto flex items-center gap-3">
                  <span className="text-label text-fg-muted tnum">
                    {formatQuantity(option.quantity, unit)} disponíveis
                  </span>
                  <StatusChip status={option.status} size="sm" />
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </Card>
  )
}
