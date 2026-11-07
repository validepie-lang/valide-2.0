"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SavedNote } from "@/components/ui/form-status"
import { clearDemo } from "@/lib/actions/demo"

/**
 * Apaga o registro da demonstração (issue 071). Sem confirmação em janela: o
 * que se perde são ações de teste, e a frase embaixo do botão já diz o efeito.
 */
export function DemoReset({ count }: { count: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        variant="secondary"
        aria-busy={pending}
        disabled={count === 0 && !pending}
        onClick={() =>
          startTransition(async () => {
            await clearDemo()
            setDone("Pronto. A demonstração voltou ao exemplo original.")
            router.refresh()
          })
        }
      >
        <RotateCcw className="size-4" aria-hidden />
        {pending ? "Apagando…" : "Apagar o que a demonstração guardou"}
      </Button>
      <SavedNote message={done} />
    </div>
  )
}
