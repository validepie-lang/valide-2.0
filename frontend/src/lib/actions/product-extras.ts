"use server"

import { createProductNote, removeProductPhoto, uploadProductPhoto } from "@/lib/services/product-extras"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import type { ProductNote } from "@/lib/types"

/**
 * Pontes do detalhe do produto para o servidor (issue 070). Não guardam nada:
 * repassam para as rotas de nota e de foto do contrato v26.
 */
export async function addNote(productId: string, text: string): Promise<ActionResult<ProductNote>> {
  try {
    return { ok: true, data: await createProductNote(productId, text) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

/** A foto chega como FormData, no campo `foto` */
export async function sendPhoto(
  productId: string,
  form: FormData,
): Promise<ActionResult<{ photoUrl: string | null }>> {
  const file = form.get("foto")
  if (!(file instanceof File)) return { ok: false, message: "Escolha a foto do produto.", code: null }
  try {
    return { ok: true, data: await uploadProductPhoto(productId, file) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

export async function deletePhoto(productId: string): Promise<ActionResult<null>> {
  try {
    await removeProductPhoto(productId)
    return { ok: true, data: null }
  } catch (cause) {
    return actionFailure(cause)
  }
}
