import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion, TableRowsSkeleton } from "@/components/skeletons/pieces"

/** A forma do estoque: título e ações, as abas, e um card com filtros, tabela e paginação */
export default function EstoqueLoading() {
  // Larguras variadas de propósito: chip de tamanho igual não parece conteúdo
  const chips = [64, 96, 100, 96, 118]

  return (
    <LoadingRegion label="Carregando o estoque">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-36 md:h-9" />
          <Skeleton className="mt-2.5 h-4 w-72 max-w-full" />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Skeleton className="h-11 flex-1 rounded-pill sm:w-44 sm:flex-none md:h-10" />
          <Skeleton className="h-11 w-11 rounded-pill sm:w-44 md:h-10" />
        </div>
      </div>

      {/* Abas Produtos e Movimentações (issue 041) */}
      <div className="mt-5 mb-6 flex h-11 items-center gap-6 border-b border-line">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Busca, filtros e tabela no mesmo card (issue 029) */}
      <Card className="p-0 md:p-0">
        <div className="border-b border-line px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-11 w-full rounded-pill sm:max-w-md" />
            <Skeleton className="h-11 w-36 rounded-pill md:h-10" />
          </div>
          <div className="mt-3 flex gap-2 overflow-hidden">
            {chips.map((w, i) => (
              <Skeleton key={i} className="h-10 shrink-0 rounded-pill" style={{ width: w }} />
            ))}
          </div>
        </div>
        <div className="p-4 md:p-6">
          <TableRowsSkeleton rows={8} />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-4 md:px-6">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="hidden h-9 w-56 sm:block" />
        </div>
      </Card>
    </LoadingRegion>
  )
}
