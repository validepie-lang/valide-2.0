import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion, PageHeaderSkeleton } from "@/components/skeletons/pieces"

/**
 * A forma de Pastas (issue 039): o cabeçalho com "Criar pasta" e a tabela de
 * largura inteira, com a faixa cinza do cabeçalho da tabela a partir da tela média.
 */
export default function PastasLoading() {
  return (
    <LoadingRegion label="Carregando as pastas">
      <Skeleton className="mb-3 h-3.5 w-36" />
      <PageHeaderSkeleton actions={1} />

      <div className="overflow-hidden rounded-md border border-line bg-surface shadow-card">
        <div className="p-4 md:px-6 md:pt-6 md:pb-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2.5 h-3.5 w-80 max-w-full" />
        </div>
        <div className="hidden h-11 items-center gap-6 border-y border-line bg-sunken px-6 md:flex">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="h-3 w-32" />
          <span className="w-44" />
        </div>
        <div className="divide-y divide-line border-t border-line md:border-t-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 md:gap-6 md:px-6">
              <Skeleton className="size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="mt-1.5 h-3 w-32 md:hidden" />
              </div>
              <Skeleton className="hidden h-3.5 w-10 md:block" />
              <Skeleton className="hidden h-3.5 w-10 md:ml-20 md:block" />
              <div className="flex shrink-0 gap-1 md:ml-6">
                <Skeleton className="size-11 md:size-9 lg:w-24" />
                <Skeleton className="size-11 md:size-9 lg:w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </LoadingRegion>
  )
}
