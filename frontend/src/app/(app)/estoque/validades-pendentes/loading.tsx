import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FieldSkeleton, ListCardSkeleton, LoadingRegion } from "@/components/skeletons/pieces"

/**
 * A forma da fila na direção A (issue 025): título, o
 * produto em foco com o progresso no topo do cartão com a faixa de Sem validade (todo item da fila é Sem
 * validade, então a cor é conhecida antes do dado) e "A seguir" em card.
 */
export default function FilaLoading() {
  return (
    <LoadingRegion label="Carregando a fila de validades">
      <Skeleton className="mb-3 h-3.5 w-36" />
      <Skeleton className="h-7 w-64 max-w-full md:h-9" />
      <Skeleton className="mt-2.5 h-4 w-72 max-w-full" />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <Card className="border-t-[5px] border-t-status-unknown lg:col-span-2">
          {/* Progresso dentro do cartão (issue 031) */}
          <div className="flex justify-between gap-4">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <Skeleton className="mt-2.5 h-2 w-full rounded-pill" />
          <div className="mt-5 border-b border-line pb-5">
            <Skeleton className="h-5 w-72 max-w-full md:h-7" />
            <Skeleton className="mt-2 h-3.5 w-56 max-w-full" />
            <Skeleton className="mt-1.5 h-3.5 w-48 max-w-full" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <Skeleton className="mt-5 h-10 w-full" />
          <div className="mt-5 flex flex-wrap gap-2">
            <Skeleton className="h-12 w-full rounded-pill sm:w-60" />
            <Skeleton className="h-12 w-full rounded-pill sm:w-36" />
          </div>
        </Card>

        <ListCardSkeleton rows={5} footer className="self-start" />
      </div>
    </LoadingRegion>
  )
}
