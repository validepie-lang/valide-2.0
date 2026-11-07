import { notFound } from "next/navigation"
import { CalendarPlus } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { ExitForm } from "@/components/products/exit-form"
import { RegisteredBanner, UndoneBanner, parseRegistered } from "@/components/products/registered-banner"
import { getProduct } from "@/lib/services/products"
import { getSession } from "@/lib/services/session"
import { demoRole } from "@/lib/utils/permissions"

export const metadata = { title: "Registrar saída" }

export default async function BaixaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    cargo?: string
    registrado?: string
    lote?: string
    qtd?: string
    mov?: string
    desfeito?: string
  }>
}) {
  const [{ id }, query, { user }] = await Promise.all([params, searchParams, getSession()])
  const { cargo } = query
  // "Registrar e fazer outra" (issue 072, item 101): a confirmação fica aqui mesmo
  const registered = parseRegistered(query)
  const product = await getProduct(id)
  if (!product) notFound()

  return (
    <div>
      <PageHeader
        title="Registrar saída"
        description={
          <>
            {product.name} · {/* Código não quebra no hífen: "MED-" e "1040" em linhas separadas não se leem */}
            <span className="whitespace-nowrap">{product.sku}</span>
          </>
        }
        back={{ href: `/estoque/${product.id}`, label: "Voltar ao produto" }}
      />

      {registered ? (
        <RegisteredBanner registered={registered} unit={product.unit} closeHref={`/estoque/${product.id}/baixa`} />
      ) : null}
      {query.desfeito === "saida" ? <UndoneBanner closeHref={`/estoque/${product.id}/baixa`} /> : null}

      {product.lots.length > 0 ? (
        // A chave limpa o formulário depois de cada saída gravada
        <ExitForm key={query.mov ?? "nova"} product={product} role={demoRole(cargo, user.role)} />
      ) : (
        <Card className="mx-auto max-w-2xl">
          <EmptyState
            icon={CalendarPlus}
            title="Este produto ainda não tem lote cadastrado"
            description="A saída sai sempre de um lote, para o sistema saber qual validade deixou o estoque. Informe o lote e a data primeiro."
            action={
              <>
                <LinkButton href={`/estoque/validades-pendentes?produto=${product.id}`}>
                  Informar validade
                </LinkButton>
                <LinkButton href={`/estoque/${product.id}`} variant="secondary">
                  Voltar ao produto
                </LinkButton>
              </>
            }
          />
        </Card>
      )}
    </div>
  )
}
