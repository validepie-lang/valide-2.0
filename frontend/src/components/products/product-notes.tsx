"use client"

import { useState } from "react"
import { Save, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, Textarea } from "@/components/ui/field"
import { FormFailure, SavedNote, SubmitLabel } from "@/components/ui/form-status"
import { addNote } from "@/lib/actions/product-extras"
import { UNREACHABLE } from "@/lib/actions/result"
import { formatEventTime } from "@/lib/utils/format"
import { MAX_NOTE, noteError } from "@/lib/utils/product-extras"
import type { ProductNote } from "@/lib/types"

/**
 * Aba "Notas" do produto (issue 070, item 12), como a "Notes" do Inventar
 * (Behance): o que a equipe precisa saber deste produto, com quem e quando.
 * Qualquer cargo escreve; nota não se edita nem se apaga, como a movimentação.
 *
 * Confere ao salvar e depois ao digitar (Primer, Forms); a nota salva entra
 * no topo da lista, que é a confirmação, e a frase "Nota salva." é anunciada.
 */
export function ProductNotes({ productId, initial }: { productId: string; initial: ProductNote[] }) {
  const [notes, setNotes] = useState(initial)
  const [text, setText] = useState("")
  const [attempted, setAttempted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  async function save() {
    setAttempted(true)
    const invalid = noteError(text)
    setError(invalid)
    if (invalid) return document.getElementById("nova-nota")?.focus()
    setSaving(true)
    setFailure(null)
    const result = await addNote(productId, text).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) {
      if (result.code === "NOTE_INVALID") return setError(result.message)
      return setFailure(result.message)
    }
    setNotes((current) => [result.data, ...current])
    setText("")
    setAttempted(false)
    setSaved("Nota salva.")
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
        className="flex flex-col gap-3"
      >
        <Field
          label="Nova nota"
          htmlFor="nova-nota"
          hint={`Até ${MAX_NOTE} letras.`}
          error={error ?? undefined}
        >
          <Textarea
            id="nova-nota"
            value={text}
            rows={3}
            readOnly={saving}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "nova-nota-mensagem" : undefined}
            placeholder="Ex.: Caixa amassada no último pedido. Conferir a embalagem antes de vender."
            onChange={(event) => {
              setText(event.target.value)
              setSaved(null)
              if (attempted) setError(noteError(event.target.value))
            }}
          />
        </Field>
        {failure ? <FormFailure message={failure} /> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" aria-busy={saving}>
            <SubmitLabel saving={saving} icon={Save}>
              Salvar nota
            </SubmitLabel>
          </Button>
          <SavedNote message={saved} />
        </div>
      </form>

      {notes.length > 0 ? (
        <ul aria-label="Notas do produto" className="divide-y divide-line border-t border-line">
          {notes.map((note) => (
            <li key={note.id} className="py-4">
              <p className="text-label text-fg-muted">
                <span className="font-semibold text-fg">{note.userName}</span> ·{" "}
                {formatEventTime(note.createdAt)}
              </p>
              <p className="mt-1 text-body whitespace-pre-line text-fg">{note.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-start gap-2 border-t border-line pt-4 text-body text-fg-muted">
          <StickyNote className="mt-0.5 size-4 shrink-0" aria-hidden />
          Nenhuma nota ainda. Use para o que a equipe precisa saber deste produto: devolução, embalagem,
          cliente que encomenda.
        </p>
      )}
    </div>
  )
}
