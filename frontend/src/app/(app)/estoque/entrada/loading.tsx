import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion, PageHeaderSkeleton } from "@/components/skeletons/pieces"

/** A forma da entrada geral (issue 042): o cabeçalho e o cartão da busca */
export default function EntradaGeralLoading() {
  return (
    <LoadingRegion label="Carregando a entrada">
      <Skeleton className="mb-3 h-3.5 w-44" />
      <PageHeaderSkeleton actions={0} />
      <Card className="max-w-3xl">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-2.5 h-3.5 w-96 max-w-full" />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 flex-1 rounded-pill" />
          <Skeleton className="h-12 w-full rounded-pill sm:w-40" />
        </div>
      </Card>
    </LoadingRegion>
  )
}
