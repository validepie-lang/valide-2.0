"use client"

import { useSyncExternalStore } from "react"
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type Mode = "light" | "dark" | "system"

const STORAGE_KEY = "valide-theme"
/** Disparado por quem muda o tema, para as outras peças da tela acompanharem. */
export const THEME_EVENT = "valide-theme-change"

const OPTIONS: { mode: Mode; label: string; icon: LucideIcon }[] = [
  { mode: "light", label: "Claro", icon: Sun },
  { mode: "dark", label: "Escuro", icon: Moon },
  { mode: "system", label: "Automático", icon: Monitor },
]

function readMode(): Mode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === "light" || saved === "dark" ? saved : "system"
  } catch {
    return "system"
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(THEME_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Aplica o tema com a mesma regra do script que roda antes da primeira pintura, em layout.tsx. */
export function applyTheme(mode: Mode) {
  try {
    if (mode === "system") localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Armazenamento bloqueado: o tema vale só nesta sessão.
  }
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
  window.dispatchEvent(new Event(THEME_EVENT))
}

/**
 * Escolha de tema na tela de perfil. Antes eram três quadros que pareciam
 * botões e não faziam nada. Agora são botões de verdade, com aria-pressed, e
 * acompanham o botão de tema do trilho.
 */
export function ThemeChoice() {
  // No servidor não há preferência salva: começa em automático e corrige no navegador.
  const mode = useSyncExternalStore(subscribe, readMode, () => "system" as Mode)

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tema">
      {OPTIONS.map(({ mode: option, label, icon: Icon }) => {
        const active = option === mode
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => applyTheme(option)}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-label font-medium transition-colors",
              active
                ? "border-primary bg-primary-soft text-fg"
                : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}
