import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { EntrySearch } from "@/components/products/entry-search"
import { getProducts } from "@/lib/services/products"

export const metadata = { title: "Registrar saída" }

/** Quantos resultados mostrar: quem bipou quer um, quem escreveu o nome escolhe entre poucos */
const MAX_RESULTS = 8

/**
 * Saída geral (issue 063): registrar uma saída sem abrir o produto antes, pela
 * Home ou por Movimentações. É o passo 1 da entrada geral (issue 042, Inventar
 * e Mobile App For Inventory, Behance) com outra pergunta; escolhido o produto,
 * abre a saída que já existe (`/estoque/[id]/baixa`), com o lote que vence
 * primeiro já marcado.
 */
export default async function SaidaGeralPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>
}) {
  const term = (await searchParams).busca?.trim()

  let results = null
  if (term) {
    const { data } = await getProducts({ search: term, perPage: MAX_RESULTS })
    // Código exato (o que o leitor manda) abre a saída do produto sem passar pela lista
    const exact = data.find((p) => p.barcode === term || p.sku.toLowerCase() === term.toLowerCase())
    if (exact) redirect(`/estoque/${exact.id}/baixa`)
    results = data
  }

  return (
    <div>
      <PageHeader
        title="Registrar saída"
        description="Venda, avaria, roubo, vencimento ou consumo interno: primeiro o produto, depois o lote e a quantidade."
        back={{ href: "/estoque/movimentacoes", label: "Voltar às movimentações" }}
      />
      <div className="max-w-3xl">
        <EntrySearch term={term} results={results} mode="exit" />
      </div>
    </div>
  )
}
