"use client"

import { useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { FormFailure, focusFirstError } from "@/components/ui/form-status"
import { QueueProgress, UpNext } from "@/components/products/queue-progress"
import { QueueDone } from "@/components/products/queue-done"
import { QUEUE_FIELD_IDS, QueueLotFields } from "@/components/products/queue-lot-fields"
import { QueueActions } from "@/components/products/queue-actions"
import { QueueSaved, type QueueNotice } from "@/components/products/queue-saved"
import { addLot, removeLot } from "@/lib/actions/lots"
import { UNREACHABLE } from "@/lib/actions/result"
import { formatDate, formatMoney, formatQuantity } from "@/lib/utils/format"
import { NO_STREAK, afterSave, afterSkip, type Streak } from "@/lib/utils/queue-streak"
import { validateQueueLot, type QueueLotDraft, type QueueLotErrors } from "@/lib/utils/lot-draft"
import type { Product } from "@/lib/types"

const stockValue = (p: Product) => p.totalQuantity * p.acquisitionCost
const EMPTY: QueueLotDraft = { code: "", madeAt: "", expiresAt: "", quantity: "" }

/** O que o "Desfazer" precisa para devolver o produto à tela como estava */
type LastSave = { productId: string; lotId: string; index: number; draft: QueueLotDraft; streak: Streak }

/**
 * Fila de preenchimento rápido (SPEC 5.4).
 *
 * Tela de trabalho repetitivo: cada clique economizado importa. Quem preenche
 * 400 itens não usa mouse, então Enter salva e avança e o foco volta sozinho
 * para o primeiro campo.
 *
 * Desde a issue 053, salvar grava: o lote vai por server action para
 * POST /products/:id/lots. Valida ao enviar e, depois da primeira tentativa,
 * enquanto se digita (Primer, Forms). Se o servidor recusar, o que foi
 * digitado fica (Primer, Saving).
 *
 * Issue 072: o salvo tem "Desfazer" (o lote sai e o produto volta com o que
 * foi digitado) e a fila conta as seguidas (`queue-streak`).
 */
export function QuickFillForm({
  products: queue,
  soonThresholdDays,
}: {
  products: Product[]
  soonThresholdDays: number
}) {
  // A fila é a da hora em que a tela abriu: gravar (e o cookie da demonstração)
  // recarrega a página sem o produto salvo, e a posição pularia um a cada salvo
  const [products] = useState(queue)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState<string[]>([])
  const [skipped, setSkipped] = useState<string[]>([])
  const [draft, setDraft] = useState<QueueLotDraft>(EMPTY)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  // Recusa do servidor: o código repetido vale enquanto o número digitado for o mesmo
  const [takenCode, setTakenCode] = useState<{ code: string; message: string } | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [notice, setNotice] = useState<QueueNotice | null>(null)
  const [last, setLast] = useState<LastSave | null>(null)
  const [undoing, setUndoing] = useState(false)
  const [streak, setStreak] = useState<Streak>(NO_STREAK)
  const lotRef = useRef<HTMLInputElement>(null)

  const product = products[index]
  const total = products.length
  const filled = done.length

  // O que ainda está parado sem validade. Pular não tira o produto daqui
  const remainingValue = useMemo(() => {
    const filledIds = new Set(done)
    return products.reduce((sum, p) => (filledIds.has(p.id) ? sum : sum + stockValue(p)), 0)
  }, [products, done])

  const errors: QueueLotErrors = {
    ...(attempted && product ? validateQueueLot(draft, { stock: product.totalQuantity }).errors : {}),
    ...(takenCode && takenCode.code === draft.code.trim() ? { code: takenCode.message } : {}),
  }

  function advance() {
    setIndex((i) => Math.min(i + 1, total))
    setDraft(EMPTY)
    setAttempted(false)
    setTakenCode(null)
    setFailure(null)
    requestAnimationFrame(() => lotRef.current?.focus())
  }

  async function save() {
    if (!product || saving) return
    const { errors: invalid, input } = validateQueueLot(draft, { stock: product.totalQuantity })
    setAttempted(true)
    setFailure(null)
    if (!input) return focusFirstError(QUEUE_FIELD_IDS, invalid)

    setSaving(true)
    const result = await addLot(product.id, input).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) {
      if (result.code === "LOT_CODE_TAKEN") {
        setTakenCode({ code: input.code, message: result.message })
        lotRef.current?.focus()
      } else {
        setFailure(result.message)
      }
      return
    }

    const next = afterSave(streak)
    setLast({ productId: product.id, lotId: result.data.id, index, draft, streak })
    setStreak(next)
    const text = `Salvo: ${product.name}, lote ${input.code}, vence em ${formatDate(input.expiresAt)}.`
    setNotice({ kind: "saved", text, streak: next.current })
    setDone((d) => [...d, product.id])
    advance()
  }

  async function undo() {
    if (!last || undoing) return
    setUndoing(true)
    const result = await removeLot(last.productId, last.lotId).catch(() => UNREACHABLE)
    setUndoing(false)
    if (!result.ok) return setFailure(result.message)
    setIndex(last.index)
    setDone((d) => d.filter((id) => id !== last.productId))
    setStreak(last.streak)
    setLast(null)
    setNotice({ kind: "undone", text: "Desfeito. O produto voltou com o que você digitou." })
    setDraft(last.draft)
    setFailure(null)
    requestAnimationFrame(() => lotRef.current?.focus())
  }

  function skip() {
    if (!product || saving) return
    setSkipped((s) => [...s, product.id])
    setStreak(afterSkip)
    setNotice(null)
    setLast(null)
    advance()
  }

  const savedLine = <QueueSaved notice={notice} undoing={undoing} onUndo={undo} />

  if (!product) {
    return (
      <div className="max-w-2xl">
        {failure ? <FormFailure message={failure} className="mb-3" /> : null}
        <div className={notice ? "mb-3" : undefined}>{savedLine}</div>
        <QueueDone total={total} filled={filled} skipped={skipped.length} best={streak.best} />
      </div>
    )
  }

  const meta = [product.sku, product.folderName, product.brand].filter(Boolean).join(" · ")

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Faixa cinza no topo: todo produto da fila é Sem validade (direção A, regra 2) */}
      <Card className="border-t-[5px] border-t-status-unknown lg:col-span-2">
        <QueueProgress
          position={index + 1}
          total={total}
          filled={filled}
          streak={streak.current}
          remainingValue={remainingValue}
        />

        {/* O produto salvo sai da tela: a confirmação fica no cartão (Primer, Saving) */}
        {savedLine}

        {/* Quem preenche precisa saber o que tem na mão: nome primeiro */}
        <div className="mt-5 border-b border-line pb-5">
          <h2 className="font-display text-section font-bold text-fg md:text-display-sm">{product.name}</h2>
          <p className="mt-1 text-label text-fg-muted">{meta}</p>
          <p className="mt-0.5 text-label text-fg-muted">
            <span className="tnum">{formatQuantity(product.totalQuantity, product.unit)}</span> em estoque ·{" "}
            <span className="tnum">{formatMoney(stockValue(product))}</span> parados
          </p>
        </div>

        <QueueLotFields
          ref={lotRef}
          product={product}
          draft={draft}
          errors={errors}
          saving={saving}
          soonThresholdDays={soonThresholdDays}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onSubmit={save}
        />

        {failure ? <FormFailure message={failure} className="mt-5" /> : null}

        <QueueActions saving={saving} onSkip={skip} />
      </Card>

      <UpNext products={products.slice(index + 1, index + 6)} />
    </div>
  )
}
