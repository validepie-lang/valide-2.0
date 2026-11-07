import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion, PageHeaderSkeleton } from "@/components/skeletons/pieces"

/** A forma da Ajuda (issue 043): a busca, os quatro assuntos e a primeira lista de perguntas */
export default function AjudaLoading() {
  return (
    <LoadingRegion label="Carregando a ajuda" className="flex flex-col gap-6">
      <PageHeaderSkeleton actions={0} />
      <Skeleton className="h-12 w-full max-w-2xl rounded-pill" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-4 md:p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-3.5 w-full" />
            <Skeleton className="mt-4 h-3.5 w-20" />
          </Card>
        ))}
      </div>
      <Skeleton className="h-6 w-28" />
      <Card className="p-0 md:p-0">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex h-14 items-center justify-between border-b border-line px-4 last:border-b-0 md:px-6"
          >
            <Skeleton className="h-4 w-80 max-w-[75%]" />
            <Skeleton className="size-4" />
          </div>
        ))}
      </Card>
    </LoadingRegion>
  )
}
