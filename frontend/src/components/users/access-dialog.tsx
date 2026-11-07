"use client"

import { Lock, LockOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import type { User } from "@/lib/types"

/**
 * Confirmação de bloquear ou liberar o acesso (issue 040). Bloquear não apaga:
 * a regra do banco (`usuarios.ativo`) guarda a pessoa para o histórico.
 * Botão neutro, com o texto nomeando a ação (button.tsx). Desde a issue 058
 * grava (`PATCH /users/:id` com `active`); recusado, a mensagem fica aqui.
 */
export function AccessDialog({
  user,
  saving,
  failure,
  onClose,
  onConfirm,
}: {
  user: User | null
  saving: boolean
  failure: string | null
  onClose: () => void
  onConfirm: (user: User) => void
}) {
  const blocking = user?.active ?? true
  return (
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      title={
        blocking ? `Bloquear o acesso de ${user?.name ?? ""}?` : `Liberar o acesso de ${user?.name ?? ""}?`
      }
      description={
        blocking
          ? "A pessoa não consegue mais entrar. O que ela registrou continua no histórico com o nome dela, e dá para liberar de novo depois."
          : "A pessoa volta a entrar com o mesmo usuário e a senha que tinha."
      }
    >
      {failure ? <FormFailure message={failure} className="mt-5" /> : null}
      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        {user ? (
          <Button onClick={() => onConfirm(user)} aria-busy={saving}>
            <SubmitLabel
              saving={saving}
              icon={blocking ? Lock : LockOpen}
              savingLabel={blocking ? "Bloqueando…" : "Liberando…"}
            >
              {blocking ? "Bloquear acesso" : "Liberar acesso"}
            </SubmitLabel>
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
