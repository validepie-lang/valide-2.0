"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormFailure, SavedNote, SubmitLabel, focusFirstError } from "@/components/ui/form-status"
import { UnsavedGuard, markSaved } from "@/components/ui/unsaved-guard"
import { COMPANY_FIELD_IDS, CompanyFields, readCompanyDraft } from "@/components/settings/company-fields"
import { saveCompany } from "@/lib/actions/settings"
import { UNREACHABLE } from "@/lib/actions/result"
import { validateCompany, type CompanyDraftErrors } from "@/lib/utils/settings-draft"
import type { Company } from "@/lib/types"

/**
 * Empresa (SPEC 5.6), um formulário em uma coluna com um "Salvar alterações"
 * no fim. Desde a issue 059 grava em `PATCH /companies/current`. A pessoa
 * continua na tela: a confirmação fica ao lado do botão (Primer, Saving), e a
 * página é lida de novo, porque a janela de a vencer muda a contagem do
 * painel inteiro.
 */
export function CompanyForm({ company }: { company: Company }) {
  const router = useRouter()
  const form = useRef<HTMLFormElement>(null)
  const [attempted, setAttempted] = useState(false)
  const [errors, setErrors] = useState<CompanyDraftErrors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (saving || !form.current) return
    const { errors: invalid, input } = validateCompany(readCompanyDraft(form.current))
    setAttempted(true)
    setErrors(invalid)
    setFailure(null)
    setSaved(null)
    if (!input) return focusFirstError(COMPANY_FIELD_IDS, invalid)

    setSaving(true)
    const result = await saveCompany(input).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) return setFailure(result.message)
    setSaved("Dados da empresa salvos.")
    markSaved(form.current)
    router.refresh()
  }

  return (
    <UnsavedGuard>
      <form
        ref={form}
        noValidate
        className="flex max-w-[720px] flex-col gap-5 md:gap-6"
        onChange={(event) => {
          setSaved(null)
          // Depois da primeira tentativa, o erro some assim que o campo fica certo (Primer, Forms)
          if (attempted) setErrors(validateCompany(readCompanyDraft(event.currentTarget)).errors)
        }}
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <CompanyFields company={company} errors={errors} readOnly={saving} />
        {failure ? <FormFailure message={failure} /> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
