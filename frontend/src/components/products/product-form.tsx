"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { UnsavedGuard } from "@/components/ui/unsaved-guard"
import { Button, LinkButton } from "@/components/ui/button"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import { ExistingLotsSection, NewLotsSection } from "@/components/products/product-lots-section"
import { emptyLot, type LotDraft } from "@/components/products/lot-fields"
import { ProductFields } from "@/components/products/product-fields"
import {
  PRODUCT_FIELD_IDS,
  checkLots,
  firstErrorId,
  initialProductDraft,
  readProductDraft,
} from "@/components/products/product-form-state"
import { addProduct, editProduct } from "@/lib/actions/products"
import { UNREACHABLE } from "@/lib/actions/result"
import { sellsBelowCost, validateProduct, type ProductDraftErrors } from "@/lib/utils/product-draft"
import type { Folder, Product } from "@/lib/types"

/**
 * Cadastro e edição de produto, no mesmo formulário (issue 026).
 *
 * Com `product`, os campos vêm preenchidos e o card de lotes vira leitura:
 * lote e quantidade mudam por movimentação. Página inteira com as seções à
 * esquerda, como o formulário de produto do Inventar (Behance, 524 curtidas);
 * cancelar sempre visível e salvar nunca desabilitado (Primer, Edit e Saving).
 *
 * Desde a issue 055 grava: `POST /products` com os lotes preenchidos, ou
 * `PATCH /products/:id`. Valida ao enviar e, depois, enquanto se corrige
 * (Primer, Forms). Cadastrou, volta ao estoque com a confirmação; editou,
 * volta ao produto.
 */
export function ProductForm({
  folders,
  soonThresholdDays,
  product,
  initialBarcode,
}: {
  folders: Folder[]
  soonThresholdDays: number
  /** o produto em edição; sem ele, é um cadastro */
  product?: Product
  /** o código que veio da entrada geral, quando o produto não existia (issue 049) */
  initialBarcode?: string
}) {
  const router = useRouter()
  const [initial] = useState(() => initialProductDraft(product, initialBarcode))
  const [draft, setDraft] = useState(initial)
  const [lots, setLots] = useState<LotDraft[]>([{ ...emptyLot(), key: 1 }])
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  // Recusa do servidor num campo (código de barras ou, desde a 072, código interno):
  // vale enquanto o valor digitado for o mesmo
  const [rejected, setRejected] = useState<{
    field: "barcode" | "sku"
    value: string
    message: string
  } | null>(null)

  const errors: ProductDraftErrors = {
    ...(attempted ? validateProduct(draft).errors : {}),
    ...(rejected && rejected.value === draft[rejected.field].trim()
      ? { [rejected.field]: rejected.message }
      : {}),
  }
  const lotErrors = attempted && !product ? checkLots(lots).errors : {}
  const sections = [
    { id: "dados", label: "Dados do produto" },
    { id: "estoque", label: "Parâmetros de estoque" },
    { id: "valores", label: "Valores" },
    { id: "lotes", label: product ? "Lotes" : "Lote e validade" },
  ]

  async function save(form: HTMLFormElement) {
    if (saving) return
    const current = readProductDraft(form)
    const { errors: invalid, input } = validateProduct(current)
    const lotCheck = product ? null : checkLots(lots)
    setDraft(current)
    setAttempted(true)
    setFailure(null)
    if (!input || (lotCheck && !lotCheck.ok)) {
      const id = firstErrorId(invalid, lotCheck)
      if (id) document.getElementById(id)?.focus()
      return
    }

    setSaving(true)
    const result = await (
      product ? editProduct(product.id, input) : addProduct({ ...input, lots: lotCheck?.inputs ?? [] })
    ).catch(() => UNREACHABLE)
    if (!result.ok) {
      setSaving(false)
      const field = result.code === "BARCODE_TAKEN" ? "barcode" : result.code === "SKU_TAKEN" ? "sku" : null
      const value = field ? input[field] : null
      if (field && value) {
        setRejected({ field, value, message: result.message })
        document.getElementById(PRODUCT_FIELD_IDS[field])?.focus()
      } else {
        setFailure(result.message)
      }
      return
    }
    // Cadastrou: abre o produto novo (issue 071, item 103). Se veio da entrada geral com o
    // código bipado, volta para ela, pronta para o próximo da caixa (issue 072, item 104)
    const created = encodeURIComponent(result.data.id)
    router.push(
      product
        ? `/estoque/${product.id}?salvo=produto`
        : initialBarcode
          ? `/estoque/entrada?registrado=cadastro&de=${created}`
          : `/estoque/${created}?salvo=novo`,
    )
  }

  return (
    <UnsavedGuard className="grid gap-4 lg:grid-cols-4">
      {/* Âncoras laterais: o formulário é longo e o usuário é interrompido */}
      <nav aria-label="Seções do formulário" className="hidden lg:block">
        <ul className="sticky top-24 space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-md px-3 py-2 text-label font-medium text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <form
        noValidate
        onChange={(event) => setDraft(readProductDraft(event.currentTarget))}
        onSubmit={(event) => {
          event.preventDefault()
          void save(event.currentTarget)
        }}
        className="flex flex-col gap-4 lg:col-span-3"
      >
        <ProductFields
          initial={initial}
          folders={folders}
          errors={errors}
          belowCost={sellsBelowCost(draft)}
          readOnly={saving}
        />

        {product ? (
          <ExistingLotsSection product={product} />
        ) : (
          <NewLotsSection
            soonThresholdDays={soonThresholdDays}
            lots={lots}
            onChange={setLots}
            errors={lotErrors}
            readOnly={saving}
          />
        )}

        {failure ? <FormFailure message={failure} /> : null}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LinkButton data-discard href={product ? `/estoque/${product.id}` : "/estoque"} variant="ghost">
            {product ? "Cancelar" : "Voltar sem salvar"}
          </LinkButton>
          <Button type="submit" size="lg" aria-busy={saving}>
            <SubmitLabel saving={saving} icon={Save}>
              {product ? "Salvar alterações" : "Salvar produto"}
            </SubmitLabel>
          </Button>
        </div>
      </form>
    </UnsavedGuard>
  )
}
