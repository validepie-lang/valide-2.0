import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion } from "@/components/skeletons/pieces"

/**
 * A forma de Movimentações (issue 041): título, abas, os filtros à esquerda e
 * a lista em dias, cada um com a faixa cinza no topo.
 */
export default function MovimentacoesLoading() {
  return (
    <LoadingRegion label="Carregando as movimentações">
      <Skeleton className="h-7 w-36 md:h-9" />
      <Skeleton className="mt-2.5 h-4 w-96 max-w-full" />
      <div className="mt-5 mb-6 flex h-11 items-center gap-6 border-b border-line">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <Card className="flex flex-col gap-5 lg:col-span-3">
          {[0, 1].map((g) => (
            <div key={g}>
              <Skeleton className="h-3.5 w-16" />
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((c) => (
                  <Skeleton key={c} className="h-10 rounded-pill" />
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-line pt-5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-2 h-11 w-full" />
            <Skeleton className="mt-4 h-3.5 w-20" />
            <Skeleton className="mt-2 h-11 w-full" />
          </div>
        </Card>

        <Card className="min-w-0 overflow-hidden p-0 md:p-0 lg:col-span-9">
          <div className="p-4 md:px-6 md:pt-6 md:pb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2.5 h-3.5 w-72 max-w-full" />
          </div>
          {[4, 3].map((rows, d) => (
            <div key={d}>
              <div className="flex h-10 items-center border-y border-line bg-sunken px-4 md:px-6">
                <Skeleton className="h-3.5 w-24" />
              </div>
              {Array.from({ length: rows }).map((_, r) => (
                <div
                  key={r}
                  className="flex items-start gap-4 border-b border-line px-4 py-3.5 last:border-b-0 md:px-6"
                >
                  <Skeleton className="hidden h-3.5 w-10 lg:block" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-72 max-w-full" />
                    <Skeleton className="mt-1.5 h-3 w-28" />
                  </div>
                  <Skeleton className="hidden h-7 w-32 rounded-pill lg:block" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="hidden h-3.5 w-28 lg:block" />
                </div>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </LoadingRegion>
  )
}
