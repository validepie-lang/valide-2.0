import Link from "next/link"
import { FolderMinus } from "lucide-react"
import { formatNumber } from "@/lib/utils/format"
import { RiskCell, products, type RowView } from "@/components/products/folder-table"

/**
 * "Sem pasta" na tela Pastas (issue 068, item 69): os produtos que ninguém
 * classificou, com o mesmo link para o estoque filtrado. Não é pasta de
 * verdade, então não tem caixa de marcar, renomear nem excluir; o espaço da
 * caixa fica, para o nome alinhar com as pastas (issue 076).
 */
const NO_CHECK = <span className="size-4 shrink-0" aria-hidden />
export function UnfiledTableRow({ row }: { row: RowView }) {
  return (
    <tr className="border-t border-line">
      <td className="py-2.5 pr-3 pl-6">
        <div className="flex items-center gap-3">
          {NO_CHECK}
          <Link
            href={`/estoque?pasta=${row.param}`}
            className="flex w-fit items-center gap-3 text-body font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            <FolderMinus className="size-5 shrink-0" aria-hidden />
            {row.name}
          </Link>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right text-body text-fg tnum">{formatNumber(row.productCount)}</td>
      <td className="px-3 py-2.5 text-right text-body">
        <RiskCell folder={row} />
      </td>
      <td aria-hidden className="py-2.5 pr-6 pl-3" />
    </tr>
  )
}

export function UnfiledListItem({ row }: { row: RowView }) {
  return (
    <li className="flex items-center gap-3 border-t border-line px-4 py-3">
      {NO_CHECK}
      <FolderMinus className="size-5 shrink-0 text-fg-muted" aria-hidden />
      <div className="min-w-0 flex-1">
        <Link
          href={`/estoque?pasta=${row.param}`}
          className="text-body font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {row.name}
        </Link>
        <p className="mt-0.5 text-label text-fg-muted tnum">
          {products(row.productCount)}
          {row.atRiskCount > 0 ? `, ${formatNumber(row.atRiskCount)} vencidos e a vencer` : ""}
        </p>
      </div>
    </li>
  )
}
