"use client"

import { useRef, useState } from "react"
import { KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { FormFailure, SavedNote, SubmitLabel, focusFirstError } from "@/components/ui/form-status"
import { UnsavedGuard, markSaved } from "@/components/ui/unsaved-guard"
import { changePassword } from "@/lib/actions/settings"
import { UNREACHABLE } from "@/lib/actions/result"
import { validatePasswordChange, type PasswordDraft, type PasswordErrors } from "@/lib/utils/settings-draft"

const EMPTY: PasswordDraft = { current: "", next: "", repeat: "" }
const IDS = { current: "senha-atual", next: "senha-nova", repeat: "senha-repete" }
const LABEL: Record<keyof PasswordDraft, string> = {
  current: "Senha atual",
  next: "Nova senha",
  repeat: "Repita a nova senha",
}

/**
 * Trocar a própria senha (issue 059), em `POST /auth/password` (ponto aberto
 * 10). Senha atual errada (`422 WRONG_PASSWORD`) vai para o campo dela.
 * Trocou, os três campos esvaziam: senha não fica à vista depois de usada.
 */
export function PasswordForm() {
  const box = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState(EMPTY)
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (saving) return
    const invalid = validatePasswordChange(draft)
    setErrors(invalid)
    setFailure(null)
    setSaved(null)
    if (Object.keys(invalid).length > 0) return focusFirstError(IDS, invalid)

    setSaving(true)
    const result = await changePassword({ currentPassword: draft.current, newPassword: draft.next }).catch(
      () => UNREACHABLE,
    )
    setSaving(false)
    if (!result.ok) {
      if (result.code === "WRONG_PASSWORD") {
        setErrors({ current: result.message })
        document.getElementById(IDS.current)?.focus()
      } else {
        setFailure(result.message)
      }
      return
    }
    setDraft(EMPTY)
    setSaved("Senha trocada. Use a nova na próxima vez que entrar.")
    markSaved(box.current)
  }

  return (
    <UnsavedGuard>
      <form
        ref={box}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <div className="flex max-w-sm flex-col gap-4">
          {(Object.keys(IDS) as (keyof PasswordDraft)[]).map((key) => (
            <Field key={key} label={LABEL[key]} htmlFor={IDS[key]} error={errors[key]}>
              <PasswordInput
                id={IDS[key]}
                value={draft[key]}
                onChange={(e) => {
                  setDraft((current) => ({ ...current, [key]: e.target.value }))
                  setErrors((current) => ({ ...current, [key]: undefined }))
                  setSaved(null)
                }}
                invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `${IDS[key]}-mensagem` : undefined}
                readOnly={saving}
                autoComplete={key === "current" ? "current-password" : "new-password"}
              />
            </Field>
          ))}
        </div>
        {failure ? <FormFailure message={failure} className="mt-4" /> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto" aria-busy={saving}>
            <SubmitLabel saving={saving} icon={KeyRound}>
              Trocar senha
            </SubmitLabel>
          </Button>
          <SavedNote message={saved} />
        </div>
      </form>
    </UnsavedGuard>
  )
}
