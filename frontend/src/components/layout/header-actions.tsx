"use client"

import { useCallback, useRef, useState } from "react"
import Link from "next/link"
import { useDismiss } from "@/lib/hooks/use-dismiss"
import { usePathname, useRouter } from "next/navigation"
import { CircleHelp, LogOut, Search, Settings, UserRound } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { signOut } from "@/lib/services/auth"
import { cn } from "@/lib/utils/cn"
import type { User } from "@/lib/types"
import { ROLE_LABEL } from "@/lib/types"

/**
 * Busca do topo: pesquisa no estoque, que é onde os produtos estão.
 * Some na própria tela de estoque, que tem a busca dela junto dos filtros.
 * Duas buscas iguais na mesma tela fazem o usuário perguntar qual usar.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const pathname = usePathname()
  if (pathname === "/estoque") return <div className={className} aria-hidden />

  return (
    <form action="/estoque" role="search" className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden
      />
      <label htmlFor="busca-global" className="sr-only">
        Buscar produto
      </label>
      <input
        id="busca-global"
        name="busca"
        type="search"
        placeholder="Buscar produto ou código de barras"
        className={cn(
          "h-11 w-full rounded-pill border border-line bg-surface pr-4 pl-10",
          "text-body text-fg placeholder:text-fg-muted",
          "transition-colors hover:border-line-strong",
        )}
      />
    </form>
  )
}

/**
 * Menu da conta.
 *
 * Não usa <details>. O navegador mantém o conteúdo de um <details> fechado no
 * caminho do Tab, então um usuário de teclado parava em "Sair da conta" sem
 * nada aparecer na tela. Aqui o menu só existe no DOM quando está aberto.
 */
export function UserMenu({ user, company }: { user: User; company: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss({ open, onClose: close, containerRef: boxRef, triggerRef: buttonRef })

  return (
    <div ref={boxRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Conta de ${user.name}`}
        className={cn(
          "grid size-11 place-items-center rounded-pill md:size-10",
          "transition-opacity hover:opacity-80",
        )}
      >
        <Avatar name={user.name} />
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-md border border-line",
            "bg-surface p-1.5 shadow-pop",
          )}
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-body font-medium text-fg">{user.name}</p>
            <p className="truncate text-label text-fg-muted">{company}</p>
            <p className="mt-1.5 inline-flex rounded-pill bg-primary-soft px-2 py-0.5 text-micro font-medium text-fg-muted">
              {ROLE_LABEL[user.role]}
            </p>
          </div>
          <hr className="my-1 border-line" />
          <MenuLink href="/configuracoes" icon={UserRound}>
            Meu perfil
          </MenuLink>
          <MenuLink href="/configuracoes/empresa" icon={Settings}>
            Dados da empresa
          </MenuLink>
          {/* Ajuda junto da conta, como o "Help & Support" do Pharmly (issue 043): é por aqui no celular */}
          <MenuLink href="/ajuda" icon={CircleHelp}>
            Ajuda
          </MenuLink>
          <hr className="my-1 border-line" />
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              close()
              await signOut()
              // Revalida para o servidor reler a requisição já sem a sessão
              router.push("/login")
              router.refresh()
            }}
            className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2 text-body text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg md:min-h-0"
          >
            <LogOut className="size-4" aria-hidden />
            Sair da conta
          </button>
        </div>
      ) : null}
    </div>
  )
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon: typeof UserRound
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-body text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg md:min-h-0"
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </Link>
  )
}

export { ThemeToggle }
