"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Abre a impressão do navegador; o que sai no papel é decidido pelas classes `print:` da página */
export function PrintButton({ children = "Imprimir lista" }: { children?: React.ReactNode }) {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden />
      {children}
    </Button>
  )
}
