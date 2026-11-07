import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ListCardSkeleton, LoadingRegion } from "@/components/skeletons/pieces"
import { STATUS_ORDER, type ExpiryStatus } from "@/lib/utils/expiry"
import { cn } from "@/lib/utils/cn"

/**
 * A forma da Home (issues 025 e 027), para nada pular quando o dado chega.
 *
 * Os cartões de estado já vêm com a faixa colorida: a ordem e a cor são fixas,
 * não dependem do dado. O fundo tingido fica de fora, porque depende da
 * contagem. Pelo mesmo motivo, as duas listas têm a barra do estado delas.
 */
const BAR: Record<ExpiryStatus, string> = {
  expired: "border-t-status-expired",
  soon: "border-t-status-soon",
  ok: "border-t-status-ok",
  unknown: "border-t-status-unknown",
}

export default function DashboardLoading() {
  return (
    <LoadingRegion label="Carregando o painel" className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="mt-2.5 h-7 w-56 md:h-9 md:w-80" />
        </div>
        <Skeleton className="h-11 w-full rounded-pill sm:w-48 md:h-10" />
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        {/* O cartão principal já vem cheio: a cor é fixa, não depende do dado */}
        <div className="flex flex-col gap-4 rounded-md bg-feature p-5 shadow-card md:p-7 lg:col-span-4">
          <Skeleton className="h-3.5 w-28 bg-feature-line" />
          <Skeleton className="h-12 w-52 bg-feature-line md:h-[3.75rem] md:w-64" />
          <Skeleton className="h-3.5 w-64 max-w-full bg-feature-line" />
          <div>
            <Skeleton className="h-3 w-full rounded-pill bg-feature-line" />
            <Skeleton className="mt-2.5 h-3.5 w-40 bg-feature-line" />
          </div>
          <Skeleton className="mt-auto h-12 w-full rounded-pill bg-feature-line sm:w-56" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:col-span-8 lg:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className={cn(
                "flex flex-col gap-2 rounded-md border border-t-[5px] border-line bg-surface p-4 shadow-card md:p-5",
                BAR[status],
              )}
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-14 md:h-11 md:w-16" />
              <Skeleton className="h-3.5 w-28 max-w-full" />
              {status === "unknown" ? <Skeleton className="mt-auto h-3.5 w-32 max-w-full" /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <Card as="div" className="min-w-0 p-5 md:p-7 lg:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <Skeleton className="h-5 w-72 max-w-full" />
              <Skeleton className="mt-2 h-3.5 w-64 max-w-full" />
            </div>
            <Skeleton className="h-3.5 w-48" />
          </div>
          {/* Barra com a largura máxima do gráfico real (56px), centrada na fatia da semana */}
          <div className="mt-5 flex h-60 flex-col">
            <div className="flex flex-1 items-end gap-2 sm:gap-3 md:gap-6">
              {[40, 75, 60, 75, 50, 25, 25, 35].map((h, i) => (
                <div key={i} className="flex h-full min-w-0 flex-1 items-end justify-center">
                  <Skeleton
                    className="w-full max-w-14 rounded-t-sm rounded-b-none"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2 sm:gap-3 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex min-w-0 flex-1 justify-center">
                  <Skeleton className="h-3 w-9 max-w-full" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <ListCardSkeleton bar="bg-status-expired" action className="lg:col-span-4" />
      </div>

      <ListCardSkeleton bar="bg-status-soon" action />
    </LoadingRegion>
  )
}
