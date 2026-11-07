"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { focusFirstError } from "@/components/ui/form-status"
import { SIGNUP_COMPANY_IDS, StepCompany } from "@/components/auth/signup-steps"
import { companyIdentityErrors, type CompanyIdentity } from "@/lib/utils/settings-draft"

function read(form: HTMLFormElement): CompanyIdentity {
  const data = new FormData(form)
  const get = (key: keyof CompanyIdentity) => String(data.get(key) ?? "")
  return { cnpj: get("cnpj"), legalName: get("legalName"), tradeName: get("tradeName") }
}

/**
 * Etapa 1 do cadastro da empresa com o "Continuar" conferindo antes de avançar
 * (issue 065): CNPJ pelos dígitos verificadores, razão social e nome fantasia.
 * As mesmas regras e mensagens de Configurações > Empresa. Como nos outros
 * formulários (Primer, Forms): confere ao continuar, depois o erro some assim
 * que o campo fica certo, e o foco vai para o primeiro errado.
 *
 * O cadastro ainda não grava: criar a conta depende do login do backend (B24).
 */
export function SignupCompanyForm() {
  const router = useRouter()
  const [attempted, setAttempted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyIdentity, string>>>({})

  return (
    <form
      noValidate
      onChange={(event) => {
        if (attempted) setErrors(companyIdentityErrors(read(event.currentTarget)))
      }}
      onSubmit={(event) => {
        event.preventDefault()
        const invalid = companyIdentityErrors(read(event.currentTarget))
        setAttempted(true)
        setErrors(invalid)
        if (Object.keys(invalid).length > 0) return focusFirstError(SIGNUP_COMPANY_IDS, invalid)
        router.push("/cadastro-empresa?etapa=2")
      }}
    >
      <StepCompany errors={errors} />
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-6">
        <Link href="/login" className="text-label font-medium text-fg-muted transition-colors hover:text-fg">
          Já tenho conta
        </Link>
        <Button type="submit" size="lg">
          Continuar
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  )
}
