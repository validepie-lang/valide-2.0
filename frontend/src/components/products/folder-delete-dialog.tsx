"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { Field, Select } from "@/components/ui/field"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import { products, type FolderRow } from "@/components/products/folder-table"
import { NO_FOLDER_LABEL } from "@/lib/utils/no-folder"
import type { Folder } from "@/lib/types"

const NONE = "none"

/**
 * Excluir uma pasta. Vazia, pede confirmação. Com produto (issue 076, item
 * 110, do Ventor "Category"), pergunta na mesma janela para onde eles vão:
 * outra pasta ativa ou "Sem pasta". Se o servidor recusar, a mensagem dele
 * fica na janela.
 */
export function FolderDeleteDialog({
  folder,
  destinations,
  saving,
  failure,
  onClose,
  onConfirm,
}: {
  folder: FolderRow | null
  /** as pastas ativas, para escolher o destino; a própria é tirada aqui */
  destinations: Folder[]
  saving: boolean
  failure: string | null
  onClose: () => void
  /** `moveTo`: o destino dos produtos (null = sem pasta); só vale para a pasta com produto */
  onConfirm: (folder: FolderRow, moveTo: string | null) => void
}) {
  const [target, setTarget] = useState(NONE)
  // Outra pasta, a escolha recomeça em "Sem pasta"
  const [forId, setForId] = useState(folder?.id)
  if (folder?.id !== forId) {
    setForId(folder?.id)
    setTarget(NONE)
  }
  const empty = folder?.productCount === 0
  const others = destinations.filter((f) => f.id !== folder?.id)

  return (
    <Dialog
      open={Boolean(folder)}
      onClose={onClose}
      title={`Excluir a pasta ${folder?.name ?? ""}?`}
      description={
        folder && !empty
          ? `Ela tem ${products(folder.productCount)}. Escolha para onde eles vão: nenhum produto é apagado.`
          : "Ela está vazia. Nenhum produto muda."
      }
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (folder) onConfirm(folder, target === NONE ? null : target)
        }}
      >
        {folder && !empty ? (
          <Field label="Os produtos vão para" htmlFor="destino-pasta" className="mt-5">
            <Select
              id="destino-pasta"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={saving}
              data-autofocus
            >
              <option value={NONE}>{NO_FOLDER_LABEL}</option>
              {others.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        {failure ? <FormFailure message={failure} after="" className="mt-5" /> : null}
        <DialogActions>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {/* Destrutivo em neutro, com o texto nomeando a ação (button.tsx) */}
          <Button type="submit" aria-busy={saving}>
            <SubmitLabel saving={saving} icon={Trash2} savingLabel="Excluindo…">
              {empty ? "Excluir pasta" : "Mover e excluir"}
            </SubmitLabel>
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
