import Link from "next/link"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/**
 * Confirmação depois de gravar e mudar de página (issue 054), o Banner do
 * Primer, Saving: quando a ação leva a outra tela, a confirmação aparece no
 * topo da tela de chegada. Neutra: verde é No prazo, não "deu certo"
 * (CLAUDE.md, regra 1). Fechar volta ao mesmo endereço sem o aviso.
 */
export function SavedBanner({
  children,
  closeHref,
  className,
}: {
  children: React.ReactNode
  closeHref: string
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-md border border-line bg-surface py-3 pr-2 pl-4 text-body text-fg shadow-card",
        className,
      )}
    >
      <Check className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
      <Link
        href={closeHref}
        scroll={false}
        aria-label="Fechar aviso"
        className="-my-1.5 grid size-9 shrink-0 place-items-center rounded-md text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg"
      >
        <X className="size-4" aria-hidden />
      </Link>
    </div>
  )
}
