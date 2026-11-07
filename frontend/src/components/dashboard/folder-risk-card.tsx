import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { FolderRiskDonut } from "@/components/dashboard/folder-risk-donut"
import { folderShares, folderSharesHeadline, sliceColor } from "@/lib/utils/folder-share"
import { cn } from "@/lib/utils/cn"
import { formatNumber } from "@/lib/utils/format"
import type { FolderRiskPoint } from "@/lib/types"

/**
 * "Em risco por pasta" (issue 067, item 4): a rosca do Gyle, com a legenda e
 * os números ao lado. O título diz a conclusão (design-system 14.5). Cada
 * pasta abre o Estoque filtrado por ela e pelos estados em risco; "Outras
 * pastas" junta várias e não tem para onde levar.
 */
export function FolderRiskCard({ points, className }: { points: FolderRiskPoint[]; className?: string }) {
  const slices = folderShares(points)
  const total = slices.reduce((sum, s) => sum + s.count, 0)

  return (
    <section
      aria-labelledby="em-risco-por-pasta"
      className={cn("min-w-0 rounded-md border border-line bg-surface p-5 shadow-card md:p-7", className)}
    >
      <h2 id="em-risco-por-pasta" className="font-display text-section font-bold text-fg">
        {folderSharesHeadline(slices)}
      </h2>
      <p className="mt-1 text-label text-fg-muted">Produtos vencidos e a vencer, por pasta</p>

      {slices.length === 0 ? (
        <p className="mt-5 text-body text-fg-muted">Nenhum produto vencido ou a vencer está numa pasta.</p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <FolderRiskDonut slices={slices} total={total} />
          <ul className="w-full min-w-0 flex-1 divide-y divide-line">
            {slices.map((slice, i) => {
              const content = (
                <>
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-[4px]"
                    style={{ background: sliceColor(i) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-fg">{slice.name}</span>
                  <span className="tnum font-semibold text-fg">
                    {formatNumber(slice.count)}
                    <span className="sr-only"> {slice.count === 1 ? "produto" : "produtos"},</span>
                  </span>
                  <span className="w-11 text-right tnum text-fg-muted">{slice.percent}%</span>
                </>
              )
              return (
                <li key={slice.id}>
                  {slice.folderId ? (
                    <Link
                      href={`/estoque?pasta=${slice.folderId}&status=expired,soon`}
                      className="group -mx-2 flex min-h-11 items-center gap-3 rounded-sm px-2 text-label transition-colors hover:bg-primary-soft"
                    >
                      {content}
                      <ChevronRight
                        className="size-4 shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    <div className="flex min-h-11 items-center gap-3 pr-7 text-label">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
