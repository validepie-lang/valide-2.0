"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import { stopImport } from "@/lib/actions/imports"
import { UNREACHABLE } from "@/lib/actions/result"

/**
 * Descartar a importação antes de confirmar, ou cancelar enquanto importa
 * (issue 075, item 108). Pede confirmação porque não tem volta, e diz o que
 * acontece com o que já foi feito (Primer, Saving).
 */
export function DiscardImport({ jobId, running = false }: { jobId: string; running?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function confirm() {
    setSaving(true)
    setFailure(null)
    const result = await stopImport(jobId).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) return setFailure(result.message)
    setOpen(false)
    if (running) router.refresh()
    else router.push("/estoque/importar?descartada=1")
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        {running ? <X className="size-4" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
        {running ? "Cancelar importação" : "Descartar importação"}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={running ? "Cancelar a importação?" : "Descartar esta importação?"}
        description={
          running
            ? "O Valide para e desfaz o que já gravou: nenhum produto desta importação entra no estoque."
            : "O arquivo enviado e o que você escolheu até aqui somem. Nada foi gravado no estoque."
        }
      >
        {failure ? <FormFailure message={failure} after="" className="mt-4" /> : null}
        <DialogActions>
          <Button variant="secondary" onClick={() => setOpen(false)} data-autofocus>
            Continuar a importação
          </Button>
          <Button onClick={() => void confirm()} aria-busy={saving}>
            <SubmitLabel
              saving={saving}
              savingLabel={running ? "Cancelando…" : "Descartando…"}
              icon={running ? X : Trash2}
            >
              {running ? "Cancelar importação" : "Descartar"}
            </SubmitLabel>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
