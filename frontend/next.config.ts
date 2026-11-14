import type { NextConfig } from "next";

/**
 * Endereço do backend FastAPI (backend/). Só é usado aqui, no build, para montar
 * o proxy abaixo. Não tem o prefixo NEXT_PUBLIC_ de propósito: quem precisa
 * falar com a API é o servidor, não o navegador.
 *
 * Em produção (Vercel) aponta para a API hospedada. Sem esta variável não há
 * proxy, e o desenvolvimento local segue chamando o backend direto pela
 * NEXT_PUBLIC_API_URL do .env.local.
 */
const API_ORIGIN = process.env.API_ORIGIN?.replace(/\/+$/, "")

const nextConfig: NextConfig = {
  /**
   * Proxy de `/api/v1/*` para o backend.
   *
   * Isto é transporte, não regra: nenhuma linha da API vive aqui, nenhum dado é
   * lido ou gravado por este arquivo. O front continua sendo só front, e a API
   * continua só no backend (CLAUDE.md seção 3).
   *
   * A razão de existir é o cookie de sessão. Publicado, o front mora em
   * valide-eight.vercel.app e a API em outro domínio. Cookie entre dois sites
   * diferentes é cookie de terceiros: o navegador recusa, e o login entra em
   * laço. Passando pelo proxy, o navegador enxerga um domínio só, o cookie é do
   * próprio site e nada precisa afrouxar SameSite.
   */
  async rewrites() {
    if (!API_ORIGIN) return []
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
    ]
  },
  // O Next reescreve um bloco no CLAUDE.md a cada `next dev`, e esse texto usa
  // travessão, que este projeto não permite em documento nenhum.
  agentRules: false,
  experimental: {
    serverActions: {
      // A planilha do catálogo sobe por server action (issue 056). O padrão é 1 MB;
      // a Vercel aceita até 4,5 MB por requisição. A tela recusa acima de 4 MB
      // (MAX_CATALOG_BYTES), e a folga é do multipart
      bodySizeLimit: "4.3mb",
    },
  },
};

export default nextConfig;
