import { cn } from "@/lib/utils/cn"
import { initials } from "@/lib/utils/format"

/** Sem foto até o upload existir. Iniciais em Ardósia, nunca placeholder cinza mudo. */
export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const dim = { sm: "size-8 text-micro", md: "size-10 text-label", lg: "size-16 text-section" }
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-pill bg-primary font-semibold text-primary-fg select-none",
        dim[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
