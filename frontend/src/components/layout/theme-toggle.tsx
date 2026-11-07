"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { THEME_EVENT } from "@/components/layout/theme-choice"

/**
 * Alternância de tema sem estado no React.
 *
 * A classe no <html> é a fonte da verdade, escrita antes da hidratação pelo
 * script do layout. Os dois ícones ficam no DOM e o CSS mostra o certo, então
 * não existe piscada nem divergência entre servidor e navegador.
 */
export function ThemeToggle({
  className,
  tone = "default",
}: {
  className?: string
  /** `rail`: no trilho escuro, sem a moldura de botão do cabeçalho. */
  tone?: "default" | "rail"
}) {
  function toggle() {
    const root = document.documentElement
    const next = !root.classList.contains("dark")
    root.classList.toggle("dark", next)
    try {
      localStorage.setItem("valide-theme", next ? "dark" : "light")
    } catch {
      // Navegador com armazenamento bloqueado. O tema vale só nesta sessão.
    }
    // A escolha de tema do perfil acompanha a troca feita aqui
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar entre tema claro e escuro"
      title="Alternar entre tema claro e escuro"
      className={cn(
        "grid size-11 place-items-center rounded-pill transition-colors active:scale-95 md:size-10",
        tone === "rail"
          ? "text-rail-muted hover:bg-rail-active hover:text-rail-fg"
          : "border border-line bg-surface text-fg-muted hover:bg-primary-soft hover:text-fg",
        className,
      )}
    >
      <Moon className="size-[18px] dark:hidden" aria-hidden />
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
    </button>
  )
}
