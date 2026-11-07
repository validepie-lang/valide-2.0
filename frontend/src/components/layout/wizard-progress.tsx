import { cn } from "@/lib/utils/cn"

/** Barra de etapas do cadastro. O trabalho precisa ter fim à vista. */
export function WizardProgress({
  steps,
  current,
  className,
}: {
  steps: string[]
  current: number
  className?: string
}) {
  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <span
              aria-hidden
              className={cn(
                "block h-1 rounded-pill transition-colors",
                i <= current ? "bg-primary" : "bg-line",
              )}
            />
            <span
              className={cn(
                "mt-2 hidden text-micro font-medium sm:block",
                i === current ? "text-fg" : "text-fg-muted",
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-label text-fg-muted sm:hidden">
        Etapa {current + 1} de {steps.length}: {steps[current]}
      </p>
    </div>
  )
}
