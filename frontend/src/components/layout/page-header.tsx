import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export function PageHeader({
  title,
  description,
  back,
  actions,
  className,
}: {
  title: string
  /** texto, ou conteúdo com link (a pasta no detalhe do produto) */
  description?: React.ReactNode
  back?: { href: string; label: string }
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-6", className)}>
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-label font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-display-sm font-bold text-fg md:text-display">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-body text-fg-muted">{description}</p>
          ) : null}
        </div>
        {/* No celular cada botão ocupa a largura inteira, em vez de empilhar cada um
            de um tamanho. Lado a lado não cabe: "Adicionar produto" cortava em 360 */}
        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
