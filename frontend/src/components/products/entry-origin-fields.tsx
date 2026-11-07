"use client"

import { useId } from "react"
import { Field, Input } from "@/components/ui/field"
import type { EntryOriginDraft, EntryOriginErrors } from "@/lib/utils/lot-draft"

/** Na ordem da tela: o primeiro errado recebe o foco */
export const ORIGIN_IDS: Record<keyof EntryOriginDraft, string> = {
  supplier: "fornecedor-entrada",
  invoice: "nota-entrada",
}

/**
 * De quem veio o lote e em qual nota (issue 072, item 22), como o
 * recebimento do Inventar (Behance). Os dois são opcionais e vão para a
 * observação da ENTRADA no histórico. O fornecedor sugere os que já existem
 * na conta e começa com o do cadastro do produto.
 */
export function EntryOriginFields({
  value,
  errors,
  suppliers,
  readOnly,
  onChange,
}: {
  value: EntryOriginDraft
  errors: EntryOriginErrors
  suppliers: string[]
  readOnly: boolean
  onChange: (patch: Partial<EntryOriginDraft>) => void
}) {
  const listId = useId()
  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="text-label font-semibold text-fg">De onde veio</h3>
      <p className="mt-0.5 text-label text-fg-muted">
        Opcional. Ajuda a conferir com a nota quando algo vier errado.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Fornecedor" htmlFor={ORIGIN_IDS.supplier} error={errors.supplier}>
          <Input
            id={ORIGIN_IDS.supplier}
            list={listId}
            value={value.supplier}
            onChange={(e) => onChange({ supplier: e.target.value })}
            invalid={Boolean(errors.supplier)}
            aria-describedby={errors.supplier ? `${ORIGIN_IDS.supplier}-mensagem` : undefined}
            readOnly={readOnly}
            autoComplete="off"
          />
          <datalist id={listId}>
            {suppliers.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>
        <Field label="Nota fiscal" htmlFor={ORIGIN_IDS.invoice} error={errors.invoice}>
          <Input
            id={ORIGIN_IDS.invoice}
            value={value.invoice}
            onChange={(e) => onChange({ invoice: e.target.value })}
            invalid={Boolean(errors.invoice)}
            aria-describedby={errors.invoice ? `${ORIGIN_IDS.invoice}-mensagem` : undefined}
            readOnly={readOnly}
            inputMode="numeric"
            placeholder="Ex.: 000.418.233"
            autoComplete="off"
            className="tnum"
          />
        </Field>
      </div>
    </div>
  )
}
