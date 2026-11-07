"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FolderPlus } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FormFailure, SavedNote } from "@/components/ui/form-status"
import { PageHeader } from "@/components/layout/page-header"
import { StockPagination } from "@/components/products/stock-pagination"
import { FolderTable, type FolderRow, type Unfiled } from "@/components/products/folder-table"
import { FolderBulkBar, FolderSearch } from "@/components/products/folder-toolbar"
import { FolderBulkDeleteDialog } from "@/components/products/folder-bulk-delete-dialog"
import { FolderDeleteDialog } from "@/components/products/folder-delete-dialog"
import { FolderNameDialog } from "@/components/products/folder-name-dialog"
import { useFolderActions } from "@/components/products/use-folder-actions"
import { pageCheckState } from "@/lib/utils/stock-selection"
import { folderChoices, foldersHref, type FolderQuery, type FolderSort } from "@/lib/utils/folder-list"
import { formatNumber } from "@/lib/utils/format"
import type { Folder } from "@/lib/types"

/**
 * Pastas (issue 039), da tela "Category" e do "Add Company" do Ventor
 * (Behance). Grava desde a 057. Desde a 076: busca, ordem e páginas pelo
 * endereço (a página monta a lista), desativar e ativar, marcar e excluir
 * várias, excluir levando os produtos. Depois de gravar, a página é pedida de
 * novo, e a confirmação fica acima da lista (Primer, Saving).
 */
export function FolderManager({
  rows,
  folders,
  list,
  query,
  unfiled,
}: {
  /** a página da lista, já buscada e ordenada */
  rows: FolderRow[]
  /** todas as pastas, para o nome repetido e o destino ao excluir */
  folders: Folder[]
  list: { total: number; page: number; perPage: number; sort: FolderSort }
  query: FolderQuery
  unfiled?: Unfiled
}) {
  const router = useRouter()
  const [marked, setMarked] = useState<ReadonlySet<string>>(new Set())
  const actions = useFolderActions({
    folders,
    onDone: () => router.refresh(),
    onDeleted: () => setMarked(new Set()),
  })
  const { open, show } = actions

  const pageIds = rows.map((f) => f.id)
  const pageState = pageCheckState(pageIds, marked)
  const markedRows = rows.filter((f) => marked.has(f.id))
  const classified = folders.reduce((sum, f) => sum + f.productCount, 0)
  const inactive = folders.filter((f) => !f.active).length

  function mark(id: string) {
    const next = new Set(marked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setMarked(next)
  }

  return (
    <div>
      <PageHeader
        title="Pastas"
        description="Agrupe os produtos do jeito que a farmácia já pensa. Cada produto fica em uma pasta só."
        back={{ href: "/estoque", label: "Voltar ao estoque" }}
        actions={
          <Button onClick={() => show({ kind: "create" })}>
            <FolderPlus className="size-4" aria-hidden />
            Criar pasta
          </Button>
        }
      />

      <Card className="p-0 md:p-0">
        <div className="flex flex-col gap-4 p-4 md:px-6 md:pt-6 md:pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Suas pastas</CardTitle>
            <CardSubtitle>
              {formatNumber(folders.length)} {folders.length === 1 ? "pasta" : "pastas"}
              {inactive > 0
                ? ` (${formatNumber(inactive)} ${inactive === 1 ? "desativada" : "desativadas"})`
                : ""}
              , {formatNumber(classified)} produtos classificados. Produto sem pasta também aparece no
              estoque.
            </CardSubtitle>
          </div>
          {folders.length > 0 ? <FolderSearch query={query} /> : null}
        </div>

        <SavedNote message={actions.notice} className={actions.notice ? "px-4 pb-3 md:px-6" : "sr-only"} />
        {actions.rowFailure ? (
          <FormFailure message={actions.rowFailure} after="Nada mudou." className="mx-4 mb-3 md:mx-6" />
        ) : null}

        {marked.size > 0 ? (
          <FolderBulkBar
            count={marked.size}
            onDelete={() => show({ kind: "bulk" })}
            onClear={() => setMarked(new Set())}
          />
        ) : null}

        <div className="border-t border-line">
          {rows.length > 0 ? (
            <FolderTable
              folders={rows}
              unfiled={unfiled}
              sort={list.sort}
              sortHref={(sort) => foldersHref(query, { ordem: sort })}
              marked={marked}
              pageState={pageState}
              onMark={mark}
              onMarkPage={() => setMarked(pageState === "all" ? new Set() : new Set(pageIds))}
              busyId={actions.busyId}
              onRename={(folder) => show({ kind: "rename", folder }, folder.name)}
              onToggle={(folder) => void actions.toggle(folder)}
              onDelete={(folder) => show({ kind: "delete", folder })}
            />
          ) : query.busca ? (
            <EmptyState
              icon={FolderPlus}
              title={`Nenhuma pasta com “${query.busca}”`}
              description="Confira o nome ou crie a pasta."
              action={
                <LinkButton href={foldersHref(query, { busca: undefined })} variant="secondary">
                  Limpar busca
                </LinkButton>
              }
            />
          ) : (
            <EmptyState
              icon={FolderPlus}
              title="Nenhuma pasta criada ainda"
              description="Pastas ajudam a achar produto rápido e a ver onde está o risco. Comece com as categorias que a equipe já usa no balcão."
              action={<Button onClick={() => show({ kind: "create" })}>Criar pasta</Button>}
            />
          )}
        </div>

        {list.total > list.perPage ? (
          <StockPagination
            page={list.page}
            perPage={list.perPage}
            total={list.total}
            hrefFor={(n) => foldersHref(query, { pagina: String(n) })}
            noun={["pasta", "pastas"]}
            label="Páginas das pastas"
          />
        ) : null}
      </Card>

      <FolderNameDialog
        open={open?.kind === "create" || open?.kind === "rename"}
        renaming={open?.kind === "rename" ? open.folder : null}
        name={actions.name}
        error={actions.error}
        saving={actions.saving}
        failure={actions.failure}
        onName={actions.typeName}
        onSubmit={() => void actions.save()}
        onClose={() => show(null)}
      />

      <FolderDeleteDialog
        folder={open?.kind === "delete" ? open.folder : null}
        destinations={folderChoices(folders)}
        saving={actions.saving}
        failure={actions.failure}
        onClose={() => show(null)}
        onConfirm={(folder, moveTo) => void actions.remove(folder, moveTo)}
      />

      <FolderBulkDeleteDialog
        open={open?.kind === "bulk"}
        marked={markedRows}
        saving={actions.saving}
        failure={actions.failure}
        onClose={() => show(null)}
        onConfirm={(empty) => void actions.removeMany(empty)}
      />
    </div>
  )
}
