import { cn } from "@/lib/utils/cn"

/**
 * Carregando é skeleton com a forma do conteúdo, nunca spinner solto.
 * Spinner em máquina lenta parece travamento. Ver architecture.md seção 5.
 */
export function Skeleton({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-sunken", className)}
      style={style}
      aria-hidden
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  )
}
