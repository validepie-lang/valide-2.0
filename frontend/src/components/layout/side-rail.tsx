"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRight,
  Bell,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  House,
  Package,
  Settings,
  TrendingDown,
  type LucideIcon,
} from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { cn } from "@/lib/utils/cn"

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean }

const HOME: Item = { href: "/", label: "Início", icon: House, exact: true }
const STOCK: Item = { href: "/estoque", label: "Estoque", icon: Package }
const QUEUE: Item = {
  href: "/estoque/validades-pendentes",
  label: "Validades",
  icon: CalendarClock,
  exact: true,
}
// Perdas (issue 036): o item que o canvas da direção A já mostrava
const LOSSES: Item = { href: "/perdas", label: "Perdas", icon: TrendingDown }
const SETTINGS: Item = { href: "/configuracoes", label: "Ajustes", icon: Settings }
const HELP: Item = { href: "/ajuda", label: "Ajuda", icon: CircleHelp, exact: true }

/**
 * Oito destinos no desktop (issue 066, itens 80, 97 e 61 do que ficou de
 * fora): Movimentações e Calendário continuam como abas do Estoque, e o menu
 * leva direto a elas; Avisos continua também no sino. "Movimentos", e não
 * "Movimentações", porque a palavra longa passa da largura do trilho.
 */
const RAIL: Item[] = [
  HOME,
  STOCK,
  QUEUE,
  { href: "/estoque/movimentacoes", label: "Movimentos", icon: ArrowLeftRight },
  { href: "/estoque/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/avisos", label: "Avisos", icon: Bell },
  LOSSES,
  SETTINGS,
]

/** Seis no celular, para cada um ter 60px em 360 (item 89: Ajuda vem para a barra) */
const BAR: Item[] = [HOME, STOCK, QUEUE, LOSSES, SETTINGS, HELP]

/**
 * O item mais específico ganha. Sem isso, "/estoque/validades-pendentes"
 * acenderia Estoque e Validades ao mesmo tempo.
 */
function activeHref(pathname: string, items: Item[]): string | undefined {
  const matches = items.filter((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`),
  )
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href
}

/**
 * Trilho lateral do desktop, da referência MT.
 *
 * Escuro nos dois temas: é a âncora da marca e tira a navegação do topo, para o
 * conteúdo começar na primeira linha da tela. O rótulo fica embaixo do ícone,
 * nunca só o ícone: quem está no balcão não decora pictograma.
 */
export function SideRail() {
  const pathname = usePathname()
  const current = activeHref(pathname, [...RAIL, HELP])
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col items-center border-r border-rail-line bg-rail py-5 md:flex print:hidden">
      <Link
        href="/"
        aria-label="Valide, ir para o início"
        className="grid size-12 place-items-center rounded-md"
      >
        <Logo tone="onDeep" markOnly />
      </Link>

      {/* Em tela baixa a lista rola sozinha; Ajuda e tema ficam sempre à vista */}
      <nav aria-label="Navegação principal" className="mt-4 min-h-0 w-full flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-0.5 px-2">
          {RAIL.map((item) => (
            <li key={item.href}>
              <RailLink item={item} active={item.href === current} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Ajuda embaixo, longe das telas de trabalho, como o Core e o grupo "General" do Vault (issues 043 e 066) */}
      <div className="mt-1 mb-2 w-full px-2">
        <RailLink item={HELP} active={HELP.href === current} />
      </div>
      <ThemeToggle tone="rail" />
    </aside>
  )
}

/**
 * Ícone com rótulo embaixo. Mais baixo desde a 066 (ícone em 36px, menos
 * respiro), para oito destinos caberem em 800px, como na versão estreita do
 * Dashboard side bar components.
 */
function RailLink({ item: { href, label, icon: Icon }, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex flex-col items-center gap-1 rounded-md py-1 transition-colors",
        active ? "text-rail-active-fg" : "text-rail-muted hover:text-rail-fg",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-md transition-colors",
          active ? "bg-rail-active" : "group-hover:bg-rail-active/60",
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="text-micro font-medium">{label}</span>
    </Link>
  )
}

/** No celular o trilho vira barra inferior escura, com alvo de toque de 44px ou mais. */
export function BottomNav() {
  const current = activeHref(usePathname(), BAR)
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rail-line bg-rail md:hidden print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex max-w-lg">
        {BAR.map(({ href, label, icon: Icon }) => {
          const active = href === current
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-micro font-medium transition-colors",
                  active ? "text-rail-active-fg" : "text-rail-muted",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-12 place-items-center rounded-pill transition-colors",
                    active ? "bg-rail-active" : "bg-transparent",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
