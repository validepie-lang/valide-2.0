import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FieldSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
} from "@/components/skeletons/pieces"

export default function NovoProdutoLoading() {
  const sections = [6, 3, 3]

  return (
    <LoadingRegion label="Carregando o formulário de produto">
      <Skeleton className="mb-3 h-3.5 w-36" />
      <PageHeaderSkeleton actions={0} />

      <div className="grid gap-4 lg:grid-cols-4">
        <nav className="hidden lg:block" aria-hidden>
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-4 lg:col-span-3">
          {sections.map((fields, i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-2.5 h-3 w-80 max-w-full" />
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: fields }).map((_, f) => (
                  <FieldSkeleton key={f} />
                ))}
              </div>
            </Card>
          ))}

          <Card>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2.5 h-3 w-96 max-w-full" />
            <div className="mt-5 rounded-md border border-line p-4">
              <Skeleton className="h-3.5 w-16" />
              <div className="mt-4 grid gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, f) => (
                  <FieldSkeleton key={f} />
                ))}
              </div>
              <Skeleton className="mt-4 h-11 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </LoadingRegion>
  )
}
