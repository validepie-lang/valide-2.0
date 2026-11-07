"use client"

import { useEffect, useId, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/**
 * Janela sobre a tela, como o "Add Company" do Ventor (Behance, issue 039):
 * título, fechar no canto, o conteúdo e as ações embaixo à direita.
 *
 * Usa o `<dialog>` do navegador com `showModal()`: o foco fica preso dentro,
 * Esc fecha e, ao fechar, o foco volta ao botão que abriu. Clicar fora também
 * fecha. Quem abre controla `open`; o componente só avisa com `onClose`.
 * O campo marcado com `data-autofocus` recebe o foco ao abrir.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // O React não põe `autofocus` no HTML; sem isto o foco iria para o "Fechar"
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Esc: quem abriu decide, para o estado não ficar aberto com a janela fechada
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // O clique no fundo chega ao próprio <dialog>; dentro da caixa, chega ao filho
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-md border border-line bg-surface p-0 text-fg shadow-pop backdrop:bg-rail/70",
        className,
      )}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-section font-bold text-fg">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1.5 text-body text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mt-1.5 -mr-1.5 grid size-11 shrink-0 place-items-center rounded-pill text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg md:size-9"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

/** As ações da janela, embaixo à direita; no celular, uma por linha com a principal em cima */
export function DialogActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>
}
