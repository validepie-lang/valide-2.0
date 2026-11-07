import type { LucideIcon } from "lucide-react"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/**
 * O que todo formulário que grava mostra (fase de lógica, issues 053 e 054),
 * a partir do Primer: Forms (o primeiro campo errado recebe o foco), Saving
 * (falhou, o que foi digitado fica, e a pessoa sabe o que houve) e Loading (o
 * botão diz que está gravando, sem ficar desabilitado).
 */

/** Ícone e texto do botão de enviar: "Salvando…" enquanto grava. Seta de avançar vai depois do texto */
export function SubmitLabel({
  saving,
  icon: Icon,
  iconAfter = false,
  savingLabel = "Salvando…",
  children,
}: {
  saving: boolean
  icon: LucideIcon
  iconAfter?: boolean
  /** o que dizer enquanto grava, quando não é salvar ("Excluindo…") */
  savingLabel?: string
  children: React.ReactNode
}) {
  if (saving) {
    return (
      <>
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        {savingLabel}
      </>
    )
  }
  const icon = <Icon className="size-4" aria-hidden />
  return (
    <>
      {iconAfter ? null : icon}
      {children}
      {iconAfter ? icon : null}
    </>
  )
}

/** A recusa do servidor que não é de um campo só, com a mensagem dele, que já diz o que fazer */
export function FormFailure({
  message,
  after = "O que você digitou continua aqui.",
  className,
}: {
  message: string
  /** o que ficou depois da recusa; num interruptor, que ele voltou */
  after?: string
  className?: string
}) {
  return (
    <p
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-sm bg-error-bg px-4 py-3 text-label text-error-fg",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        {message} {after}
      </span>
    </p>
  )
}

/**
 * Gravou e a pessoa continua na mesma tela (issue 059): a confirmação ao lado
 * do botão, a InlineMessage do Primer, Saving. Neutra: verde é No prazo.
 * Fica sempre na página, vazia, para o leitor de tela ouvir quando muda.
 */
export function SavedNote({ message, className }: { message: string | null; className?: string }) {
  return (
    <p role="status" className={cn("text-label text-fg-muted", className)}>
      {message ? (
        <span className="inline-flex items-center gap-1.5">
          <Check className="size-3.5 shrink-0" aria-hidden />
          {message}
        </span>
      ) : null}
    </p>
  )
}

/** Foco no primeiro campo com erro, na ordem de `ids` (a ordem da tela) */
export function focusFirstError<K extends string>(
  ids: Record<K, string>,
  errors: Partial<Record<K, string>>,
) {
  const first = (Object.keys(ids) as K[]).find((field) => errors[field])
  if (first) document.getElementById(ids[first])?.focus()
}
