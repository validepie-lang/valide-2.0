"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toggleImportRow } from "@/lib/actions/imports"
import { UNREACHABLE } from "@/lib/actions/result"

/**
 * A caixa de marcar de uma linha da revisão (issue 075, item 25), como a da
 * tabela do Data Table UX/UI (Behance). Desmarcada, a linha não entra. Grava
 * na hora, no servidor, então vale também para o rascunho; se o servidor
 * recusar, a caixa volta e a frase dele aparece no lugar.
 */
export function RowToggle({
  jobId,
  rowNumber,
  excluded,
}: {
  jobId: string
  rowNumber: number
  excluded: boolean
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(!excluded)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function toggle(next: boolean) {
    setChecked(next)
    setPending(true)
    setFailure(null)
    const result = await toggleImportRow(jobId, rowNumber, !next).catch(() => UNREACHABLE)
    setPending(false)
    if (!result.ok) {
      setChecked(!next)
      setFailure(result.message)
      return
    }
    router.refresh()
  }

  return (
    <span className="inline-flex flex-col items-start">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        aria-busy={pending}
        aria-label={`Importar a linha ${rowNumber}`}
        onChange={(event) => void toggle(event.target.checked)}
        className="size-5 cursor-pointer accent-primary"
      />
      {failure ? (
        <span role="alert" className="mt-1 text-micro text-error-fg">
          {failure}
        </span>
      ) : null}
    </span>
  )
}
