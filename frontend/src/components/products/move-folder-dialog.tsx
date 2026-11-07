"use client"

import { useState } from "react"
import { FolderInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { Field, Select } from "@/components/ui/field"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import { moveToFolder } from "@/lib/actions/products"
import { UNREACHABLE } from "@/lib/actions/result"
import type { MoveResult, StockFilter } from "@/lib/services/product-folders"
import { NO_FOLDER_LABEL } from "@/lib/utils/no-folder"
import type { Folder } from "@/lib/types"

/** No select, "Sem pasta" não pode ser o vazio: o vazio é "ainda não escolheu" */
const NO_FOLDER_OPTION = "__sem-pasta"

/**
 * Mover os marcados de pasta (issue 069, item 68), na janela do "Add Company"
 * do Ventor (Behance), como as janelas de Pastas. Escolher a pasta é
 * obrigatório; a recusa do servidor fica aqui, com a escolha mantida (Primer).
 */
export function MoveFolderDialog({
  open,
  count,
  target,
  folders,
  onClose,
  onMoved,
}: {
  open: boolean
  /** quantos vão: para o título e o botão */
  count: number
  target: { ids: string[] } | { filter: StockFilter }
  folders: Folder[]
  onClose: () => void
  onMoved: (result: MoveResult) => void
}) {
  const [choice, setChoice] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const what = `${count.toLocaleString("pt-BR")} ${count === 1 ? "produto" : "produtos"}`

  async function submit() {
    if (!choice) {
      setError("Escolha a pasta de destino.")
      document.getElementById("pasta-destino")?.focus()
      return
    }
    setSaving(true)
    setFailure(null)
    const result = await moveToFolder(target, choice === NO_FOLDER_OPTION ? null : choice).catch(
      () => UNREACHABLE,
    )
    setSaving(false)
    if (!result.ok) return setFailure(result.message)
    setChoice("")
    onMoved(result.data)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Mover ${what}`}
      description="Cada produto fica numa pasta só. Os que já estão nela continuam."
    >
      <form
        noValidate
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Field label="Pasta de destino" htmlFor="pasta-destino" error={error ?? undefined}>
          <Select
            id="pasta-destino"
            value={choice}
            onChange={(event) => {
              setChoice(event.target.value)
              setError(null)
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "pasta-destino-mensagem" : undefined}
            disabled={saving}
            data-autofocus
          >
            <option value="">Escolha a pasta</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
            <option value={NO_FOLDER_OPTION}>{NO_FOLDER_LABEL}</option>
          </Select>
        </Field>
        {failure ? <FormFailure message={failure} after="A escolha continua aqui." className="mt-4" /> : null}
        <DialogActions>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" aria-busy={saving}>
            <SubmitLabel saving={saving} savingLabel="Movendo…" icon={FolderInput}>
              Mover {what}
            </SubmitLabel>
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
