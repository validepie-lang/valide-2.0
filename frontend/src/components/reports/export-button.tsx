"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Baixa um texto pronto como arquivo (issue 051), como o "Export" no
 * cabeçalho do SaaS Data Table (Behance, issue 029). O conteúdo vem montado do
 * servidor; aqui só vira arquivo.
 */
export function ExportButton({ content, filename }: { content: string; filename: string }) {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }))
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
      }}
    >
      <Download className="size-4" aria-hidden />
      Exportar planilha
    </Button>
  )
}
