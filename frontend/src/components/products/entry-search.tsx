import Link from "next/link"
import { ChevronRight, PackageSearch, ScanBarcode } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusChip } from "@/components/ui/status-chip"
import { CameraScan } from "@/components/products/camera-scan"
import { ScanSearchForm, ScanSignal, ScanSoundToggle } from "@/components/products/scan-signal"
import { formatQuantity } from "@/lib/utils/format"
import type { Product } from "@/lib/types"

/**
 * Passo 1 da entrada geral (issue 042): "Qual produto chegou?".
 *
 * Um campo só, como a busca com "Scan" do Inventar e a tela "Search" do Mobile
 * App For Inventory (Behance). O leitor do caixa funciona como teclado: bipou,
 * o código entra e o Enter envia. Código exato abre o produto direto (a página
 * redireciona); o resto vira uma lista curta.
 *
 * Issue 074: na entrada, nome com um resultado só também abre direto, e a
 * leitura bipa (achou, um agudo; não achou, dois graves), com "Bip ao ler" para
 * desligar neste aparelho.
 */
/** Só números, de 8 a 14: o tamanho dos códigos EAN-8, UPC, EAN-13 e GTIN-14 */
const BARCODE = /^\d{8,14}$/

/** Entrada ou saída geral: a mesma busca, com a pergunta e o destino de cada uma (issue 063) */
const MODE = {
  entry: {
    path: "/estoque/entrada",
    title: "Qual produto chegou?",
    subtitle:
      "Bipe o código de barras da caixa ou escreva o nome. Com o leitor do caixa, o produto abre sozinho.",
    pick: "Escolha o que chegou.",
    empty:
      "Confira o número impresso embaixo do código de barras, ou busque pelo nome. Se o produto chegou pela primeira vez, cadastre antes.",
    href: (id: string) => `/estoque/entrada?produto=${id}`,
  },
  exit: {
    path: "/estoque/saida",
    title: "Qual produto está saindo?",
    subtitle:
      "Bipe o código de barras ou escreva o nome. Com o leitor do caixa, a saída do produto abre sozinha.",
    pick: "Escolha o que está saindo.",
    empty:
      "Confira o número impresso embaixo do código de barras, ou busque pelo nome. Só sai do estoque o que está cadastrado nele.",
    href: (id: string) => `/estoque/${id}/baixa`,
  },
} as const

export function EntrySearch({
  term,
  results,
  mode = "entry",
}: {
  term?: string
  results: Product[] | null
  mode?: keyof typeof MODE
}) {
  const m = MODE[mode]
  return (
    <Card className="p-0 md:p-0">
      <div className="p-4 md:p-6">
        <CardTitle>{m.title}</CardTitle>
        <CardSubtitle>{m.subtitle}</CardSubtitle>

        <ScanSearchForm action={m.path} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="entrada-busca" className="sr-only">
            Código de barras, código interno ou nome do produto
          </label>
          <div className="relative flex-1">
            <ScanBarcode
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-fg-muted"
              aria-hidden
            />
            <input
              id="entrada-busca"
              name="busca"
              type="search"
              defaultValue={term ?? ""}
              placeholder="Código de barras, código interno ou nome"
              autoComplete="off"
              autoFocus
              className="h-12 w-full rounded-pill border border-line bg-surface pr-4 pl-12 text-body text-fg transition-colors placeholder:text-fg-muted hover:border-line-strong"
            />
          </div>
          <Button type="submit" size="lg">
            Buscar produto
          </Button>
          <CameraScan action={m.path} />
        </ScanSearchForm>
        {mode === "entry" ? (
          <div className="mt-2 -ml-2">
            <ScanSoundToggle />
          </div>
        ) : null}
      </div>

      {results === null ? null : results.length > 0 ? (
        <>
          <p className="border-t border-line px-4 pt-4 text-label text-fg-muted md:px-6">
            {results.length === 1 ? "1 produto" : `${results.length} produtos`} para “{term}”. {m.pick}
          </p>
          <ul className="mt-2 border-t border-line">
            {results.map((p) => (
              <li key={p.id} className="border-b border-line last:border-b-0">
                <Link
                  href={m.href(p.id)}
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-primary-soft md:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-fg">{p.name}</p>
                    <p className="mt-0.5 text-label text-fg-muted">
                      <span className="whitespace-nowrap">{p.sku}</span>
                      {p.barcode ? <span className="whitespace-nowrap"> · {p.barcode}</span> : null}
                    </p>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                    <StatusChip status={p.nearestExpiryStatus} size="sm" />
                    <span className="text-label text-fg-muted tnum">
                      {formatQuantity(p.totalQuantity, p.unit)}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-fg-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="border-t border-line">
          {mode === "entry" && term ? <ScanSignal kind="missing" signalKey={term} /> : null}
          <EmptyState
            icon={PackageSearch}
            title={`Nenhum produto para “${term}”`}
            description={m.empty}
            action={
              mode === "entry" ? (
                // Com o número bipado, o cadastro já abre com ele (issue 049, item 82)
                <LinkButton
                  href={term && BARCODE.test(term) ? `/estoque/novo?codigo=${term}` : "/estoque/novo"}
                  variant="secondary"
                >
                  Cadastrar produto
                </LinkButton>
              ) : (
                <LinkButton href="/estoque" variant="secondary">
                  Ver o estoque
                </LinkButton>
              )
            }
          />
        </div>
      )}
    </Card>
  )
}
