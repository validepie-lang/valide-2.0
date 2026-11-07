import { apiPatch, apiPost } from "@/lib/api/client"
import { isLive } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { CURRENT_USER, TEAM } from "@/lib/mocks/session"
import type { User, UserRole } from "@/lib/types"

/**
 * Adicionar, editar e bloquear pessoa (B24, usuários; recusas na v14,
 * proposta). A leitura (`getUsers`) continua em `session.ts`.
 *
 * Sem a área ligada, confere o que o servidor conferiria (usuário repetido,
 * mudar o próprio cargo, bloquear a si mesmo) e responde como ele, mas não
 * guarda. A senha só passa adiante: o front nunca a guarda nem a mostra.
 */

export type NewUserInput = { name: string; login: string; password: string; role: UserRole }
export type UserPatch = { name?: string; role?: UserRole; active?: boolean; password?: string }

function findUser(id: string): User {
  const user = TEAM.find((u) => u.id === id)
  if (!user) {
    throw new ApiError(
      "notFound",
      404,
      "Esta pessoa não está mais na lista. Recarregue a página.",
      "USER_NOT_FOUND",
    )
  }
  return user
}

/** POST /users */
export async function createUser(input: NewUserInput): Promise<User> {
  if (isLive("auth")) return apiPost<User>("/users", input)
  if (TEAM.some((u) => u.login.toLowerCase() === input.login.toLowerCase())) {
    throw new ApiError("conflict", 409, `O usuário ${input.login} já existe. Escolha outro.`, "LOGIN_TAKEN")
  }
  return {
    id: `pessoa-simulada-${Date.now()}`,
    name: input.name,
    login: input.login,
    role: input.role,
    active: true,
    avatarUrl: null,
  }
}

/** PATCH /users/:id: ninguém muda o próprio cargo nem se bloqueia (403) */
export async function updateUser(id: string, patch: UserPatch): Promise<User> {
  if (isLive("auth")) return apiPatch<User>(`/users/${encodeURIComponent(id)}`, patch)
  // Pessoa adicionada nesta sessão do simulado: não está na lista de demonstração
  const user: User = id.startsWith("pessoa-simulada-")
    ? { id, name: patch.name ?? "", login: "", role: patch.role ?? "clerk", active: true, avatarUrl: null }
    : findUser(id)
  if (id === CURRENT_USER.id && ((patch.role && patch.role !== user.role) || patch.active === false)) {
    throw new ApiError(
      "forbidden",
      403,
      "Você não pode mudar o próprio cargo nem bloquear o próprio acesso. Peça a outro administrador.",
      "FORBIDDEN",
    )
  }
  // A senha não volta na resposta
  return {
    ...user,
    name: patch.name ?? user.name,
    role: patch.role ?? user.role,
    active: patch.active ?? user.active,
  }
}
