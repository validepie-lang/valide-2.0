"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { ExitLotPicker } from "@/components/products/exit-lot-picker"
import { UnsavedGuard } from "@/components/ui/unsaved-guard"
import { ArrowDownToLine, Repeat } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Field, Select, Textarea } from "@/components/ui/field"
import { FormFailure, SubmitLabel, focusFirstError } from "@/components/ui/form-status"
import { ExitSummary } from "@/components/products/exit-summary"
import { exitLot } from "@/lib/actions/movements"
import { UNREACHABLE } from "@/lib/actions/result"
import { validateExit, type ExitDraftErrors } from "@/lib/utils/exit-draft"
import { formatQuantity } from "@/lib/utils/format"
import { canDiscard, isDiscard } from "@/lib/utils/permissions"
import { EXIT_REASON_LABEL, type ExitReason, type Product, type UserRole } from "@/lib/types"

const REASONS = Object.entries(EXIT_REASON_LABEL) as [ExitReason, string][]
const IDS = { quantity: "quantidade-saida", reason: "motivo" }

/**
 * Registro de saída.
 *
 * FEFO sugere, não obriga: o lote que vence primeiro vem pré-selecionado e
 * sinalizado, mas o balconista pode trocar. Interface que força a regra quebra
 * o trabalho real de quem está no balcão.
 * Ver docs/07-decisions/ux-decisions.md, 16/09/2026.
 *
 * Descarte (vencimento ou avaria) só aparece para Farmacêutico e Administrador,
 * regra do banco de 07/10/2026. Esconder aqui é só interface: o servidor recusa.
 *
 * Desde a issue 054 grava (POST /movements/out) e volta ao produto com a
 * confirmação no topo. O botão não fica mais desabilitado esperando o
 * formulário ficar certo: valida ao enviar e diz o que falta (Primer, Saving).
 */
export function ExitForm({ product, role }: { product: Product; role: UserRole }) {
  const lots = [...product.lots].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
  )
  const [lotId, setLotId] = useState(lots[0]?.id ?? "")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState<ExitReason | "">("")
  const [note, setNote] = useState("")
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const router = useRouter()

  const lot = lots.find((l) => l.id === lotId) ?? lots[0]
  const amount = Number(quantity)
  const valid = Number.isFinite(amount) && amount > 0
  const tooMany = valid && lot ? amount > lot.quantity : false
  const discardAllowed = canDiscard(role)
  const reasons = discardAllowed ? REASONS : REASONS.filter(([key]) => !isDiscard(key))
  // Quantidade sempre com unidade (SPEC 4.4): "14" sozinho não diz se é caixa ou quilo
  const qty = (n: number) => formatQuantity(n, product.unit)
  const draft = { lotId: lot?.id ?? "", quantity, reason, note }
  const rules = { available: lot?.quantity ?? 0, availableLabel: qty(lot?.quantity ?? 0) }
  // Passar do que o lote tem aparece na hora; o resto, a partir do primeiro envio
  const errors: ExitDraftErrors = attempted
    ? validateExit(draft, rules).errors
    : tooMany
      ? { quantity: validateExit(draft, rules).errors.quantity }
      : {}

  /** `another`: "Registrar e fazer outra" (issue 072, item 101) fica na tela de saída */
  async function save(another = false) {
    if (saving) return
    const { errors: invalid, input } = validateExit(draft, rules)
    setAttempted(true)
    setFailure(null)
    if (!input || !lot) return focusFirstError(IDS, invalid)

    setSaving(true)
    const result = await exitLot(input).catch(() => UNREACHABLE)
    if (!result.ok) {
      setSaving(false)
      setFailure(result.message)
      return
    }
    // `mov` deixa a faixa de confirmação desfazer a saída (issue 072, item 102)
    const done = new URLSearchParams({
      registrado: "saida",
      lote: lot.code,
      qtd: String(input.quantity),
      mov: result.data.id,
    })
    router.push(another ? `/estoque/${product.id}/baixa?${done}` : `/estoque/${product.id}?${done}`)
  }

  return (
    <UnsavedGuard>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-4 lg:col-span-2">
          <ExitLotPicker lots={lots} value={lotId} onChange={setLotId} unit={product.unit} />

          <Card>
            <CardTitle>O que está saindo</CardTitle>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Quantidade"
                htmlFor={IDS.quantity}
                required
                error={errors.quantity}
                hint={`Disponível neste lote: ${qty(lot?.quantity ?? 0)}`}
              >
                <QuantityStepper
                  id={IDS.quantity}
                  min={0}
                  max={lot?.quantity}
                  value={quantity}
                  onChange={setQuantity}
                  invalid={Boolean(errors.quantity)}
                  describedBy={`${IDS.quantity}-mensagem`}
                  readOnly={saving}
                />
              </Field>

              <Field
                label="Motivo da saída"
                htmlFor={IDS.reason}
                required
                error={errors.reason}
                hint={
                  discardAllowed
                    ? undefined
                    : "Descarte por vencimento ou avaria é feito pelo farmacêutico ou pelo administrador."
                }
              >
                <Select
                  id={IDS.reason}
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ExitReason)}
                  aria-invalid={errors.reason ? true : undefined}
                  aria-describedby={errors.reason || !discardAllowed ? `${IDS.reason}-mensagem` : undefined}
                  disabled={saving}
                  className={errors.reason ? "border-error hover:border-error" : undefined}
                >
                  <option value="">Escolha o motivo</option>
                  {reasons.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Justificativa"
                htmlFor="observacao"
                hint="Opcional. Explique quando a saída foge do comum. Fica no histórico junto com o seu nome."
                className="sm:col-span-2"
              >
                <Textarea
                  id="observacao"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  readOnly={saving}
                  aria-describedby="observacao-mensagem"
                  placeholder="Ex.: caixa amassada na entrega da segunda-feira"
                />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <ExitSummary product={product} lot={lot} quantity={quantity} />

          <div className="flex flex-col gap-2">
            {failure ? <FormFailure message={failure} /> : null}
            <Button type="submit" size="lg" aria-busy={saving}>
              <SubmitLabel saving={saving} icon={ArrowDownToLine}>
                Registrar saída
              </SubmitLabel>
            </Button>
            {/* Várias saídas seguidas do mesmo produto sem voltar a ele (issue 072, item 101) */}
            <Button variant="secondary" size="lg" disabled={saving} onClick={() => void save(true)}>
              <Repeat className="size-4" aria-hidden />
              Registrar e fazer outra
            </Button>
            <LinkButton data-discard href={`/estoque/${product.id}`} variant="ghost">
              Voltar sem registrar
            </LinkButton>
          </div>
        </aside>
      </form>
    </UnsavedGuard>
  )
}
