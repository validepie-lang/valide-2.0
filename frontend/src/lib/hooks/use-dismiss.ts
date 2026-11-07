"use client"

import { useEffect, type RefObject } from "react"

/**
 * Fecha um painel flutuante com Esc ou com clique fora dele.
 *
 * Com Esc o foco volta para o botão que abriu: sem isso, quem usa teclado ou
 * leitor de tela fica com o foco perdido no corpo da página. Usado pelo menu
 * da conta, pelo de avisos, pelo "Mais filtros" e pelo seletor de colunas.
 */
export function useDismiss({
  open,
  onClose,
  containerRef,
  triggerRef,
}: {
  open: boolean
  onClose: () => void
  /** o painel e o botão; clique aqui dentro não fecha */
  containerRef: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
        triggerRef.current?.focus()
      }
    }
    function onPointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) onClose()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
    }
  }, [open, onClose, containerRef, triggerRef])
}
