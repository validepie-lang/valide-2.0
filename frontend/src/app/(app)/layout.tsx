import { AppShell } from "@/components/layout/app-shell"

/**
 * A área logada é sempre feita na hora do pedido (issue 065). É dado de cada
 * conta e muda com o dia. Sem isto, as telas que não leem cookie no modo
 * simulado (Início, Avisos, Ajuda, Configurações) eram geradas uma vez na
 * publicação: o Início publicado em 11/10 diria "11 de outubro" até a
 * publicação seguinte.
 */
export const dynamic = "force-dynamic"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
