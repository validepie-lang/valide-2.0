import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion } from "@/components/skeletons/pieces"

/** A forma do calendário (issue 052): título, abas, o mês em grade e a lista do dia */
export default function CalendarioLoading() {
  return (
    <LoadingRegion label="Carregando o calendário">
      <Skeleton className="h-7 w-36 md:h-9" />
      <Skeleton className="mt-2.5 h-4 w-96 max-w-full" />
      <div className="mt-5 mb-6 flex h-11 items-center gap-6 border-b border-line">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
        <Card className="p-4 md:p-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-9 w-20 rounded-pill" />
          </div>
          <div className="mt-6 grid grid-cols-7 gap-1 md:gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-12 md:h-20" />
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2.5 h-3.5 w-36" />
          <Skeleton className="mt-6 h-12 w-full" />
        </Card>
      </div>
    </LoadingRegion>
  )
}
