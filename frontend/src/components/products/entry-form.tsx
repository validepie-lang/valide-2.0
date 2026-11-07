"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UnsavedGuard } from "@/components/ui/unsaved-guard"
import { PackagePlus } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { FormFailure, SubmitLabel, focusFirstError } from "@/components/ui/form-status"
import { LotFields, emptyLot, type LotDraft } from "@/components/products/lot-fields"
import { EntrySummary } from "@/components/products/entry-summary"
import { EntryOriginFields, ORIGIN_IDS } from "@/components/products/entry-origin-fields"
import { addLot } from "@/lib/actions/lots"
import { UNREACHABLE } from "@/lib/actions/result"
import {
  validateEntryOrigin,
  validateLot,
  type EntryOriginDraft,
  type LotDraftErrors,
} from "@/lib/utils/lot-draft"
import type { Product } from "@/lib/types"

/**
 * Entrada de um lote num produto que já existe (issue 028).
 *
 * Abre do detalhe do produto, como o "Adjust Stock" do Inventar (Behance), e
 * repete o desenho da saída: campos à esquerda, o resultado à direita antes de
 * gravar. O botão de registrar nunca fica desabilitado (Primer, Saving).
 * Endpoint: POST /products/:id/lots, que grava também a ENTRADA no histórico.
 * Código de lote repetido no mesmo produto é recusado (decisões de 10/10).
 *
 * Desde a issue 054 grava: valida ao enviar (Primer, Forms), envia por server
 * action e, gravado, volta para onde o resultado aparece com a confirmação no
 * topo (Primer, Saving): o produto, ou a busca da entrada geral, para o
 * próximo da caixa que chegou.
 */
export function EntryForm({
  product,
  soonThresholdDays,
  backHref = `/estoque/${product.id}`,
  focusLot = false,
  returnTo = "product",
  suppliers = [],
}: {
  product: Product
  soonThresholdDays: number
  /** para onde "Voltar sem registrar" leva: o produto, ou a busca da entrada geral (issue 042) */
  backHref?: string
  /** foco no número do lote ao abrir: quem acabou de bipar segue digitando (issue 042) */
  focusLot?: boolean
  /** depois de gravar: o produto, ou a busca da entrada geral (issue 054) */
  returnTo?: "product" | "entry"
  /** fornecedores que já existem na conta, para sugerir (issue 072, item 22) */
  suppliers?: string[]
}) {
  const router = useRouter()
  const [lot, setLot] = useState<LotDraft>({ ...emptyLot(), key: 1 })
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rejected, setRejected] = useState<{ code: string; message: string } | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [origin, setOrigin] = useState<EntryOriginDraft>({ supplier: product.supplier ?? "", invoice: "" })
  const originErrors = attempted ? validateEntryOrigin(origin).errors : {}
  const takenCodes = product.lots.map((existing) => existing.code)
  const errors: LotDraftErrors = {
    ...(attempted ? validateLot(lot, { takenCodes }).errors : {}),
    ...(rejected && rejected.code === lot.code.trim() ? { code: rejected.message } : {}),
  }
  useEffect(() => {
    if (focusLot) document.getElementById(`lote-${lot.key}`)?.focus()
    // Só ao abrir: depois, o foco é de quem está digitando
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const ids = {
    code: `lote-${lot.key}`,
    madeAt: `fab-${lot.key}`,
    expiresAt: `val-${lot.key}`,
    quantity: `qtd-${lot.key}`,
  }

  async function save() {
    if (saving) return
    const { errors: invalid, input } = validateLot(lot, { takenCodes })
    const from = validateEntryOrigin(origin)
    setAttempted(true)
    setFailure(null)
    if (!input) return focusFirstError(ids, invalid)
    if (Object.keys(from.errors).length > 0) return focusFirstError(ORIGIN_IDS, from.errors)

    setSaving(true)
    const result = await addLot(product.id, { ...input, ...from.value }).catch(() => UNREACHABLE)
    if (!result.ok) {
      setSaving(false)
      if (result.code === "LOT_CODE_TAKEN") {
        setRejected({ code: input.code, message: result.message })
        document.getElementById(ids.code)?.focus()
      } else {
        setFailure(result.message)
      }
      return
    }
    const done = new URLSearchParams({ registrado: "entrada", lote: input.code, qtd: String(input.quantity) })
    if (returnTo === "entry") {
      done.set("de", product.id)
      router.push(`/estoque/entrada?${done}`)
    } else {
      router.push(`/estoque/${product.id}?${done}`)
    }
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
        <Card className="lg:col-span-2 lg:self-start">
          <CardTitle>O lote que está chegando</CardTitle>
          <CardSubtitle>
            O número do lote e a validade vêm impressos na caixa, perto do código de barras.
          </CardSubtitle>
          <div className="mt-5">
            <LotFields
              lot={lot}
              index={0}
              heading={null}
              removable={false}
              takenCodes={takenCodes}
              errors={errors}
              readOnly={saving}
              soonThresholdDays={soonThresholdDays}
              onChange={(patch) => setLot((current) => ({ ...current, ...patch }))}
              onRemove={() => undefined}
            />
          </div>
          <EntryOriginFields
            value={origin}
            errors={originErrors}
            suppliers={suppliers}
            readOnly={saving}
            onChange={(patch) => setOrigin((current) => ({ ...current, ...patch }))}
          />
        </Card>

        <aside className="flex flex-col gap-4">
          <EntrySummary product={product} quantity={lot.quantity} />

          <div className="flex flex-col gap-2">
            {failure ? <FormFailure message={failure} /> : null}
            <Button type="submit" size="lg" aria-busy={saving}>
              <SubmitLabel saving={saving} icon={PackagePlus}>
                Registrar entrada
              </SubmitLabel>
            </Button>
            <LinkButton data-discard href={backHref} variant="ghost">
              Voltar sem registrar
            </LinkButton>
          </div>
        </aside>
      </form>
    </UnsavedGuard>
  )
}
