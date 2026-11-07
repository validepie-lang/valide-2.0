"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import type { FolderRow } from "@/components/products/folder-table"
import { formatNumber } from "@/lib/utils/format"
import { joinNames, splitForDelete } from "@/lib/utils/folder-list"

const pastas = (n: number) => `${formatNumber(n)} ${n === 1 ? "pasta" : "pastas"}`

/**
 * Excluir as pastas marcadas (issue 076, item 66, do Ventor "Category" e do
 * Data Table UX/UI). Só as vazias saem: as que têm produto ficam, e a janela
 * diz quais, porque cada uma pode precisar de um destino diferente (item 110,
 * uma por vez).
 */
export function FolderBulkDeleteDialog({
  marked,
  open,
  saving,
  failure,
  onClose,
  onConfirm,
}: {
  marked: FolderRow[]
  open: boolean
  saving: boolean
  failure: string | null
  onClose: () => void
  onConfirm: (empty: FolderRow[]) => void
}) {
  const { empty, withProducts } = splitForDelete(marked)
  const kept = withProducts.map((f) => f.name)
  const keptNote =
    kept.length === 0
      ? null
      : `${joinNames(kept)} ${kept.length === 1 ? "tem produtos e fica" : "têm produtos e ficam"}. Para excluir, use Excluir na linha e escolha para onde os produtos vão.`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={empty.length > 0 ? `Excluir ${pastas(empty.length)}?` : "Nenhuma pasta marcada está vazia"}
      description={
        empty.length > 0
          ? `${joinNames(empty.map((f) => f.name))}. ${empty.length === 1 ? "Ela está vazia" : "Estão vazias"}: nenhum produto muda.`
          : undefined
      }
    >
      {keptNote ? <p className="mt-4 text-body text-fg">{keptNote}</p> : null}
      {failure ? <FormFailure message={failure} after="" className="mt-5" /> : null}
      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          {empty.length > 0 ? "Cancelar" : "Fechar"}
        </Button>
        {empty.length > 0 ? (
          <Button onClick={() => onConfirm(empty)} aria-busy={saving}>
            <SubmitLabel saving={saving} icon={Trash2} savingLabel="Excluindo…">
              {empty.length === 1 ? "Excluir a pasta" : `Excluir as ${formatNumber(empty.length)}`}
            </SubmitLabel>
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
