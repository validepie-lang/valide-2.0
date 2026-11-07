import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { NoPermission } from "@/components/ui/no-permission"
import { ProductForm } from "@/components/products/product-form"
import { getFolders, getProduct } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"
import { canEditProduct, demoRole } from "@/lib/utils/permissions"
import { folderChoices } from "@/lib/utils/folder-list"

export const metadata = { title: "Editar produto" }

/** Edição do cadastro. Referências e escopo em docs/04-issues/026-editar-produto.md */
export default async function EditarProdutoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cargo?: string }>
}) {
  const [{ id }, { cargo }] = await Promise.all([params, searchParams])
  const [product, folders, { company, user }] = await Promise.all([
    getProduct(id),
    getFolders(),
    getSession(),
  ])
  if (!product) notFound()

  // Item 18 (issue 070): só Administrador e Farmacêutico editam. Quem bloqueia de verdade é o servidor (403)
  if (!canEditProduct(demoRole(cargo, user.role))) {
    return (
      <div>
        <PageHeader
          title="Editar produto"
          back={{ href: `/estoque/${product.id}`, label: "Voltar ao produto" }}
        />
        <NoPermission what="Editar o cadastro do produto" who="de administrador ou farmacêutico" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Editar produto"
        description={
          <>
            {product.name} · {/* Código não quebra no hífen */}
            <span className="whitespace-nowrap">{product.sku}</span>
          </>
        }
        back={{ href: `/estoque/${product.id}`, label: "Voltar ao produto" }}
      />
      {/* A pasta desativada em que o produto já está continua escolhida (issue 076) */}
      <ProductForm
        folders={folderChoices(folders, product.folderId)}
        soonThresholdDays={company.soonThresholdDays}
        product={product}
      />
    </div>
  )
}
