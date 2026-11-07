"use client"

import { FolderPlus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { Field, Input } from "@/components/ui/field"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import type { FolderRow } from "@/components/products/folder-table"
import { MAX_FOLDER_NAME } from "@/lib/utils/folder-name"
import { formatNumber } from "@/lib/utils/format"

/**
 * Criar ou renomear pasta (issue 039, "Add Company" do Ventor, Behance).
 * Separada de `folder-manager` na issue 057, quando passou a gravar: o erro do
 * nome fica no campo, qualquer outra recusa do servidor acima dos botões.
 */
export function FolderNameDialog({
  open,
  renaming,
  name,
  error,
  saving,
  failure,
  onName,
  onSubmit,
  onClose,
}: {
  open: boolean
  /** a pasta em renomeação; sem ela, é uma pasta nova */
  renaming: FolderRow | null
  name: string
  error: string | null
  saving: boolean
  failure: string | null
  onName: (name: string) => void
  onSubmit: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={renaming ? "Renomear pasta" : "Criar pasta"}
      description={
        renaming
          ? `Os ${formatNumber(renaming.productCount)} produtos continuam nela.`
          : "Use o nome que a equipe já fala no dia a dia."
      }
    >
      <form
        noValidate
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <Field label="Nome da pasta" htmlFor="nome-pasta" error={error ?? undefined}>
          <Input
            id="nome-pasta"
            value={name}
            onChange={(e) => onName(e.target.value)}
            invalid={Boolean(error)}
            aria-describedby={error ? "nome-pasta-mensagem" : undefined}
            readOnly={saving}
            placeholder="Ex.: Dermocosméticos"
            maxLength={MAX_FOLDER_NAME}
            autoComplete="off"
            data-autofocus
          />
        </Field>
        {failure ? <FormFailure message={failure} className="mt-4" /> : null}
        <DialogActions>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" aria-busy={saving}>
            <SubmitLabel saving={saving} icon={renaming ? Save : FolderPlus}>
              {renaming ? "Salvar nome" : "Criar pasta"}
            </SubmitLabel>
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
