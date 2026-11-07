"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/field"
import { FormFailure, SavedNote, SubmitLabel } from "@/components/ui/form-status"
import { UnsavedGuard, markSaved } from "@/components/ui/unsaved-guard"
import { saveMyName } from "@/lib/actions/settings"
import { UNREACHABLE } from "@/lib/actions/result"

/**
 * O próprio nome, em Meu perfil (issue 059). Grava em `PATCH /users/me` e a
 * pessoa continua na tela: a confirmação fica ao lado do botão (Primer,
 * Saving), e a página é lida de novo para o nome mudar também no alto.
 */
export function ProfileNameForm({ initialName }: { initialName: string }) {
  const router = useRouter()
  const box = useRef<HTMLFormElement>(null)
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (saving) return
    const clean = name.trim().replace(/\s+/g, " ")
    setFailure(null)
    setSaved(null)
    if (!clean) {
      setError("Escreva o seu nome. É o que aparece no histórico.")
      return document.getElementById("perfil-nome")?.focus()
    }
    setSaving(true)
    const result = await saveMyName(clean).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) return setFailure(result.message)
    setName(result.data.name)
    setSaved("Nome salvo.")
    markSaved(box.current)
    router.refresh()
  }

  return (
    <UnsavedGuard>
      <form
        ref={box}
        noValidate
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <Field label="Nome completo" htmlFor="perfil-nome" required error={error ?? undefined}>
          <Input
            id="perfil-nome"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
              setSaved(null)
            }}
            invalid={Boolean(error)}
            aria-describedby={error ? "perfil-nome-mensagem" : undefined}
            readOnly={saving}
            maxLength={120}
            autoComplete="name"
          />
        </Field>
        {failure ? <FormFailure message={failure} className="mt-4" /> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" className="w-full sm:w-auto" aria-busy={saving}>
            <SubmitLabel saving={saving} icon={Save}>
              Salvar alterações
            </SubmitLabel>
          </Button>
          <SavedNote message={saved} />
        </div>
      </form>
    </UnsavedGuard>
  )
}
