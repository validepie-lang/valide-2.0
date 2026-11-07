"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PencilLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { Field, Input, Textarea } from "@/components/ui/field"
import { FormFailure, SubmitLabel, focusFirstError } from "@/components/ui/form-status"
import { correctMovement } from "@/lib/actions/movements"
import { UNREACHABLE } from "@/lib/actions/result"
import { formatQuantity } from "@/lib/utils/format"
import { fixDelta, fixEffect, shortEventTime, validateFix, type FixDraft } from "@/lib/utils/movement-fix"
import type { Movement } from "@/lib/types"

const IDS: Record<keyof FixDraft, string> = { quantity: "quantidade-certa", note: "justificativa-ajuste" }
const EMPTY: FixDraft = { quantity: "", note: "" }

/**
 * "Corrigir" numa entrada ou saída (issue 073, item 79). O histórico não muda:
 * grava um AJUSTE com a diferença, como o "New Stock Adjustment" do Inventar
 * (Behance), com quantidade e motivo. A janela diz o que foi registrado e o que
 * vai acontecer com o lote antes de gravar; a recusa do servidor fica aqui,
 * com o que foi digitado (Primer, Saving).
 */
export function FixMovement({ movement, doneHref }: { movement: Movement; doneHref: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<FixDraft>(EMPTY)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const what = movement.type === "out" ? "saída" : "entrada"
  const recorded = formatQuantity(movement.quantity, movement.unit)
  const { errors, input } = validateFix(draft, movement)
  const shown = attempted ? errors : {}
  // O efeito no lote aparece assim que a quantidade serve, antes da justificativa
  const typed = Number(draft.quantity.replace(",", "."))
  const effect =
    draft.quantity.trim() && !errors.quantity
      ? fixEffect(fixDelta(movement, typed), movement.unit, movement.lotCode)
      : null

  function close() {
    setOpen(false)
    setDraft(EMPTY)
    setAttempted(false)
    setFailure(null)
  }

  async function submit() {
    setAttempted(true)
    setFailure(null)
    if (!input) return focusFirstError(IDS, errors)
    setSaving(true)
    const result = await correctMovement(movement.id, input).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) return setFailure(result.message)
    close()
    router.replace(doneHref, { scroll: false })
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Corrigir a ${what} de ${recorded} de ${movement.productName}, lote ${movement.lotCode}`}
        className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 lg:min-h-9 text-label font-semibold text-fg underline-offset-4 transition-colors hover:bg-primary-soft"
      >
        <PencilLine className="size-3.5" aria-hidden />
        Corrigir
      </button>
      {open ? (
        <Dialog
          open
          onClose={close}
          // A janela nasce dentro da célula da tabela, que alinha à direita
          className="text-left"
          title={`Corrigir a ${what}`}
          description={
            <>
              {what === "saída" ? "Saída" : "Entrada"} de {recorded} do lote {movement.lotCode} de{" "}
              {movement.productName}, em {shortEventTime(movement.createdAt)}, por {movement.userName}. O
              registro continua no histórico; a correção entra como ajuste.
            </>
          }
        >
          <form
            noValidate
            className="mt-5 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
          >
            <Field
              label={what === "saída" ? "Quanto saiu de fato" : "Quanto entrou de fato"}
              htmlFor={IDS.quantity}
              hint={`Registrado: ${recorded}. Use zero se não aconteceu.`}
              error={shown.quantity}
              required
            >
              <Input
                id={IDS.quantity}
                type="number"
                inputMode="decimal"
                min={0}
                value={draft.quantity}
                readOnly={saving}
                invalid={Boolean(shown.quantity)}
                aria-describedby={`${IDS.quantity}-mensagem`}
                onChange={(event) => setDraft((d) => ({ ...d, quantity: event.target.value }))}
                data-autofocus
              />
            </Field>
            <Field label="Justificativa" htmlFor={IDS.note} error={shown.note} required>
              <Textarea
                id={IDS.note}
                rows={3}
                value={draft.note}
                readOnly={saving}
                aria-invalid={Boolean(shown.note)}
                aria-describedby={shown.note ? `${IDS.note}-mensagem` : undefined}
                placeholder="Ex.: O caixa bipou a mesma caixa duas vezes."
                onChange={(event) => setDraft((d) => ({ ...d, note: event.target.value }))}
              />
            </Field>
            <p role="status" className="text-label text-fg">
              {effect}
            </p>
            {failure ? <FormFailure message={failure} after="O que você digitou continua aqui." /> : null}
            <DialogActions>
              <Button variant="secondary" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit" aria-busy={saving}>
                <SubmitLabel saving={saving} savingLabel="Corrigindo…" icon={PencilLine}>
                  Registrar ajuste
                </SubmitLabel>
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      ) : null}
    </>
  )
}
