import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
