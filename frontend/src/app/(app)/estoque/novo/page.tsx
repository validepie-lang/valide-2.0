import { PageHeader } from "@/components/layout/page-header"
import { ProductForm } from "@/components/products/product-form"
import { getFolders } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"
import { folderChoices } from "@/lib/utils/folder-list"

export const metadata = { title: "Adicionar produto" }

export default async function NovoProdutoPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>
}) {
  const [folders, { company }, { codigo }] = await Promise.all([getFolders(), getSession(), searchParams])
  // Só número entra no campo: o endereço pode vir digitado à mão
  const initialBarcode = codigo && /^\d{8,14}$/.test(codigo) ? codigo : undefined

  return (
    <div>
      <PageHeader
        title="Adicionar produto"
        description="Para um item avulso que acabou de chegar. Se for a loja inteira, importar uma planilha é mais rápido."
        back={{ href: "/estoque", label: "Voltar ao estoque" }}
      />
      <ProductForm
        // Pasta desativada não aparece para escolher (issue 076)
        folders={folderChoices(folders)}
        soonThresholdDays={company.soonThresholdDays}
        initialBarcode={initialBarcode}
      />
    </div>
  )
}
