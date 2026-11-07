"use client"

import { useState } from "react"
import { Lock, UserPlus } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { AccessDialog } from "@/components/users/access-dialog"
import { UserFormDialog, type SaveOutcome } from "@/components/users/user-form-dialog"
import { addUser, saveUser } from "@/lib/actions/users"
import { UNREACHABLE } from "@/lib/actions/result"
import type { UserDraft } from "@/lib/utils/user-draft"
import { cn } from "@/lib/utils/cn"
import { ROLE_LABEL, type User } from "@/lib/types"

type Open = { kind: "form"; user?: User } | { kind: "access"; user: User } | null

const people = (n: number) => `${n} ${n === 1 ? "pessoa" : "pessoas"}`

/**
 * "Quem tem acesso" (issue 040), com "Adicionar pessoa" e "Editar" de verdade,
 * como no User Page (Behance): a ação de criar no alto, o editar em cada linha.
 *
 * Desde a issue 058 grava (POST /users e PATCH /users/:id). A lista muda com
 * a resposta do servidor, e o leitor de tela ouve o que mudou: a confirmação é
 * a própria lista (Primer, Saving).
 */
export function UserManager({ initial, meId }: { initial: User[]; meId: string }) {
  const [users, setUsers] = useState(initial)
  const [open, setOpen] = useState<Open>(null)
  // Uma janela nova a cada abertura, para o formulário começar limpo
  const [session, setSession] = useState(0)
  const [announce, setAnnounce] = useState("")
  // Bloquear e liberar: a janela de confirmação mostra o andamento e a recusa
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const activeCount = users.filter((u) => u.active).length
  const blockedCount = users.length - activeCount
  const formUser = open?.kind === "form" ? open.user : undefined

  function openForm(user?: User) {
    setSession((s) => s + 1)
    setOpen({ kind: "form", user })
  }

  async function save(draft: UserDraft): Promise<SaveOutcome> {
    if (formUser) {
      const isSelf = formUser.id === meId
      // Só o que pode mudar: o próprio cargo nunca vai, e senha só se foi digitada
      const result = await saveUser(formUser.id, {
        name: draft.name,
        ...(isSelf ? {} : { role: draft.role }),
        ...(draft.password ? { password: draft.password } : {}),
      }).catch(() => UNREACHABLE)
      if (!result.ok) return result
      setUsers((all) =>
        all.map((u) =>
          u.id === formUser.id ? { ...u, name: draft.name, role: isSelf ? u.role : draft.role } : u,
        ),
      )
      setAnnounce(`Alterações de ${draft.name} salvas.`)
    } else {
      const result = await addUser(draft).catch(() => UNREACHABLE)
      if (!result.ok) return result
      setUsers((all) => [...all, result.data])
      setAnnounce(`${draft.name} entrou na lista com o cargo ${ROLE_LABEL[draft.role]}.`)
    }
    setOpen(null)
    return { ok: true }
  }

  async function toggleAccess(user: User) {
    if (saving) return
    setSaving(true)
    setFailure(null)
    const result = await saveUser(user.id, { active: !user.active }).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) return setFailure(result.message)
    setUsers((all) => all.map((u) => (u.id === user.id ? { ...u, active: !user.active } : u)))
    setAnnounce(user.active ? `Acesso de ${user.name} bloqueado.` : `Acesso de ${user.name} liberado.`)
    setOpen(null)
  }

  return (
    <Card className="p-0 md:p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 p-4 md:px-6 md:pt-6 md:pb-4">
        <div>
          <CardTitle>Quem tem acesso</CardTitle>
          <CardSubtitle>
            {people(activeCount)} com acesso
            {blockedCount > 0 ? `, ${blockedCount} com acesso bloqueado` : ""}.
          </CardSubtitle>
        </div>
        <Button onClick={() => openForm()}>
          <UserPlus className="size-4" aria-hidden />
          Adicionar pessoa
        </Button>
      </div>

      <p role="status" className="sr-only">
        {announce}
      </p>

      <ul className="border-t border-line">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0 md:px-6"
          >
            <Avatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-body font-medium", user.active ? "text-fg" : "text-fg-muted")}>
                {user.name}
                {user.id === meId ? (
                  <span className="ml-2 text-label font-normal text-fg-muted">você</span>
                ) : null}
              </p>
              <p className="truncate text-label text-fg-muted">{user.login}</p>
              {/* No celular o cargo desce para baixo do nome, para o nome caber inteiro */}
              <AccessBadge user={user} className="mt-2 sm:hidden" />
            </div>
            <AccessBadge user={user} className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={() => openForm(user)}
              className="min-h-11 rounded-md px-2 py-1 text-label font-medium text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg md:min-h-0"
            >
              Editar<span className="sr-only"> {user.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <UserFormDialog
        key={session}
        open={open?.kind === "form"}
        user={formUser}
        isSelf={formUser?.id === meId}
        takenLogins={users.map((u) => u.login)}
        onClose={() => setOpen(null)}
        onSave={save}
        onToggleAccess={(user) => {
          setFailure(null)
          setOpen({ kind: "access", user })
        }}
      />
      <AccessDialog
        user={open?.kind === "access" ? open.user : null}
        saving={saving}
        failure={failure}
        onClose={() => setOpen(null)}
        onConfirm={(user) => void toggleAccess(user)}
      />
    </Card>
  )
}

/** Selo neutro: cargo é informação, não destaque. Até 08/10 usava fundo de acento */
function AccessBadge({ user, className }: { user: User; className?: string }) {
  if (!user.active) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1 text-label font-medium whitespace-nowrap text-fg-muted",
          className,
        )}
      >
        <Lock className="size-3.5" aria-hidden />
        Acesso bloqueado
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-pill bg-sunken px-3 py-1 text-label font-medium whitespace-nowrap text-fg",
        className,
      )}
    >
      {ROLE_LABEL[user.role]}
    </span>
  )
}
