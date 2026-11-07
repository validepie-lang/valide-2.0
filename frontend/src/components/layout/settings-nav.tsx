"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Building2, UserRound, UsersRound } from "lucide-react"
import { TabsNav } from "@/components/ui/tabs-nav"
import { cn } from "@/lib/utils/cn"

const ITEMS = [
  { href: "/configuracoes", label: "Meu perfil", hint: "Nome, senha e aparência", icon: UserRound },
  // Escolha de cada pessoa, por isso logo depois do perfil (issue 044)
  { href: "/configuracoes/notificacoes", label: "Notificações", hint: "O que aparece no sino", icon: Bell },
  { href: "/configuracoes/empresa", label: "Empresa", hint: "Dados, endereço e janela", icon: Building2 },
  { href: "/configuracoes/usuarios", label: "Usuários", hint: "Quem acessa e o cargo", icon: UsersRound },
]

/**
 * Seções das configurações (issue 033). A partir de 1024, lista vertical num
 * card à esquerda, com a seção ativa marcada, como no Profile Settings Page
 * for a Fintech Web App (Behance, 15.034 visualizações) e no Profile Setting
 * Ui Design (793 curtidas). Abaixo disso, as abas de antes.
 */
export function SettingsNav() {
  const pathname = usePathname()

  return (
    <>
      <TabsNav items={ITEMS} label="Seções das configurações" className="mb-6 lg:hidden" />

      <nav
        aria-label="Seções das configurações"
        className="hidden overflow-hidden rounded-md border border-line bg-surface shadow-card lg:block"
      >
        <ul className="divide-y divide-line">
          {ITEMS.map(({ href, label, hint, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-start gap-3 px-5 py-4 transition-colors focus-visible:-outline-offset-2",
                    active ? "bg-primary-soft" : "hover:bg-sunken",
                  )}
                >
                  {active ? <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-primary" /> : null}
                  <Icon
                    className={cn("mt-0.5 size-4 shrink-0", active ? "text-fg" : "text-fg-muted")}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-body",
                        active ? "font-semibold text-fg" : "font-medium text-fg",
                      )}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-label text-fg-muted">{hint}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
