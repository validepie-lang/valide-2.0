import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/**
 * Estado vazio nunca é mudo: ícone, uma frase que explica, e o botão da ação
 * que resolve. O público não vai procurar o que fazer.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  align = "center",
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  /** "start" quando o estado ocupa o lugar de conteúdo alinhado à esquerda */
  align?: "center" | "start"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center py-12",
        align === "center" ? "items-center px-6 text-center" : "items-start text-left",
        className,
      )}
    >
      {/* Ícone solto, sem quadrado (SPEC 4.6) */}
      <Icon className="size-8 text-fg-muted" strokeWidth={1.5} aria-hidden />
      <h3 className="mt-4 text-section font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body text-fg-muted">{description}</p>
      {action ? (
        <div className={cn("mt-5 flex flex-wrap gap-2", align === "center" && "justify-center")}>
          {action}
        </div>
      ) : null}
    </div>
  )
}
