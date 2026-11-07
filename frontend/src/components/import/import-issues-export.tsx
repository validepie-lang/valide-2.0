"use client"

import { useState } from "react"
import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportImportIssues } from "@/lib/actions/imports"
import { UNREACHABLE } from "@/lib/actions/result"
import { downloadCsv } from "@/lib/utils/download"

/**
 * "Baixar as linhas com problema" (issue 075, item 107): a planilha com cada
 * linha que tem erro ou aviso e o motivo, para corrigir no sistema da farmácia
 * e importar de novo. Volta onde a issue 056 tinha tirado um link para "#".
 */
export function ImportIssuesExport({ jobId }: { jobId: string }) {
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function download() {
    setBusy(true)
    setFailure(null)
    const result = await exportImportIssues(jobId).catch(() => UNREACHABLE)
    setBusy(false)
    if (!result.ok) return setFailure(result.message)
    downloadCsv(result.data.csv, result.data.filename)
  }

  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      <Button variant="secondary" onClick={() => void download()} aria-busy={busy} disabled={busy}>
        <FileSpreadsheet className="size-4" aria-hidden />
        {busy ? "Montando a planilha…" : "Baixar as linhas com problema"}
      </Button>
      <span role="status" className="text-label text-error-fg empty:hidden">
        {failure}
      </span>
    </span>
  )
}
