import Link from "next/link"
import { FileSpreadsheet, PackageSearch } from "lucide-react"

/**
 * Estado vazio de estoque zerado.
 *
 * A ação primária é importar, não cadastrar: cadastrar centenas de produtos à
 * mão é o motivo número um de abandono na primeira semana.
 * Ver docs/01-references/import-strategy.md.
 */
export function EmptyStockState() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl text-center">
        <PackageSearch className="mx-auto size-8 text-fg-muted" strokeWidth={1.5} aria-hidden />
        <h3 className="mt-4 text-section font-semibold text-fg">Comece trazendo seus produtos</h3>
        <p className="mx-auto mt-2 max-w-md text-body text-fg-muted">
          Você não precisa digitar produto por produto. Traga a lista que já existe no sistema da sua loja.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <Link
          href="/estoque/importar"
          className="flex gap-4 rounded-md border-2 border-primary bg-surface p-5 text-left transition-colors hover:bg-primary-soft"
        >
          <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden />
          <span className="min-w-0">
            <span className="block text-body font-semibold text-fg">Enviar uma planilha</span>
            <span className="mt-1 block text-label text-fg-muted">
              Exporte a lista de produtos do sistema que você já usa e envie aqui, em CSV ou Excel. É o
              caminho mais rápido para sair do zero.
            </span>
          </span>
        </Link>
      </div>

      <p className="mt-5 text-center text-label text-fg-muted">
        Prefere começar devagar?{" "}
        <Link href="/estoque/novo" className="font-medium text-primary hover:underline">
          Cadastrar um produto manualmente
        </Link>
      </p>
    </div>
  )
}
