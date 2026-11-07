/**
 * Regras da janela de adicionar e editar pessoa (issue 040).
 *
 * São só o aviso imediato: quem recusa de verdade é o servidor. O `login` é
 * único no banco inteiro (`uk_usuarios_login`), e o front só enxerga a lista
 * da própria farmácia. Ver api-contract.md, v14.
 */

import type { UserRole } from "@/lib/types"

/** Do menor para o maior nível, como em `perfil_acesso` */
export const ROLE_ORDER: readonly UserRole[] = ["clerk", "pharmacist", "admin"]

/** O resumo da tabela "O que cada cargo pode" (business-rules.md seção 5) */
export const ROLE_HINT: Record<UserRole, string> = {
  clerk: "Cadastra produto, informa validade e registra saída. Não descarta nem mexe nas configurações.",
  pharmacist: "O mesmo que o Balconista, mais o descarte por vencimento ou avaria.",
  admin: "Tudo, inclusive importar o catálogo, pastas, pessoas e dados da empresa.",
}

/** A mesma regra da troca de senha em Meu perfil */
export const MIN_PASSWORD = 8

/** Letras sem acento, números, ponto, hífen e sublinhado: o que se digita no login sem erro */
const LOGIN_PATTERN = /^[a-z0-9._-]+$/i

export type UserDraft = { name: string; login: string; password: string; role: UserRole }
export type UserDraftErrors = Partial<Record<keyof UserDraft, string>>

/**
 * Na criação, tudo é obrigatório. Na edição, o usuário de acesso não muda e a
 * senha em branco mantém a atual.
 */
export function validateUserDraft(
  draft: UserDraft,
  { editing, takenLogins }: { editing: boolean; takenLogins: readonly string[] },
): UserDraftErrors {
  const errors: UserDraftErrors = {}
  if (!draft.name.trim()) errors.name = "Escreva o nome da pessoa."

  if (!editing) {
    const login = draft.login.trim()
    if (!login) errors.login = "Escolha o usuário que a pessoa vai digitar para entrar."
    else if (!LOGIN_PATTERN.test(login)) errors.login = "Use letras sem acento, números e ponto. Sem espaço."
    else if (takenLogins.some((taken) => taken.toLowerCase() === login.toLowerCase()))
      errors.login = `O usuário ${login} já existe. Escolha outro.`
  }

  if ((!editing || draft.password) && draft.password.length < MIN_PASSWORD)
    errors.password = editing
      ? `A nova senha precisa de ao menos ${MIN_PASSWORD} caracteres.`
      : `Ao menos ${MIN_PASSWORD} caracteres.`

  return errors
}
