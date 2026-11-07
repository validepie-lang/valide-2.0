"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportMovements } from "@/lib/actions/movements"
import { UNREACHABLE } from "@/lib/actions/result"
import type { MovementSearchParams } from "@/components/movements/movement-params"
import { downloadCsv } from "@/lib/utils/download"

/**
 * "Exportar planilha" (issue 073, item 77), o "Export" do cabeçalho do SaaS
 * Data Table (Behance), como em Perdas (issue 051). A diferença: aqui a
 * planilha traz todas as páginas do filtro, então é montada no servidor só
 * quando alguém pede, e não a cada vez que a tela abre.
 */
export function MovementExport({ params }: { params: MovementSearchParams }) {
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function download() {
    setBusy(true)
    setFailure(null)
    const result = await exportMovements(params).catch(() => UNREACHABLE)
    setBusy(false)
    if (!result.ok) return setFailure(result.message)
    downloadCsv(result.data.csv, result.data.filename)
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <Button variant="secondary" onClick={() => void download()} aria-busy={busy} disabled={busy}>
        <Download className="size-4" aria-hidden />
        {busy ? "Montando a planilha…" : "Exportar planilha"}
      </Button>
      <p role="status" className="text-label text-error-fg empty:hidden">
        {failure}
      </p>
    </div>
  )
}
