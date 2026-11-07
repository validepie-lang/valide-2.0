import { PageHeader } from "@/components/layout/page-header"
import { SettingsNav } from "@/components/layout/settings-nav"

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Seu perfil, os dados da empresa e quem tem acesso ao Valide."
      />
      {/* Seções à esquerda e o formulário à direita (Fintech e Profile Setting, Behance; issue 033) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <SettingsNav />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </div>
  )
}
