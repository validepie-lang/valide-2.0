import { NextResponse, type NextRequest } from "next/server"
import { isLive } from "@/lib/api/config"

/**
 * Porteiro da área logada, antes de qualquer renderização.
 *
 * O `redirect("/login")` do AppShell continua sendo quem barra a sessão inválida,
 * mas ele só roda depois que o servidor já começou a enviar a tela; a partir daí
 * o Next transforma o desvio em navegação do navegador, e o usuário vê o
 * esqueleto piscar antes de cair no login. Aqui o desvio acontece antes de
 * existir corpo de resposta, e sem falar com a API: é só a presença do cookie.
 *
 * Presença não é validade. Quem decide se a sessão vale é a API, a cada busca.
 * Este arquivo só evita montar a área logada para quem chegou sem sessão nenhuma.
 *
 * O arquivo se chama `proxy.ts` porque é assim que o Next 16 chama o antigo
 * `middleware.ts`. Ver docs/07-decisions/security-decisions.md, 16/09/2026.
 */

// Nome do cookie definido em lib/api/session-token.ts. Não dá para importar de
// lá: aquele módulo usa `next/headers`, que não existe aqui.
const SESSION_COOKIE = "valide_session"

/** Telas que existem sem sessão: o login e o cadastro da empresa. */
const PUBLIC_PATHS = ["/login", "/cadastro-empresa"]

export function proxy(request: NextRequest) {
  // Em modo simulado (ou num deploy sem API configurada) não existe sessão nem
  // cookie. Prender aqui derrubaria a demonstração inteira no login.
  if (!isLive("auth")) return NextResponse.next()

  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }

  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next()

  const login = request.nextUrl.clone()
  login.pathname = "/login"
  login.search = ""
  return NextResponse.redirect(login)
}

export const config = {
  // Fora daqui: as rotas da API (o proxy do next.config), os arquivos do Next e
  // tudo que tem ponto no nome (imagem, ícone, fonte), que não é tela.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}
