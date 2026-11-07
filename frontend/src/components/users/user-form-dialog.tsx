"use client"

import { useState } from "react"
import { Lock, LockOpen, Save, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { Field, Input, Select } from "@/components/ui/field"
import { FormFailure, SubmitLabel, focusFirstError } from "@/components/ui/form-status"
import { UserLoginField, UserPasswordField } from "@/components/users/user-credential-fields"
import { ROLE_LABEL, type User, type UserRole } from "@/lib/types"
import {
  ROLE_HINT,
  ROLE_ORDER,
  validateUserDraft,
  type UserDraft,
  type UserDraftErrors,
} from "@/lib/utils/user-draft"

/**
 * Adicionar e editar pessoa (issue 040), na janela do "Add Company" do Ventor
 * (Behance): campos em duas colunas, cargo em seleção, ações embaixo.
 *
 * Na edição o usuário de acesso fica só para leitura (o PATCH /users/:id não o
 * muda) e a senha é opcional: é o caminho de quem esqueceu a senha.
 *
 * Desde a issue 058 grava: `onSave` envia e devolve a recusa, se houver.
 * Usuário repetido (`409 LOGIN_TAKEN`) vai para o campo; o resto, acima dos
 * botões, com o que foi digitado mantido.
 */

export type SaveOutcome = { ok: true } | { ok: false; message: string; code: string | null }

const FIELD_IDS = {
  name: "pessoa-nome",
  login: "pessoa-login",
  password: "pessoa-senha",
  role: "pessoa-cargo",
}
export function UserFormDialog({
  open,
  user,
  isSelf,
  takenLogins,
  onClose,
  onSave,
  onToggleAccess,
}: {
  open: boolean
  /** ausente: adicionar */
  user?: User
  isSelf: boolean
  takenLogins: string[]
  onClose: () => void
  onSave: (draft: UserDraft) => Promise<SaveOutcome>
  onToggleAccess: (user: User) => void
}) {
  const [errors, setErrors] = useState<UserDraftErrors>({})
  const [role, setRole] = useState<UserRole>(user?.role ?? "clerk")
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const editing = Boolean(user)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const data = new FormData(event.currentTarget)
    const draft: UserDraft = {
      name: String(data.get("name") ?? "").trim(),
      login: user?.login ?? String(data.get("login") ?? "").trim(),
      password: String(data.get("password") ?? ""),
      role,
    }
    const next = validateUserDraft(draft, { editing, takenLogins })
    setErrors(next)
    setFailure(null)
    if (Object.keys(next).length > 0) return focusFirstError(FIELD_IDS, next)

    setSaving(true)
    const result = await onSave(draft)
    setSaving(false)
    if (result.ok) return
    if (result.code === "LOGIN_TAKEN") {
      setErrors({ login: result.message })
      document.getElementById(FIELD_IDS.login)?.focus()
    } else {
      setFailure(result.message)
    }
  }

  const clear = (key: keyof UserDraft) => () => setErrors((e) => ({ ...e, [key]: undefined }))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="max-w-xl"
      title={editing ? `Editar ${user?.name}` : "Adicionar pessoa"}
      description={
        isSelf
          ? "Seus dados de acesso."
          : editing
            ? "O que a pessoa já registrou continua no histórico com o nome dela."
            : "Ela entra com o usuário e a senha que você definir aqui. Passe os dois para ela."
      }
    >
      <form onSubmit={(event) => void submit(event)} noValidate className="mt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="pessoa-nome" error={errors.name} className="sm:col-span-2">
            <Input
              id="pessoa-nome"
              name="name"
              defaultValue={user?.name}
              invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "pessoa-nome-mensagem" : undefined}
              readOnly={saving}
              maxLength={120}
              autoComplete="off"
              onChange={clear("name")}
              data-autofocus
            />
          </Field>

          <UserLoginField
            login={user?.login}
            error={errors.login}
            readOnly={saving}
            onChange={clear("login")}
          />

          <UserPasswordField
            isSelf={isSelf}
            editing={editing}
            error={errors.password}
            readOnly={saving}
            onChange={clear("password")}
          />

          <Field
            label="Cargo"
            htmlFor="pessoa-cargo"
            hint={isSelf ? "Você não pode mudar o próprio cargo." : ROLE_HINT[role]}
            className="sm:col-span-2"
          >
            <Select
              id="pessoa-cargo"
              value={role}
              disabled={isSelf || saving}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {ROLE_ORDER.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {failure ? <FormFailure message={failure} className="mt-5" /> : null}
        <DialogActions>
          {/* Bloquear fica à esquerda, longe de "Salvar", e nunca para a própria pessoa */}
          {user && !isSelf ? (
            <Button variant="ghost" className="sm:mr-auto" onClick={() => onToggleAccess(user)}>
              {user.active ? (
                <Lock className="size-4" aria-hidden />
              ) : (
                <LockOpen className="size-4" aria-hidden />
              )}
              {user.active ? "Bloquear acesso" : "Liberar acesso"}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" aria-busy={saving}>
            <SubmitLabel saving={saving} icon={editing ? Save : UserPlus}>
              {editing ? "Salvar alterações" : "Adicionar pessoa"}
            </SubmitLabel>
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
