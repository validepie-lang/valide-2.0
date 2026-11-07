"use client"

import { useMemo, useState } from "react"
import { Info, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMoney, formatMoneyWhole, formatNumber } from "@/lib/utils/format"
import { DiscardDone, DiscardRow } from "@/components/products/discard-row"
import { cn } from "@/lib/utils/cn"
import { discardLots } from "@/lib/actions/movements"

export type ExpiredLotRow = {
  lotId: string
  lotCode: string
  productId: string
  productName: string
  expiresAt: string
  quantity: number
  unit: string
  /** centavos por unidade */
  unitCost: number
}

/**
 * Retirar vencidos em lote (issue 035), a partir do Data Table UX/UI (Behance,
 * 576 curtidas, 18.718 visualizações): caixa de seleção em cada linha, marcar
 * todos no cabeçalho, e a ação aparece na barra do topo da tabela só quando há
 * linha marcada ("contextual actions"). Começa com todos marcados: o normal é
 * tirar tudo que venceu; desmarca-se o que ficou na loja por engano.
 *
 * Descarte é ação destrutiva e só do Farmacêutico e do Administrador (regra do
 * banco, 07/10). Por isso há um passo de confirmação dentro da própria barra,
 * e quem não pode descartar vê a lista sem as caixas, para retirar da
 * prateleira, mas não registra.
 */
export function DiscardBatch({ rows, canDiscard }: { rows: ExpiredLotRow[]; canDiscard: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(rows.map((r) => r.lotId)))
  // Quanto sai de cada lote: o lote inteiro, a não ser que parte não esteja na prateleira (item 47)
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.lotId, String(r.quantity)])),
  )
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState<ExpiredLotRow[] | null>(null)

  const chosen = useMemo(() => rows.filter((r) => selected.has(r.lotId)), [rows, selected])
  const amountOf = (r: ExpiredLotRow) => Number(amounts[r.lotId])
  const badAmount = chosen.some((r) => !(amountOf(r) >= 1 && amountOf(r) <= r.quantity))
  const units = chosen.reduce((sum, r) => sum + (amountOf(r) || 0), 0)
  const cost = chosen.reduce((sum, r) => sum + (amountOf(r) || 0) * r.unitCost, 0)
  const all = chosen.length === rows.length
  const lots = (n: number) => `${formatNumber(n)} ${n === 1 ? "lote" : "lotes"}`

  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  /** Tudo ou nada (contrato v11): se falhar, nada saiu do estoque e a seleção continua */
  async function confirm() {
    setSaving(true)
    setFailed(false)
    const result = await discardLots({
      items: chosen.map((r) => ({ lotId: r.lotId, quantity: amountOf(r) })),
      reason: "expiry",
    }).catch(() => ({ ok: false as const }))
    setSaving(false)
    if (result.ok) setDone(chosen)
    else setFailed(true)
  }

  function toggle(id: string) {
    setConfirming(false)
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (done) {
    return <DiscardDone lots={done.length} units={done.reduce((sum, r) => sum + (amountOf(r) || 0), 0)} />
  }

  return (
    <section
      aria-label="Lotes vencidos"
      className="overflow-hidden rounded-md border border-line bg-surface shadow-card"
    >
      {/* Barra do topo: o resumo da seleção e a ação contextual */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6",
          chosen.length > 0 && canDiscard && "bg-primary-soft",
        )}
      >
        <p className="text-label text-fg-muted" aria-live="polite">
          {canDiscard ? (
            <>
              <span className="font-semibold text-fg">{lots(chosen.length)}</span> de{" "}
              {formatNumber(rows.length)} marcados · <span className="tnum">{formatNumber(units)}</span>{" "}
              unidades ·{" "}
              <span className="tnum" title={formatMoney(cost)}>
                {formatMoneyWhole(cost)}
              </span>{" "}
              a preço de custo
            </>
          ) : (
            <span className="flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Retire estes lotes da prateleira. O descarte é registrado pelo farmacêutico ou pelo
              administrador.
            </span>
          )}
        </p>

        {canDiscard && chosen.length > 0 ? (
          confirming ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-label font-semibold text-fg">
                Tirar {lots(chosen.length)} do estoque? Não dá para desfazer.
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Voltar
                </Button>
                <Button onClick={confirm} disabled={saving} className="flex-1 sm:flex-none">
                  {saving ? "Registrando…" : "Confirmar descarte"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setConfirming(true)} disabled={badAmount}>
              <Trash2 className="size-4" aria-hidden />
              <span>
                Registrar descarte de <span className="tnum">{formatNumber(chosen.length)}</span>
              </span>
            </Button>
          )
        ) : null}
      </div>

      {failed ? (
        <p
          role="alert"
          className="border-b border-line bg-error-bg px-4 py-3 text-label text-error-fg md:px-6"
        >
          Não foi possível registrar o descarte. Nenhum lote saiu do estoque. Verifique a conexão e tente de
          novo.
        </p>
      ) : null}

      {canDiscard ? (
        <label className="flex min-h-11 items-center gap-3 border-b border-line bg-sunken px-4 py-2.5 text-label font-semibold text-fg-muted md:px-6">
          <input
            type="checkbox"
            checked={all}
            ref={(el) => {
              if (el) el.indeterminate = chosen.length > 0 && !all
            }}
            onChange={() => {
              setConfirming(false)
              setSelected(all ? new Set() : new Set(rows.map((r) => r.lotId)))
            }}
            className="size-4 accent-[var(--primary)]"
          />
          {all ? "Desmarcar todos" : "Marcar todos"}
        </label>
      ) : null}

      {badAmount ? (
        <p
          role="alert"
          className="border-b border-line bg-error-bg px-4 py-3 text-label text-error-fg md:px-6"
        >
          Confira a quantidade: cada lote marcado precisa sair com ao menos 1 e no máximo o que o lote tem.
        </p>
      ) : null}

      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.lotId}>
            <DiscardRow
              row={row}
              canDiscard={canDiscard}
              checked={selected.has(row.lotId)}
              quantity={amounts[row.lotId] ?? ""}
              onToggle={() => toggle(row.lotId)}
              onQuantity={(value) => {
                setConfirming(false)
                setAmounts((current) => ({ ...current, [row.lotId]: value }))
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
