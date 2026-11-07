import { AuthShowcase } from "@/components/auth/auth-showcase"

/**
 * Tela dividida (issue 034): o formulário numa metade, a marca na outra, como
 * nas quatro referências de login do Behance. Abaixo de 1024, só o formulário.
 * Sem degradê e sem círculos decorativos (SPEC 5.7, design-system.md 14.9).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-10 sm:px-10">
        <div className="w-full">{children}</div>
      </div>
      <aside aria-label="Sobre o Valide" className="hidden bg-feature lg:block">
        <div className="sticky top-0 h-dvh">
          <AuthShowcase />
        </div>
      </aside>
    </div>
  )
}
