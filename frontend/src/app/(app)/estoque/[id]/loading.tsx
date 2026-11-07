import { Skeleton } from "@/components/ui/skeleton"
import { ListCardSkeleton, LoadingRegion } from "@/components/skeletons/pieces"

/**
 * A forma do detalhe (issues 025 e 030): título, abas, a situação e os lotes à
 * esquerda, o card Estoque e a ficha à direita.
 * A faixa do cartão de situação fica neutra: o estado só vem com o dado.
 */
export default function ProdutoLoading() {
  return (
    <LoadingRegion label="Carregando o produto" className="flex flex-col gap-5 md:gap-6">
      <div>
        <Skeleton className="mb-3 h-3.5 w-36" />
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Skeleton className="h-7 w-72 max-w-full md:h-9 md:w-96" />
            <Skeleton className="mt-2.5 h-4 w-56" />
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Skeleton className="h-11 flex-1 rounded-pill sm:w-40 sm:flex-none md:h-10" />
            <Skeleton className="h-11 w-11 rounded-pill sm:w-40 md:h-10" />
          </div>
        </div>

        {/* Abas (issue 030) */}
        <div className="flex h-11 items-center gap-6 border-b border-line">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="flex min-w-0 flex-col gap-5 md:gap-6 lg:col-span-8">
          <div className="rounded-md border border-t-[5px] border-line border-t-line-strong bg-surface p-5 shadow-card md:p-7">
            <Skeleton className="h-7 w-24 rounded-pill" />
            <Skeleton className="mt-3 h-6 w-[28rem] max-w-full md:h-8" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <ListCardSkeleton rows={3} bar="neutral" />
          <div className="rounded-md border border-line bg-surface p-5 shadow-card md:p-6">
            <Skeleton className="h-5 w-40" />
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="mt-4 flex justify-between gap-3">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-5 md:gap-6 lg:col-span-4">
          <div className="rounded-md border border-line bg-surface p-5 shadow-card md:p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mx-auto mt-6 h-3.5 w-20" />
            <Skeleton className="mx-auto mt-2 h-10 w-28" />
            <Skeleton className="mx-auto mt-3 h-3.5 w-36" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  )
}
