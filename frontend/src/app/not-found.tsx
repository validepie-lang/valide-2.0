import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { LinkButton } from "@/components/ui/button"

export const metadata = { title: "Página não encontrada" }

/**
 * Página 404 geral (issue 038). Até aqui só o produto tinha "não encontrado";
 * qualquer outro endereço caía na página padrão do Next, em inglês.
 *
 * Das referências mais bem avaliadas do Behance (404 Error Page Template, 1.403
 * curtidas; 404 Page Design Concepts, 522): o código grande, um título que diz
 * o que aconteceu, uma frase com o motivo e um botão só para voltar; embaixo,
 * uma linha de links (lá, redes sociais; aqui, as telas mais usadas). Sem a
 * ilustração das referências (design-system.md 14.9).
 */
const SHORTCUTS = [
  { href: "/estoque", label: "Estoque" },
  { href: "/estoque/validades-pendentes", label: "Validades pendentes" },
  { href: "/avisos", label: "Avisos" },
]

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-page px-4 py-8 sm:px-10">
      <Link href="/" aria-label="Valide, ir para o painel" className="self-start">
        <Logo />
      </Link>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12">
        <p className="font-display text-[5rem] leading-none font-extrabold tracking-tight text-fg-muted md:text-[7rem]">
          404
        </p>
        <h1 className="mt-4 font-display text-display-sm font-bold text-balance text-fg md:text-display">
          Esta página não existe
        </h1>
        <p className="mt-3 text-body text-fg-muted">
          O endereço pode ter sido digitado errado, ou a página mudou de lugar. Nada no seu estoque foi alterado.
        </p>
        <LinkButton href="/" size="lg" className="mt-7 w-full self-start sm:w-auto">
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao painel
        </LinkButton>

        <nav aria-label="Telas mais usadas" className="mt-10 border-t border-line pt-5">
          <p className="text-label font-semibold text-fg-muted">Ou vá direto para</p>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {SHORTCUTS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex min-h-11 items-center text-body font-medium text-fg underline-offset-4 hover:underline md:min-h-0"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  )
}
