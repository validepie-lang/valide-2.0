import Link from "next/link"
import { redirect } from "next/navigation"
import { Logo } from "@/components/layout/logo"
import { BottomNav, SideRail } from "@/components/layout/side-rail"
import { HeaderSearch, ThemeToggle, UserMenu } from "@/components/layout/header-actions"
import { NotificationsMenu } from "@/components/layout/notifications-menu"
import { ApiError } from "@/lib/api/errors"
import { optional } from "@/lib/api/safe"
import { getNotifications } from "@/lib/services/notifications"
import { getSession } from "@/lib/services/session"
import type { Company, Notification, User } from "@/lib/types"

/**
 * Sessão para o cabeçalho.
 *
 * Token inválido ou expirado leva para o login, que é o que o usuário precisa
 * fazer. Qualquer outra falha devolve null: o cabeçalho perde o menu da conta,
 * mas a navegação continua de pé e a tela abaixo mostra o próprio erro.
 */
async function loadSession(): Promise<{ user: User; company: Company } | null> {
  try {
    return await getSession()
  } catch (cause) {
    if (cause instanceof ApiError && cause.kind === "unauthorized") {
      redirect("/login")
    }
    return null
  }
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [session, notifications] = await Promise.all([
    loadSession(),
    // Fora do ar, o sino some e o resto do app continua
    optional<Notification[] | null>(getNotifications(), null),
  ])

  return (
    <div className="min-h-dvh bg-page">
      {/* Primeira parada do Tab. Some da tela até receber foco. */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-pill focus:bg-primary focus:px-5 focus:text-body focus:font-medium focus:text-primary-fg"
      >
        Pular para o conteúdo
      </a>

      <SideRail />

      {/* Tudo à direita do trilho. O trilho tem 96px e é fixo. */}
      <div className="md:pl-24 print:pl-0">
        <header className="sticky top-0 z-30 bg-page/85 backdrop-blur-md print:hidden">
          <div className="mx-auto flex h-18 max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
            {/* No celular não há trilho, então a marca volta para o cabeçalho */}
            <Link
              href="/"
              aria-label="Valide, ir para o início"
              className="flex min-h-11 shrink-0 items-center md:hidden"
            >
              <Logo />
            </Link>

            <HeaderSearch className="hidden w-full max-w-sm md:block" />

            <div className="ml-auto flex items-center gap-2">
              {/* No desktop o tema mora no trilho */}
              <ThemeToggle className="md:hidden" />
              {notifications ? <NotificationsMenu items={notifications} /> : null}
              {session ? <UserMenu user={session.user} company={session.company.tradeName} /> : null}
            </div>
          </div>
        </header>

        <main
          id="conteudo"
          tabIndex={-1}
          className="mx-auto max-w-[1440px] px-4 pt-2 pb-28 focus:outline-none md:px-6 md:pb-12 lg:px-8 print:p-0"
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
