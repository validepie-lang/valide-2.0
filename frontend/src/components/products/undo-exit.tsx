"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { undoExit } from "@/lib/actions/movements"
import { UNREACHABLE } from "@/lib/actions/result"

/**
 * "Desfazer" na faixa da saída registrada (issue 072, item 102), como o do
 * Gmail: logo ao lado da confirmação, sem janela de "tem certeza". Desfeito,
 * a tela volta sem a faixa e com "Saída desfeita." no lugar. Se o servidor
 * recusar (passou o tempo, ou já foi desfeita), a frase dele aparece aqui.
 */
export function UndoExit({ movementId, doneHref }: { movementId: string; doneHref: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [failure, setFailure] = useState<string | null>(null)

  return (
    <>
      {" "}
      <button
        type="button"
        aria-busy={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await undoExit(movementId).catch(() => UNREACHABLE)
            if (!result.ok) return setFailure(result.message)
            router.replace(doneHref, { scroll: false })
            router.refresh()
          })
        }
        className="inline-flex items-center gap-1 font-semibold text-fg underline-offset-4 hover:underline"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        {pending ? "Desfazendo…" : "Desfazer"}
      </button>
      {failure ? <span className="mt-1 block text-label text-error-fg">{failure}</span> : null}
    </>
  )
}
