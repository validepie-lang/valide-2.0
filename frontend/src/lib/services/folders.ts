import { apiDelete, apiPatch, apiPost } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { record } from "@/lib/services/demo-store"
import { getFolders } from "@/lib/services/products"
import type { Folder } from "@/lib/types"

/**
 * Criar, renomear, ativar ou desativar e excluir pasta (B28; códigos de erro
 * na v20, ativa e destino ao excluir na v30, propostos). A leitura
 * (`getFolders`) continua em `products.ts`, junto da listagem.
 *
 * Sem a área ligada, confere o que o servidor conferiria e responde como ele;
 * desde a issue 076 a mudança fica no registro da demonstração (cookie).
 */

const same = (a: string, b: string) => a.toLocaleLowerCase("pt-BR") === b.toLocaleLowerCase("pt-BR")
const now = () => new Date().toISOString()

function notFound(): ApiError {
  return new ApiError("notFound", 404, "Esta pasta não existe mais. Recarregue a página.", "FOLDER_NOT_FOUND")
}

async function assertNameFree(name: string, ownId: string | null) {
  const taken = (await getFolders()).find((f) => same(f.name, name) && f.id !== ownId)
  if (taken) {
    throw new ApiError(
      "conflict",
      409,
      `Já existe a pasta ${taken.name}. Escolha outro nome.`,
      "FOLDER_NAME_TAKEN",
    )
  }
}

async function findFolder(id: string): Promise<Folder> {
  const folder = (await getFolders()).find((f) => f.id === id)
  if (!folder) throw notFound()
  return folder
}

/** POST /folders */
export async function createFolder(name: string): Promise<Folder> {
  if (isLive("folders")) return apiPost<Folder>("/folders", { name })
  await assertNameFree(name, null)
  const id = `pasta-simulada-${Date.now()}`
  await record({ t: "folderOp", at: now(), id, op: "create", name })
  return { id, name, productCount: 0, active: true }
}

/** PATCH /folders/:id com `{ name }` */
export async function renameFolder(id: string, name: string): Promise<Folder> {
  if (isLive("folders")) return apiPatch<Folder>(`/folders/${encodeURIComponent(id)}`, { name })
  const folder = await findFolder(id)
  await assertNameFree(name, id)
  await record({ t: "folderOp", at: now(), id, op: "rename", name })
  return { ...folder, name }
}

/** PATCH /folders/:id com `{ active }` (v30): desativada some das escolhas, os produtos ficam */
export async function setFolderActive(id: string, active: boolean): Promise<Folder> {
  if (isLive("folders")) return apiPatch<Folder>(`/folders/${encodeURIComponent(id)}`, { active })
  const folder = await findFolder(id)
  await record({ t: "folderOp", at: now(), id, op: "active", active })
  return { ...folder, active }
}

/**
 * DELETE /folders/:id. Vazia, sai. Com produto, só com destino (v30):
 * `?moveTo=<id>` leva os produtos para outra pasta, `?moveTo=none` os deixa
 * sem pasta; sem `moveTo`, `409 FOLDER_NOT_EMPTY` como na v20.
 *
 * `moveTo`: `undefined` não manda destino; `null` é "sem pasta".
 */
export async function deleteFolder(id: string, moveTo?: string | null): Promise<void> {
  const query = moveTo === undefined ? "" : `?moveTo=${encodeURIComponent(moveTo ?? "none")}`
  if (isLive("folders")) return apiDelete(`/folders/${encodeURIComponent(id)}${query}`)

  const folders = await getFolders()
  const folder = folders.find((f) => f.id === id)
  if (!folder) throw notFound()
  if (folder.productCount > 0 && moveTo === undefined) {
    throw new ApiError(
      "conflict",
      409,
      `A pasta ${folder.name} tem produtos. Escolha para onde eles vão e exclua de novo.`,
      "FOLDER_NOT_EMPTY",
    )
  }
  if (moveTo && (moveTo === id || !folders.some((f) => f.id === moveTo))) {
    throw new ApiError(
      "invalid",
      422,
      "A pasta de destino não existe mais. Escolha outra.",
      "FOLDER_TARGET_INVALID",
    )
  }
  await record({
    t: "folderOp",
    at: now(),
    id,
    op: "delete",
    moveTo: folder.productCount > 0 ? (moveTo ?? null) : null,
  })
}
