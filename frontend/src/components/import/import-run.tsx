"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DiscardImport } from "@/components/import/discard-import"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import { checkImport, runImport } from "@/lib/actions/imports"
import { UNREACHABLE } from "@/lib/actions/result"
import { formatNumber } from "@/lib/utils/format"

/** Quanto esperar entre uma consulta e outra enquanto a importação roda */
const POLL_MS = 3000

/**
 * "Importar N produtos" (issue 056): é aqui que o servidor começa a gravar
 * (`POST /imports/:id/confirm`). Até este botão, nada entrou no estoque.
 */
export function ConfirmImportButton({ jobId, rows }: { jobId: string; rows: number }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function confirm() {
    if (saving) return
    setSaving(true)
    setFailure(null)
    const result = await runImport(jobId).catch(() => UNREACHABLE)
    if (!result.ok) {
      setSaving(false)
      setFailure(result.message)
      return
    }
    router.push(`/estoque/importar?passo=resultado&importacao=${encodeURIComponent(jobId)}`)
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      {failure ? <FormFailure message={failure} /> : null}
      <Button size="lg" onClick={confirm} aria-busy={saving}>
        <SubmitLabel saving={saving} icon={ArrowRight} iconAfter>
          {/* Um só filho: o botão põe espaço entre filhos e o número ficava solto */}
          <span>
            Importar <span className="tnum">{formatNumber(rows)}</span> produtos
          </span>
        </SubmitLabel>
      </Button>
    </div>
  )
}

/**
 * Importação em andamento: o contrato prevê consultar `GET /imports/:id` até
 * sair de `running`. Quando sai, a página é lida de novo e mostra o
 * resultado. Quem sair daqui não perde nada: o aviso de importação concluída
 * chega pelo sino. Desde a issue 075 (item 108), dá para cancelar: o servidor
 * desfaz o que já gravou.
 */
export function ImportRunning({ jobId, fileName }: { jobId: string; fileName: string | null }) {
  const router = useRouter()
  const [lost, setLost] = useState(false)

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      const result = await checkImport(jobId).catch(() => UNREACHABLE)
      if (stopped) return
      setLost(!result.ok)
      if (result.ok && result.data.status !== "running" && result.data.status !== "pending") {
        router.refresh()
        return
      }
      timer = setTimeout(tick, POLL_MS)
    }
    timer = setTimeout(tick, POLL_MS)
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [jobId, router])

  return (
    <section className="flex items-start gap-3 rounded-md border border-line bg-surface p-5 shadow-card md:p-7">
      <Loader2
        className="mt-0.5 size-5 shrink-0 animate-spin text-fg-muted motion-reduce:animate-none"
        aria-hidden
      />
      <div className="min-w-0" role="status">
        <h2 className="font-display text-section font-bold text-fg">Importando {fileName ?? "o catálogo"}</h2>
        <p className="mt-1 text-body text-fg-muted">
          {lost
            ? "Perdemos a conexão por um instante. A importação continua no servidor e esta tela tenta de novo sozinha."
            : "Catálogos grandes levam alguns minutos. Pode sair desta tela: o aviso chega pelo sino quando terminar."}
        </p>
        <div className="mt-3 -ml-3">
          <DiscardImport jobId={jobId} running />
        </div>
      </div>
    </section>
  )
}
