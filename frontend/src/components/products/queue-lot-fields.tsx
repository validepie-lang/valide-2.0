"use client"

import { forwardRef } from "react"
import { Field, Input } from "@/components/ui/field"
import { StatusChip } from "@/components/ui/status-chip"
import { formatQuantity } from "@/lib/utils/format"
import { getExpiryStatus, type ExpiryStatus } from "@/lib/utils/expiry"
import type { QueueLotDraft, QueueLotErrors } from "@/lib/utils/lot-draft"
import { cn } from "@/lib/utils/cn"
import type { Product } from "@/lib/types"

/** O formulário da fila; o botão de salvar fica fora dele e aponta para cá com `form` */
export const QUEUE_FORM_ID = "fila-lote"

/** Os campos na ordem da tela: o primeiro errado recebe o foco (Primer, Forms) */
export const QUEUE_FIELD_IDS: Record<keyof QueueLotDraft, string> = {
  code: "lote",
  expiresAt: "validade",
  quantity: "quantidade",
  // Opcional e por último (issue 072, item 100): quem não tem a data na caixa segue com Enter
  madeAt: "fabricacao",
}

/** Direção A: a prévia ganha a tinta do estado que o usuário acabou de informar */
const PREVIEW_BG: Record<ExpiryStatus, string> = {
  expired: "bg-status-expired-tint border-status-expired-bg",
  soon: "bg-status-soon-tint border-status-soon-bg",
  ok: "bg-status-ok-bg/40 border-status-ok-bg",
  unknown: "bg-sunken border-transparent",
}

/**
 * Os campos da fila e a prévia da situação (issues 031 e 053; fabricação,
 * opcional, desde a 072).
 *
 * O chip de situação aparece enquanto o usuário digita a data. Este é o único
 * lugar em que o frontend calcula status: feedback imediato antes de salvar.
 * A verdade continua vindo do backend. Ver architecture.md seção 2.
 *
 * Enquanto salva, os campos ficam só leitura (Primer, Loading): o que está na
 * tela é exatamente o que foi enviado.
 */
export const QueueLotFields = forwardRef<
  HTMLInputElement,
  {
    product: Product
    draft: QueueLotDraft
    errors: QueueLotErrors
    saving: boolean
    soonThresholdDays: number
    onChange: (patch: Partial<QueueLotDraft>) => void
    onSubmit: () => void
  }
>(function QueueLotFields({ product, draft, errors, saving, soonThresholdDays, onChange, onSubmit }, lotRef) {
  const previewStatus = draft.expiresAt
    ? getExpiryStatus(`${draft.expiresAt}T00:00:00Z`, soonThresholdDays)
    : null
  const describedBy = (field: keyof QueueLotDraft) => `${QUEUE_FIELD_IDS[field]}-mensagem`

  return (
    <>
      <form
        id={QUEUE_FORM_ID}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
        className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Field label="Número do lote" htmlFor={QUEUE_FIELD_IDS.code} required error={errors.code}>
          <Input
            id={QUEUE_FIELD_IDS.code}
            ref={lotRef}
            value={draft.code}
            onChange={(e) => onChange({ code: e.target.value })}
            invalid={Boolean(errors.code)}
            aria-describedby={errors.code ? describedBy("code") : undefined}
            readOnly={saving}
            placeholder="Ex.: L2291"
            autoFocus
            autoComplete="off"
          />
        </Field>

        <Field label="Data de validade" htmlFor={QUEUE_FIELD_IDS.expiresAt} required error={errors.expiresAt}>
          <Input
            id={QUEUE_FIELD_IDS.expiresAt}
            type="date"
            value={draft.expiresAt}
            onChange={(e) => onChange({ expiresAt: e.target.value })}
            invalid={Boolean(errors.expiresAt)}
            aria-describedby={errors.expiresAt ? describedBy("expiresAt") : undefined}
            readOnly={saving}
          />
        </Field>

        <Field
          label="Quantidade"
          htmlFor={QUEUE_FIELD_IDS.quantity}
          hint={`Em branco, vale o estoque atual: ${formatQuantity(product.totalQuantity, product.unit)}`}
          error={errors.quantity}
        >
          <Input
            id={QUEUE_FIELD_IDS.quantity}
            type="number"
            inputMode="decimal"
            min={0}
            value={draft.quantity}
            onChange={(e) => onChange({ quantity: e.target.value })}
            invalid={Boolean(errors.quantity)}
            aria-describedby={describedBy("quantity")}
            readOnly={saving}
            className="tnum"
          />
        </Field>

        <Field label="Fabricação" htmlFor={QUEUE_FIELD_IDS.madeAt} hint="Opcional" error={errors.madeAt}>
          <Input
            id={QUEUE_FIELD_IDS.madeAt}
            type="date"
            value={draft.madeAt}
            onChange={(e) => onChange({ madeAt: e.target.value })}
            invalid={Boolean(errors.madeAt)}
            aria-describedby={describedBy("madeAt")}
            readOnly={saving}
          />
        </Field>
      </form>

      {/* Feedback imediato: o usuário vê na hora o que acabou de informar */}
      <div
        className={cn(
          "mt-5 flex min-h-11 items-center gap-3 rounded-sm border px-4 py-2.5 transition-colors",
          PREVIEW_BG[previewStatus ?? "unknown"],
        )}
      >
        {previewStatus ? (
          <>
            <span className="text-label text-fg-muted">
              {previewStatus === "expired"
                ? "Este lote já está vencido. Você pode salvar mesmo assim, para registrar o descarte."
                : "Este lote fica como"}
            </span>
            <StatusChip status={previewStatus} size="sm" />
          </>
        ) : (
          <span className="text-label text-fg-muted">Informe a data para ver a situação deste lote.</span>
        )}
      </div>
    </>
  )
})
