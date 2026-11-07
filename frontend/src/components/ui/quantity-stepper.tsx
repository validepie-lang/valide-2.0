"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/**
 * Quantidade com − e + (issue 047, item 21), como o "Adjust Stock" do Inventar
 * (Behance): no balcão, chegar a 3 ou 4 é mais rápido no toque do que no
 * teclado do celular.
 *
 * Os botões ficam fora do Tab (`tabIndex={-1}`): no teclado, as setas para
 * cima e para baixo do próprio campo fazem o mesmo, e quem preenche a fila não
 * ganha duas paradas a mais por campo.
 */
export function QuantityStepper({
  id,
  value,
  onChange,
  min = 0,
  max,
  invalid,
  describedBy,
  readOnly,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  invalid?: boolean
  /** id da mensagem do campo (`Field` dá `<id>-mensagem`) */
  describedBy?: string
  readOnly?: boolean
}) {
  const current = Number(value) || 0
  const step = (delta: number) => {
    let next = current + delta
    if (next < min) next = min
    if (max !== undefined && next > max) next = max
    onChange(String(next))
  }
  const button =
    "grid w-11 shrink-0 place-items-center text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg disabled:pointer-events-none disabled:opacity-40"

  return (
    <div
      className={cn(
        "flex h-11 overflow-hidden rounded-md border bg-surface transition-colors focus-within:outline-2 focus-within:outline-focus",
        invalid ? "border-error" : "border-line hover:border-line-strong",
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={() => step(-1)}
        disabled={readOnly || current <= min}
        aria-label="Diminuir 1"
        className={cn(button, "border-r border-line")}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        readOnly={readOnly}
        className="w-full min-w-0 bg-transparent px-2 text-center text-body text-fg tnum outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => step(1)}
        disabled={readOnly || (max !== undefined && current >= max)}
        aria-label="Aumentar 1"
        className={cn(button, "border-l border-line")}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
