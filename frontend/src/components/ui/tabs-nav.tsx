"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"

/**
 * Abas de seção, com sublinhado na ativa.
 *
 * Desenho próprio de propósito: até 08/10 a aba ativa era a mesma pílula
 * escura do chip de filtro e da etapa atual da importação, três funções com
 * o mesmo desenho (design-system.md, seção 14.6). Cada aba é um link: a seção
 * mora na rota, então voltar, recarregar e abrir em nova aba funcionam.
 */
export function TabsNav({
  items,
  label,
  active: activeHref,
  className,
}: {
  items: { href: string; label: string }[]
  /** nome do grupo para leitor de tela */
  label: string
  /** a aba ativa, quando ela mora na query (?aba=) e não no caminho */
  active?: string
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav aria-label={label} className={cn("border-b border-line", className)}>
      {/* No celular rola na horizontal dentro do trilho, sem quebrar linha */}
      <ul className="scroll-slim -mb-px flex gap-6 overflow-x-auto">
        {items.map((item) => {
          const active = (activeHref ?? pathname) === item.href
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center border-b-2 text-body font-medium whitespace-nowrap transition-colors focus-visible:-outline-offset-2",
                  active
                    ? "border-fg text-fg"
                    : "border-transparent text-fg-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
