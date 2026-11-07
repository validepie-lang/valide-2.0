import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export const STEPS = [
  { key: "origem", label: "Origem", hint: "Envie a planilha" },
  { key: "mapeamento", label: "Mapear colunas", hint: "Diga o que é cada coluna" },
  { key: "revisao", label: "Revisar", hint: "Confira antes de gravar" },
  { key: "resultado", label: "Resultado", hint: "Veja o que entrou" },
] as const

export type StepKey = (typeof STEPS)[number]["key"]

/**
 * Etapas do assistente (issue 032): na vertical, à esquerda do passo, com o
 * número num círculo, a atual cheia e as feitas com ✓. É o desenho do
 * Multi-Step Form (Behance, 8.908 visualizações) e do cadastro de produto do
 * Inventar (524 curtidas). Até aqui era uma linha de abas no topo.
 *
 * Só a etapa concluída é link: pular para uma futura levava a uma tela com
 * dado que o usuário ainda não enviou.
 */
export function ImportStepper({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <nav aria-label="Etapas da importação">
      {/* Até lg as quatro etapas não cabem ao lado do passo. Vira texto e barra */}
      <div className="lg:hidden">
        <p className="text-label text-fg-muted">
          Etapa <span className="font-semibold text-fg tnum">{currentIndex + 1}</span> de{" "}
          <span className="tnum">{STEPS.length}</span>:{" "}
          <span className="font-semibold text-fg">{STEPS[currentIndex].label}</span>
        </p>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5" aria-hidden>
          {STEPS.map((step, i) => (
            <span
              key={step.key}
              className={cn("h-1.5 rounded-pill", i <= currentIndex ? "bg-primary" : "bg-sunken")}
            />
          ))}
        </div>
      </div>

      <ol className="hidden lg:flex lg:flex-col">
        {STEPS.map((step, i) => {
          const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "todo"
          const last = i === STEPS.length - 1
          const content = (
            <>
              <span
                aria-hidden
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-pill text-label font-semibold tnum",
                  state === "current" && "bg-primary text-primary-fg",
                  state === "done" && "bg-primary-soft text-fg",
                  state === "todo" && "border border-line-strong bg-surface text-fg-muted",
                )}
              >
                {state === "done" ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="min-w-0 pt-1">
                <span
                  className={cn(
                    "block text-body underline-offset-4 group-hover:underline",
                    state === "current" ? "font-semibold text-fg" : state === "done" ? "font-medium text-fg" : "text-fg-muted",
                  )}
                >
                  {step.label}
                  {state === "done" ? <span className="sr-only">, concluída</span> : null}
                </span>
                <span className="mt-0.5 block text-label text-fg-muted">{step.hint}</span>
              </span>
            </>
          )

          return (
            <li key={step.key} className="relative pb-6 last:pb-0">
              {/* O fio que liga um círculo ao próximo */}
              {!last ? <span aria-hidden className="absolute top-8 bottom-0 left-4 w-px bg-line-strong" /> : null}
              {state === "done" ? (
                <Link
                  href={`/estoque/importar?passo=${step.key}`}
                  className="group flex gap-3 rounded-md"
                >
                  {content}
                </Link>
              ) : (
                <span aria-current={state === "current" ? "step" : undefined} className="flex gap-3">
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
