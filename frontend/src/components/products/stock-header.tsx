import { FileSpreadsheet, PackagePlus } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { formatNumber } from "@/lib/utils/format"
import type { DashboardCounts } from "@/lib/types"

/**
 * Título do Estoque com o resumo e as duas ações (issue 029). Saiu da página
 * na 070, que passava de 200 linhas.
 */
export function StockHeader({ counts }: { counts: DashboardCounts }) {
  const stockTotal = counts.expired + counts.soon + counts.ok + counts.unknown
  const urgent = counts.expired + counts.soon
  return (
    <PageHeader
      title="Estoque"
      className="mb-0"
      description={
        <>
          <span className="tnum">{formatNumber(stockTotal)}</span> produtos.{" "}
          {urgent > 0 ? (
            <>
              <span className="font-semibold text-status-expired-fg tnum">
                {formatNumber(counts.expired)}
              </span>{" "}
              vencidos e{" "}
              <span className="font-semibold text-status-soon-fg tnum">{formatNumber(counts.soon)}</span> a
              vencer pedem atenção.
            </>
          ) : (
            "Nada vencido nem a vencer."
          )}
        </>
      }
      actions={
        // No celular as duas ficam numa linha: importar por extenso, adicionar só com o ícone
        <div className="flex gap-2">
          <LinkButton href="/estoque/importar" className="flex-1 sm:flex-none">
            <FileSpreadsheet className="size-4" aria-hidden />
            Importar produtos
          </LinkButton>
          <LinkButton
            href="/estoque/novo"
            variant="secondary"
            aria-label="Adicionar produto"
            className="px-3 sm:px-4"
          >
            <PackagePlus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Adicionar produto</span>
          </LinkButton>
        </div>
      }
    />
  )
}
