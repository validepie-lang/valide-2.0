import { PageHeader } from "@/components/layout/page-header"
import { NoPermission } from "@/components/ui/no-permission"
import { FolderManager } from "@/components/products/folder-manager"
import { getFolders, getProducts } from "@/lib/services/products"
import { NO_FOLDER } from "@/lib/utils/no-folder"
import { getDashboard } from "@/lib/services/dashboard"
import { getSession } from "@/lib/services/session"
import { demoRole } from "@/lib/utils/permissions"
import { listFolders, parseFolderSort, type FolderQuery } from "@/lib/utils/folder-list"

export const metadata = { title: "Pastas" }

/**
 * Pastas de classificação (issue 039), a partir da tela "Category" do Ventor
 * (Behance). Referências em docs/04-issues/039-pastas.md e 076-pastas.md.
 *
 * "Vencidos e a vencer" por pasta vem do `byFolder` do GET /dashboard, o mesmo
 * número do painel: nenhum endpoint novo. Pasta sem risco não está no
 * `byFolder`, e conta zero.
 *
 * Desde a issue 076 a lista se busca, ordena e pagina aqui (`busca`, `ordem`,
 * `pagina`), como no Estoque. `GET /folders` devolve todas: são poucas.
 */
export default async function PastasPage({ searchParams }: { searchParams: Promise<FolderQuery> }) {
  const [folders, dashboard, { user }, query, unfiled, unfiledAtRisk] = await Promise.all([
    getFolders(),
    getDashboard(),
    getSession(),
    searchParams,
    // "Sem pasta" (issue 068): o total vem do mesmo filtro que o estoque usa
    getProducts({ folderId: NO_FOLDER, perPage: 1 }),
    getProducts({ folderId: NO_FOLDER, status: ["expired", "soon"], perPage: 1 }),
  ])

  if (demoRole(query.cargo, user.role) !== "admin") {
    return (
      <div>
        <PageHeader title="Pastas" back={{ href: "/estoque", label: "Voltar ao estoque" }} />
        <NoPermission what="Gerenciar as pastas de classificação" />
      </div>
    )
  }

  const risk = new Map(dashboard.byFolder.map((point) => [point.folderId, point.atRiskCount]))
  const rows = folders.map((folder) => ({ ...folder, atRiskCount: risk.get(folder.id) ?? 0 }))
  const sort = parseFolderSort(query.ordem)
  const list = listFolders(rows, { search: query.busca, sort, page: Number(query.pagina ?? 1) })
  const lastPage = list.page * list.perPage >= list.total

  return (
    <FolderManager
      // Outra busca, ordem ou página: a seleção recomeça
      key={`${query.busca ?? ""}|${sort}|${list.page}`}
      rows={list.data}
      folders={folders}
      list={{ total: list.total, page: list.page, perPage: list.perPage, sort }}
      query={query}
      // "Sem pasta" fica no fim da última página, e some na busca
      unfiled={
        !query.busca && lastPage
          ? { productCount: unfiled.meta.total, atRiskCount: unfiledAtRisk.meta.total }
          : undefined
      }
    />
  )
}
