"use client"

import { Trash2 } from "lucide-react"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { Field, Input } from "@/components/ui/field"
import { StatusChip } from "@/components/ui/status-chip"
import { getExpiryStatus } from "@/lib/utils/expiry"
import { cn } from "@/lib/utils/cn"
import type { LotDraftErrors } from "@/lib/utils/lot-draft"

export type LotDraft = {
  key: number
  code: string
  madeAt: string
  expiresAt: string
  quantity: string
}

export function emptyLot(): LotDraft {
  return { key: Date.now(), code: "", madeAt: "", expiresAt: "", quantity: "" }
}

/**
 * Bloco de um lote no cadastro de produto.
 *
 * O chip de situação aparece enquanto a data é digitada. É o caso previsto em
 * architecture.md seção 2: o frontend calcula localmente só para dar feedback
 * imediato antes de salvar. A verdade continua vindo do backend.
 */
export function LotFields({
  lot,
  index,
  removable,
  soonThresholdDays,
  onChange,
  onRemove,
  heading,
  takenCodes,
  errors = {},
  readOnly,
}: {
  lot: LotDraft
  index: number
  removable: boolean
  /** null tira o título e a moldura: o bloco já está dentro de um card (entrada, issue 028) */
  heading?: string | null
  /** códigos de lote que o produto já tem: repetir é recusado (decisão de 10/10) */
  takenCodes?: string[]
  /** recusas do envio (issue 054): valem sobre os avisos que aparecem enquanto se digita */
  errors?: LotDraftErrors
  /** enquanto grava: o que está na tela é o que foi enviado */
  readOnly?: boolean
  soonThresholdDays: number
  onChange: (patch: Partial<LotDraft>) => void
  onRemove: () => void
}) {
  const status = lot.expiresAt ? getExpiryStatus(`${lot.expiresAt}T00:00:00Z`, soonThresholdDays) : null
  const typed = lot.code.trim().toLowerCase()
  const taken = typed !== "" ? takenCodes?.find((code) => code.toLowerCase() === typed) : undefined
  const inverted = Boolean(lot.madeAt && lot.expiresAt && lot.expiresAt < lot.madeAt)
  const codeError =
    errors.code ??
    (taken ? `Este produto já tem o lote ${taken}. Confira o número impresso na caixa.` : undefined)
  const expiryError =
    errors.expiresAt ??
    (inverted ? "A data de validade não pode ser anterior à data de fabricação." : undefined)
  const ids = {
    code: `lote-${lot.key}`,
    madeAt: `fab-${lot.key}`,
    expiresAt: `val-${lot.key}`,
    quantity: `qtd-${lot.key}`,
  }
  const describe = (id: string, error: string | undefined) => (error ? `${id}-mensagem` : undefined)

  return (
    <div className={cn(heading !== null && "rounded-md border border-line p-4")}>
      {heading !== null || removable ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-label font-medium text-fg">{heading ?? `Lote ${index + 1}`}</p>
          {removable ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-label font-medium text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Remover este lote
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Número do lote" htmlFor={ids.code} required error={codeError}>
          <Input
            id={ids.code}
            value={lot.code}
            onChange={(e) => onChange({ code: e.target.value })}
            invalid={Boolean(codeError)}
            aria-describedby={describe(ids.code, codeError)}
            readOnly={readOnly}
            placeholder="Ex.: L2291"
          />
        </Field>
        <Field label="Fabricação" htmlFor={ids.madeAt} hint="Opcional" error={errors.madeAt}>
          <Input
            id={ids.madeAt}
            type="date"
            value={lot.madeAt}
            onChange={(e) => onChange({ madeAt: e.target.value })}
            invalid={Boolean(errors.madeAt)}
            aria-describedby={describe(ids.madeAt, errors.madeAt)}
            readOnly={readOnly}
          />
        </Field>
        <Field label="Validade" htmlFor={ids.expiresAt} required error={expiryError}>
          <Input
            id={ids.expiresAt}
            type="date"
            value={lot.expiresAt}
            onChange={(e) => onChange({ expiresAt: e.target.value })}
            invalid={Boolean(expiryError)}
            aria-describedby={describe(ids.expiresAt, expiryError)}
            readOnly={readOnly}
          />
        </Field>
        <Field label="Quantidade" htmlFor={ids.quantity} required error={errors.quantity}>
          <QuantityStepper
            id={ids.quantity}
            value={lot.quantity}
            onChange={(quantity) => onChange({ quantity })}
            invalid={Boolean(errors.quantity)}
            describedBy={describe(ids.quantity, errors.quantity)}
            readOnly={readOnly}
          />
        </Field>
      </div>

      <div
        className={cn(
          "mt-4 flex min-h-9 flex-wrap items-center gap-3 rounded-md px-3.5 py-2.5",
          status === "expired" ? "bg-status-expired-bg" : "bg-sunken",
        )}
      >
        {status ? (
          <>
            <span
              className={cn("text-label", status === "expired" ? "text-status-expired-fg" : "text-fg-muted")}
            >
              {status === "expired"
                ? "Atenção: este lote já está vencido. Você pode cadastrar mesmo assim, para registrar o descarte."
                : "Este lote fica como"}
            </span>
            <StatusChip status={status} size="sm" />
          </>
        ) : (
          <span className="text-label text-fg-muted">Informe a validade para ver a situação deste lote.</span>
        )}
      </div>
    </div>
  )
}
