import { PackageSearch } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function ProdutoNaoEncontrado() {
  return (
    <Card className="mx-auto mt-10 max-w-2xl">
      <EmptyState
        icon={PackageSearch}
        title="Produto não encontrado"
        description="Este produto pode ter sido excluído, ou o link está incorreto. Procure pelo nome na busca do estoque."
        action={<LinkButton href="/estoque">Voltar ao estoque</LinkButton>}
      />
    </Card>
  )
}
