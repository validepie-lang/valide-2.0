import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/** Todo input tem label associado. Placeholder nunca substitui rótulo. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-label font-medium text-fg">
        {label}
        {required ? <span className="ml-0.5 text-fg-muted">*</span> : null}
      </label>
      {children}
      {/* `<htmlFor>-mensagem`: o campo aponta para cá com aria-describedby */}
      {error ? (
        <p id={`${htmlFor}-mensagem`} className="flex items-center gap-1.5 text-label text-error-fg">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-mensagem`} className="text-label text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Placeholder em `fg-muted` (5,68:1 no claro, 6,25:1 no escuro): o WCAG trata
 * placeholder como texto. Até 09/10 era `fg-disabled`, perto de 2,5:1. Com o
 * contraste certo, exemplo que imita dado parece campo preenchido, então
 * exemplo leva "Ex.:" e número de exemplo não existe (design-system.md 14.10).
 */
const CONTROL =
  "w-full rounded-md border bg-surface text-body text-fg placeholder:text-fg-muted " +
  "transition-colors h-11 px-3 " +
  "disabled:cursor-not-allowed disabled:bg-sunken disabled:text-fg-disabled"

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        invalid
          ? "border-error hover:border-error"
          : "border-line hover:border-line-strong",
        className,
      )}
      {...props}
    />
  )
})

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(CONTROL, "h-auto min-h-20 border-line py-2.5 hover:border-line-strong", className)}
      {...props}
    />
  )
})

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          CONTROL,
          "appearance-none border-line pr-9 hover:border-line-strong",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-fg-muted"
      >
        <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
})

/** Prefixo dentro do campo, para moeda e unidade. */
export function InputAffix({
  affix,
  side = "left",
  children,
}: {
  affix: string
  side?: "left" | "right"
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-body text-fg-muted",
          side === "left" ? "left-3" : "right-3",
        )}
      >
        {affix}
      </span>
      <div className={side === "left" ? "[&_input]:pl-10" : "[&_input]:pr-12"}>
        {children}
      </div>
    </div>
  )
}
