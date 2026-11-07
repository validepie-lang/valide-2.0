import { apiDelete, apiGetList, apiPost, apiPostForm } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { mockProductChanges, mockProductNotes } from "@/lib/mocks/product-history"
import { CURRENT_USER } from "@/lib/mocks/session"
import { demoProducts, readJournal, record } from "@/lib/services/demo-store"
import { journalNotes } from "@/lib/utils/demo-journal"
import { noteError, photoFileError } from "@/lib/utils/product-extras"
import type { ProductChange, ProductNote } from "@/lib/types"

/**
 * Notas, alterações e foto do produto (issue 070, contrato v26, proposto).
 * Sem a área ligada, confere o que o servidor conferiria e responde como ele,
 * mas não guarda.
 */

const path = (id: string, rest: string) => `/products/${encodeURIComponent(id)}/${rest}`

async function assertProduct(id: string) {
  if (!(await demoProducts()).some((p) => p.id === id)) {
    throw new ApiError(
      "notFound",
      404,
      "Este produto não existe mais. Volte ao estoque.",
      "PRODUCT_NOT_FOUND",
    )
  }
}

/** GET /products/:id/notes, da mais recente para a mais antiga */
export async function getProductNotes(id: string): Promise<ProductNote[]> {
  if (isLive("products")) return (await apiGetList<ProductNote>(path(id, "notes"))).data
  // As notas gravadas na demonstração vêm antes das de exemplo (issue 071)
  return [...journalNotes(await readJournal(), id, CURRENT_USER.name), ...(mockProductNotes()[id] ?? [])]
}

/** POST /products/:id/notes: qualquer cargo escreve */
export async function createProductNote(id: string, text: string): Promise<ProductNote> {
  if (isLive("products")) return apiPost<ProductNote>(path(id, "notes"), { text })
  const error = noteError(text)
  if (error) throw new ApiError("invalid", 422, error, "NOTE_INVALID")
  await assertProduct(id)
  const note = {
    id: `nota-simulada-${Date.now()}`,
    text: text.trim(),
    userName: CURRENT_USER.name,
    createdAt: new Date().toISOString(),
  }
  await record({ t: "note", at: note.createdAt, id: note.id, productId: id, text: note.text })
  return note
}

/** GET /products/:id/changes, da mais recente para a mais antiga */
export async function getProductChanges(id: string): Promise<ProductChange[]> {
  if (isLive("products")) return (await apiGetList<ProductChange>(path(id, "changes"))).data
  // Produto cadastrado na demonstração (issue 071): o cadastro é a primeira alteração
  const created = (await readJournal()).find((e) => e.t === "product" && e.id === id)
  if (created) {
    return [
      {
        id: `${id}-c-criado`,
        at: created.at,
        userName: CURRENT_USER.name,
        kind: "created",
        source: "manual",
      },
    ]
  }
  return mockProductChanges()[id] ?? []
}

/**
 * POST /products/:id/photo, multipart, campo `foto`. Devolve o endereço da
 * foto guardada; o simulado não guarda e devolve null (a tela mostra a foto
 * escolhida, que já está no navegador).
 */
export async function uploadProductPhoto(id: string, file: File): Promise<{ photoUrl: string | null }> {
  if (isLive("products")) {
    const form = new FormData()
    form.set("foto", file)
    return apiPostForm<{ photoUrl: string }>(path(id, "photo"), form)
  }
  const error = photoFileError(file)
  if (error) throw new ApiError("invalid", 422, error, "PHOTO_NOT_ACCEPTED")
  await assertProduct(id)
  return { photoUrl: null }
}

/** DELETE /products/:id/photo */
export async function removeProductPhoto(id: string): Promise<void> {
  if (isLive("products")) return apiDelete(path(id, "photo"))
  await assertProduct(id)
}
