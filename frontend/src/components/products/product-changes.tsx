import { History } from "lucide-react"
import { describeChange } from "@/lib/utils/product-extras"
import { formatEventTime } from "@/lib/utils/format"
import type { ProductChange, ProductUnit } from "@/lib/types"

/**
 * "Alterações do cadastro" (issue 070, item 15), na aba Histórico, embaixo
 * das movimentações: quem mudou o quê, com o valor de antes e o de depois,
 * como o registro de alterações do Inventar (Behance).
 */
export function ProductChanges({ changes, unit }: { changes: ProductChange[]; unit: ProductUnit }) {
  if (changes.length === 0) {
    return <p className="px-5 py-4 text-body text-fg-muted md:px-6">Nenhuma alteração no cadastro ainda.</p>
  }
  return (
    <ul className="divide-y divide-line">
      {changes.map((change) => {
        const { who, what } = describeChange(change, unit)
        return (
          <li key={change.id} className="flex items-start gap-3 px-5 py-3.5 md:px-6">
            <History className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
            <p className="min-w-0 text-body text-fg">
              <span className="font-semibold">{who}</span> {what}
              <span className="block text-label text-fg-muted">{formatEventTime(change.at)}</span>
            </p>
          </li>
        )
      })}
    </ul>
  )
}
