import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowDownToLine, CalendarPlus, Pencil } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TabsNav } from "@/components/ui/tabs-nav"
import { PageHeader } from "@/components/layout/page-header"
import { CardHead, ProductOverview } from "@/components/products/product-overview"
import { ProductHistoryTab } from "@/components/products/product-history-tab"
import { ProductNotes } from "@/components/products/product-notes"
import { RegisteredBanner, UndoneBanner, parseRegistered } from "@/components/products/registered-banner"
import { SavedBanner } from "@/components/ui/saved-banner"
import { getProduct } from "@/lib/services/products"
import { getMovements } from "@/lib/services/movements"
import { getProductChanges, getProductNotes } from "@/lib/services/product-extras"
import { getSession } from "@/lib/services/session"
import { formatNumber } from "@/lib/utils/format"
import { canEditProduct, demoRole } from "@/lib/utils/permissions"

/**
 * Detalhe do produto: tem algo a resolver, e em qual lote (SPEC 5.3).
 *
 *   título e ações
 *   situação do lote que vence primeiro                 nível 1
 *   em estoque, custo parado, lotes                     nível 2
 *   lotes                                               nível 2
 *   histórico e ficha                                   nível 3
 *
 * Eram quatro blocos do mesmo peso com ícone em quadrado, o selo Vencido três
 * vezes na tela e uma ficha em card ao lado.
 *
 * Issue 030, a partir do detalhe de produto do Inventar (Behance, 524 curtidas):
 * abas abaixo do título (Visão geral, Histórico); à esquerda a situação e os
 * lotes e, embaixo, a ficha em pares de rótulo e valor; à direita o card
 * "Estoque" com a ação de entrada. Referências em docs/04-issues/030-produto-referencias-behance.md.
 *
 * Issue 070: aba Notas, foto, aviso do estoque útil, alterações do cadastro
 * no Histórico, e "Editar produto" só para Administrador e Farmacêutico.
 */
export default async function ProdutoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    aba?: string
    registrado?: string
    lote?: string
    qtd?: string
    salvo?: string
    cargo?: string
    mov?: string
    desfeito?: string
  }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const { aba } = query
  // Volta da entrada ou da saída gravada (issue 054)
  const registered = parseRegistered(query)
  const tab = aba === "historico" || aba === "notas" ? aba : "geral"
  const [product, { user }, { data: movements }, notes, changes] = await Promise.all([
    getProduct(id),
    getSession(),
    getMovements({ productId: id }),
    getProductNotes(id),
    getProductChanges(id),
  ])
  if (!product) notFound()
  // Item 18 (issue 070, decisão do Marcus): o Balconista vê, não edita
  const canEdit = canEditProduct(demoRole(query.cargo, user.role))
  // O cargo de demonstração acompanha a troca de aba
  const keep = query.cargo ? `cargo=${encodeURIComponent(query.cargo)}` : ""

  const lots = [...product.lots].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
  )
  const tabs = [
    { href: `/estoque/${product.id}${keep ? `?${keep}` : ""}`, label: "Visão geral" },
    {
      href: `/estoque/${product.id}?aba=historico${keep ? `&${keep}` : ""}`,
      label: `Histórico (${formatNumber(movements.length)})`,
    },
    { href: `/estoque/${product.id}?aba=notas${keep ? `&${keep}` : ""}`, label: `Notas (${formatNumber(notes.length)})` },
  ]
  const activeTab = tabs[tab === "historico" ? 1 : tab === "notas" ? 2 : 0].href

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div>
        {registered ? (
          <RegisteredBanner registered={registered} unit={product.unit} closeHref={`/estoque/${product.id}`} />
        ) : null}
        {query.desfeito === "saida" ? <UndoneBanner closeHref={`/estoque/${product.id}`} /> : null}
        {/* Volta da edição gravada (issue 055) */}
        {query.salvo === "produto" ? (
          <SavedBanner closeHref={`/estoque/${product.id}`} className="mb-5">
            Alterações do produto salvas.
          </SavedBanner>
        ) : null}
        {/* Volta do cadastro (issue 071, item 103): abre o produto novo, não a lista */}
        {query.salvo === "novo" ? (
          <SavedBanner closeHref={`/estoque/${product.id}`} className="mb-5">
            Produto cadastrado.{" "}
            <Link href="/estoque/novo" className="font-semibold underline-offset-4 hover:underline">
              Cadastrar outro
            </Link>
          </SavedBanner>
        ) : null}
        <PageHeader
          title={product.name}
          back={{ href: "/estoque", label: "Voltar ao estoque" }}
          description={
            <>
              {product.sku}
              {product.brand ? ` · ${product.brand}` : ""}
              {product.folderId && product.folderName ? (
                <>
                  {" · "}
                  <Link
                    href={`/estoque?pasta=${product.folderId}`}
                    className="underline-offset-4 hover:text-fg hover:underline"
                  >
                    {product.folderName}
                  </Link>
                </>
              ) : null}
            </>
          }
          actions={
            // A ação principal acompanha a situação: sem lote não há saída a
            // registrar, e o que resolve é informar a validade. No celular,
            // uma linha só: a principal larga, editar só com o ícone. A entrada mora
            // no card Estoque, como o "Adjust Stock" do Inventar (issue 030)
            <div className="flex flex-row-reverse gap-2 sm:flex-row">
              {canEdit ? (
                <LinkButton
                  href={`/estoque/${product.id}/editar`}
                  variant="secondary"
                  aria-label="Editar produto"
                  className="px-3 sm:px-4"
                >
                  <Pencil className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Editar produto</span>
                </LinkButton>
              ) : null}
              {lots.length > 0 ? (
                <LinkButton href={`/estoque/${product.id}/baixa`} className="flex-1 sm:flex-none">
                  <ArrowDownToLine className="size-4" aria-hidden />
                  Registrar saída
                </LinkButton>
              ) : (
                <LinkButton
                  href={`/estoque/validades-pendentes?produto=${product.id}`}
                  className="flex-1 sm:flex-none"
                >
                  <CalendarPlus className="size-4" aria-hidden />
                  Informar validade
                </LinkButton>
              )}
            </div>
          }
          className="mb-5"
        />

        <TabsNav items={tabs} active={activeTab} label="Seções do produto" />
      </div>

      {tab === "historico" ? (
        <ProductHistoryTab product={product} movements={movements} changes={changes} />
      ) : tab === "notas" ? (
        <section aria-labelledby="notas">
          <Card className="p-0 md:p-0">
            <CardHead id="notas" title="Notas" />
            <div className="px-5 pt-5 md:px-6">
              <ProductNotes productId={product.id} initial={notes} />
            </div>
          </Card>
        </section>
      ) : (
        <ProductOverview product={product} lots={lots} canEdit={canEdit} />
      )}
    </div>
  )
}
