import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion, PageHeaderSkeleton } from "@/components/skeletons/pieces"

/** A forma do passo Origem: etapas à esquerda (issue 032) e, num card, título, área de arrastar e apoio */
export default function ImportarLoading() {
  return (
    <LoadingRegion label="Carregando a importação">
      <Skeleton className="mb-3 h-3.5 w-36" />
      <PageHeaderSkeleton actions={0} />

      {/* Etapas à esquerda a partir de lg; texto e barra antes (issue 032) */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="lg:hidden">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="mt-2.5 h-1.5 w-full rounded-pill" />
          </div>
          <div className="hidden flex-col gap-6 lg:flex">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 shrink-0 rounded-pill" />
                <div className="pt-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-1.5 h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">
          <div className="max-w-2xl rounded-md border border-line bg-surface p-5 shadow-card md:p-7">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full" />
            <div className="mt-5 flex flex-col items-center rounded-md border-2 border-dashed border-line-strong bg-page px-6 py-12">
              <Skeleton className="size-7" />
              <Skeleton className="mt-3 h-4 w-72 max-w-full" />
              <Skeleton className="mt-2 h-3.5 w-32" />
              <Skeleton className="mt-5 h-11 w-44 rounded-pill md:h-10" />
            </div>
            <Skeleton className="mt-8 h-4 w-72 max-w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-4/5" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  )
}
