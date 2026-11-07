import { Skeleton } from "@/components/ui/skeleton"
import { FieldSkeleton, LoadingRegion } from "@/components/skeletons/pieces"

/**
 * O cabeçalho e as abas vivem no layout das configurações, então já estão
 * na tela. Aqui só o conteúdo da aba: seções em uma coluna, sem card.
 */
export default function ConfiguracoesLoading() {
  return (
    <LoadingRegion label="Carregando as configurações" className="flex max-w-[720px] flex-col gap-5 md:gap-6">
      <div className="rounded-md border border-line bg-surface p-5 shadow-card md:p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
        <div className="mt-5 flex items-center gap-4">
          <Skeleton className="size-16 rounded-pill" />
          <Skeleton className="h-4 w-40" />
        </div>
        <FieldSkeleton className="mt-6" />
        <div className="mt-6 divide-y divide-line border-y border-line">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 py-3.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface p-5 shadow-card md:p-6">
        <Skeleton className="h-5 w-24" />
        <div className="mt-5 flex max-w-sm flex-col gap-4">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </div>
    </LoadingRegion>
  )
}
