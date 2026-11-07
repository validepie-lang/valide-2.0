"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/field"
import { cn } from "@/lib/utils/cn"

/**
 * Campo de senha com o olho para mostrar e esconder (issue 045, item 43), como
 * no Login/Sign Up Template e no Modern Login Page (Behance, issue 034).
 * Ajuda quem digita no balcão a conferir antes de enviar. O botão diz o que
 * faz e se a senha está à mostra (`aria-pressed`).
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean }
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = React.useState(false)
  const Icon = visible ? EyeOff : Eye
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-12", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Esconder a senha" : "Mostrar a senha"}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-fg-muted transition-colors hover:text-fg"
      >
        <Icon className="size-4" aria-hidden />
      </button>
    </div>
  )
})
