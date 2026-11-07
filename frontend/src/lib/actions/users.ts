"use server"

import { createUser, updateUser, type NewUserInput, type UserPatch } from "@/lib/services/users"
import { actionFailure, type ActionResult } from "@/lib/actions/result"
import type { User } from "@/lib/types"

/**
 * Pontes da tela Usuários para o servidor (issue 058). Não gravam nada:
 * repassam para POST /users e PATCH /users/:id. Quem pode e quem não pode é
 * o servidor que decide.
 */
export async function addUser(input: NewUserInput): Promise<ActionResult<User>> {
  try {
    return { ok: true, data: await createUser(input) }
  } catch (cause) {
    return actionFailure(cause)
  }
}

export async function saveUser(id: string, patch: UserPatch): Promise<ActionResult<User>> {
  try {
    return { ok: true, data: await updateUser(id, patch) }
  } catch (cause) {
    return actionFailure(cause)
  }
}
