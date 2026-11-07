import { PageHeader } from "@/components/layout/page-header"
import { HelpCenter } from "@/components/help/help-center"

export const metadata = { title: "Ajuda" }

/** Referências e escopo em docs/04-issues/043-ajuda.md */
export default function AjudaPage() {
  return (
    <div>
      <PageHeader
        title="Ajuda"
        description="Respostas curtas para as dúvidas do dia a dia, com o caminho até a tela onde se faz."
      />
      <HelpCenter />
    </div>
  )
}
