import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FieldSkeleton, LoadingRegion, PageHeaderSkeleton } from "@/components/skeletons/pieces"

/** A forma da entrada: os campos do lote à esquerda, o resultado e as ações à direita */
export default function EntradaLoading() {
  return (
    <LoadingRegion label="Carregando a entrada">
      <Skeleton className="mb-3 h-3.5 w-36" />
      <PageHeaderSkeleton actions={0} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="mt-2 h-3.5 w-96 max-w-full" />
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <FieldSkeleton key={i} />
            ))}
          </div>
          <Skeleton className="mt-4 h-10 w-full" />
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <Skeleton className="h-5 w-44" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="mt-4 flex justify-between gap-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </Card>
          <Skeleton className="h-12 w-full rounded-pill" />
        </div>
      </div>
    </LoadingRegion>
  )
}
