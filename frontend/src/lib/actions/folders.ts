"use server"

import { createFolder, deleteFolder, renameFolder, setFolderActive } from "@/lib/services/folders"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import type { Folder } from "@/lib/types"

/**
 * Pontes da tela Pastas para o servidor (issues 057 e 076). Não gravam nada:
 * repassam para POST, PATCH e DELETE /folders.
 */
export async function addFolder(name: string): Promise<ActionResult<Folder>> {
  try {
    return { ok: true, data: await createFolder(name) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

export async function saveFolderName(id: string, name: string): Promise<ActionResult<Folder>> {
  try {
    return { ok: true, data: await renameFolder(id, name) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/** Desativar e ativar (item 65) */
export async function toggleFolder(id: string, active: boolean): Promise<ActionResult<Folder>> {
  try {
    return { ok: true, data: await setFolderActive(id, active) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/** `moveTo` só para pasta com produtos (item 110): outra pasta, ou null para deixá-los sem pasta */
export async function removeFolder(id: string, moveTo?: string | null): Promise<ActionResult<null>> {
  try {
    await deleteFolder(id, moveTo)
    return { ok: true, data: null }
  } catch (cause) {
    return actionFailure(cause)
  }
}
