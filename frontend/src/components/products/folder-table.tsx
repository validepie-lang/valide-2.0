import Link from "next/link"
import { FolderOpen } from "lucide-react"
import { UnfiledListItem, UnfiledTableRow } from "@/components/products/folder-unfiled-row"
import { SortableTh } from "@/components/products/sortable-th"
import {
  FolderCheckbox,
  FolderPageCheckbox,
  FolderRowActions,
  InactiveBadge,
  type RowHandlers,
} from "@/components/products/folder-row-actions"
import { formatNumber } from "@/lib/utils/format"
import { NO_FOLDER_LABEL, NO_FOLDER_PARAM } from "@/lib/utils/no-folder"
import type { FolderSort } from "@/lib/utils/folder-list"
import type { Folder } from "@/lib/types"

export type FolderRow = Folder & { atRiskCount: number }

/** Os produtos sem pasta (issue 068, item 69): uma linha a mais, sem renomear nem excluir */
export type Unfiled = { productCount: number; atRiskCount: number }

export type RowView = { key: string; name: string; param: string; productCount: number; atRiskCount: number }

export function products(n: number): string {
  return `${formatNumber(n)} ${n === 1 ? "produto" : "produtos"}`
}

/** "Vencidos e a vencer" leva ao estoque já filtrado pela pasta e pelas duas situações */
export function RiskCell({ folder }: { folder: RowView }) {
  if (folder.atRiskCount === 0) return <span className="text-fg-muted">Nenhum</span>
  return (
    <Link
      href={`/estoque?pasta=${folder.param}&status=expired,soon`}
      className="font-medium text-fg tnum underline-offset-4 hover:underline"
    >
      {formatNumber(folder.atRiskCount)}
      <span className="sr-only"> vencidos e a vencer em {folder.name}</span>
    </Link>
  )
}

const TH = "px-3 py-3 text-label font-semibold whitespace-nowrap text-fg-muted"

/** Cada coluna alterna entre duas ordens, como no Estoque */
const SORTS = {
  name: [
    { sort: "name_asc", direction: "ascending", hint: "de A a Z" },
    { sort: "name_desc", direction: "descending", hint: "de Z a A" },
  ],
  products: [
    { sort: "products_desc", direction: "descending", hint: "da que tem mais produtos" },
    { sort: "products_asc", direction: "ascending", hint: "da que tem menos produtos" },
  ],
  risk: [
    { sort: "risk_desc", direction: "descending", hint: "da que tem mais vencidos e a vencer" },
    { sort: "risk_asc", direction: "ascending", hint: "da que tem menos vencidos e a vencer" },
  ],
} as const satisfies Record<
  string,
  { sort: FolderSort; direction: "ascending" | "descending"; hint: string }[]
>

type Props = RowHandlers & {
  folders: FolderRow[]
  unfiled?: Unfiled
  sort: FolderSort
  sortHref: (sort: FolderSort) => string
  marked: ReadonlySet<string>
  pageState: "none" | "some" | "all"
  onMark: (id: string) => void
  onMarkPage: () => void
  /** a pasta sendo ativada ou desativada agora */
  busyId: string | null
}

/**
 * A lista de pastas (issues 039 e 076), da tela "Category" do Ventor (Behance):
 * caixa de marcar, nome com o selo "Desativada", os números, a ordem pelo
 * cabeçalho e as ações no fim da linha. Da tela média em diante é tabela; no
 * celular, lista (CLAUDE.md seção 10).
 */
export function FolderTable({
  folders,
  unfiled,
  sort,
  sortHref,
  marked,
  pageState,
  onMark,
  onMarkPage,
  busyId,
  ...handlers
}: Props) {
  // "Sem pasta" por último, só quando há produto sem pasta: é o que falta classificar
  const extra: RowView | null =
    unfiled && unfiled.productCount > 0
      ? { key: NO_FOLDER_PARAM, name: NO_FOLDER_LABEL, param: NO_FOLDER_PARAM, ...unfiled }
      : null
  const view = (folder: FolderRow): RowView => ({ ...folder, key: folder.id, param: folder.id })
  const name = (folder: FolderRow) => (
    <>
      {folder.name}
      {folder.active ? null : <InactiveBadge />}
    </>
  )

  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead className="border-b border-line bg-sunken">
          <tr>
            <SortableTh
              label="Pasta"
              current={sort}
              options={[...SORTS.name]}
              hrefFor={sortHref}
              className="whitespace-nowrap"
              leading={<FolderPageCheckbox state={pageState} onToggle={onMarkPage} />}
            />
            <SortableTh
              label="Produtos"
              current={sort}
              options={[...SORTS.products]}
              hrefFor={sortHref}
              className="text-right whitespace-nowrap"
            />
            <SortableTh
              label="Vencidos e a vencer"
              current={sort}
              options={[...SORTS.risk]}
              hrefFor={sortHref}
              className="text-right whitespace-nowrap"
            />
            <th scope="col" className={`${TH} pr-6 text-right`}>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <tr key={folder.id} className="border-b border-line last:border-b-0">
              <td className="py-2.5 pr-3 pl-6">
                <div className="flex items-center gap-3">
                  <FolderCheckbox folder={folder} checked={marked.has(folder.id)} onToggle={onMark} />
                  <Link
                    href={`/estoque?pasta=${folder.id}`}
                    className="flex w-fit items-center gap-3 text-body font-medium text-fg underline-offset-4 hover:underline"
                  >
                    <FolderOpen className="size-5 shrink-0 text-fg-muted" aria-hidden />
                    {name(folder)}
                  </Link>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right text-body text-fg tnum">
                {formatNumber(folder.productCount)}
              </td>
              <td className="px-3 py-2.5 text-right text-body">
                <RiskCell folder={view(folder)} />
              </td>
              <td className="py-2.5 pr-6 pl-3">
                <FolderRowActions folder={folder} busy={busyId === folder.id} {...handlers} />
              </td>
            </tr>
          ))}
          {extra ? <UnfiledTableRow row={extra} /> : null}
        </tbody>
      </table>

      <ul className="md:hidden">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
          >
            <FolderCheckbox folder={folder} checked={marked.has(folder.id)} onToggle={onMark} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/estoque?pasta=${folder.id}`}
                className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-body font-medium text-fg underline-offset-4 hover:underline"
              >
                {name(folder)}
              </Link>
              <p className="mt-0.5 text-label text-fg-muted tnum">
                {products(folder.productCount)}
                {folder.atRiskCount > 0 ? `, ${formatNumber(folder.atRiskCount)} vencidos e a vencer` : ""}
              </p>
            </div>
            <FolderRowActions folder={folder} busy={busyId === folder.id} {...handlers} />
          </li>
        ))}
        {extra ? <UnfiledListItem row={extra} /> : null}
      </ul>
    </>
  )
}
