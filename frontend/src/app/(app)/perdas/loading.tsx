import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ListCardSkeleton, LoadingRegion } from "@/components/skeletons/pieces"

/** A forma de Perdas: título e período, o cartão cheio e dois indicadores, dois gráficos, a lista */
export default function PerdasLoading() {
  return (
    <LoadingRegion label="Carregando as perdas" className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40 md:h-9" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-64 rounded-pill" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-3 rounded-md bg-feature p-5 shadow-card md:p-7 lg:col-span-5">
          <Skeleton className="h-3.5 w-40 bg-feature-line" />
          <Skeleton className="h-12 w-52 bg-feature-line md:h-[3.75rem]" />
          <Skeleton className="h-3.5 w-64 max-w-full bg-feature-line" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:gap-6">
          {[0, 1].map((i) => (
            <Card key={i} as="div" className="p-5 md:p-6">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="mt-3 h-10 w-20" />
              <Skeleton className="mt-3 h-3.5 w-48 max-w-full" />
            </Card>
          ))}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <Card as="div" className="p-5 md:p-7 lg:col-span-8">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-6 h-56 w-full" />
        </Card>
        <Card as="div" className="p-5 md:p-7 lg:col-span-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-6 h-40 w-full" />
        </Card>
      </div>
      <ListCardSkeleton rows={5} />
    </LoadingRegion>
  )
}
