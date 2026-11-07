import { ListCardSkeleton, LoadingRegion, PageHeaderSkeleton } from "@/components/skeletons/pieces"
import { Skeleton } from "@/components/ui/skeleton"

/** A forma da retirada: título e um card com a barra de seleção e os lotes */
export default function RetirarVencidosLoading() {
  return (
    <LoadingRegion label="Carregando os lotes vencidos">
      <Skeleton className="mb-3 h-3.5 w-36" />
      <PageHeaderSkeleton actions={0} />
      <ListCardSkeleton rows={5} bar="bg-status-expired" action />
    </LoadingRegion>
  )
}
