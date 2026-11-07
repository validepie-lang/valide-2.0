import { ArrowRight } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { LinkButton } from "@/components/ui/button"
import { WizardProgress } from "@/components/layout/wizard-progress"
import { StepProducts, StepStructure } from "@/components/auth/signup-steps"
import { SignupCompanyForm } from "@/components/auth/signup-company-form"
import { StepAddress } from "@/components/auth/signup-address"

export const metadata = { title: "Cadastrar empresa" }

const STEPS = ["Dados da empresa", "Endereço e contato", "Estrutura e acesso", "Seus produtos"]

export default async function CadastroEmpresaPage({
  searchParams,
}: {
  searchParams: Promise<{ etapa?: string }>
}) {
  const { etapa } = await searchParams
  const step = Math.min(Math.max(Number(etapa) || 1, 1), 4) - 1

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Sem card, direto no fundo, como o login (issue 034) */}
      <Logo />

      <div className="mt-8">
        <WizardProgress steps={STEPS} current={step} className="mb-7" />

        {/* A etapa 1 tem o próprio "Continuar", que confere o CNPJ antes de avançar (issue 065) */}
        {step === 0 ? <SignupCompanyForm /> : null}
        {step === 1 ? <StepAddress /> : null}
        {step === 2 ? <StepStructure /> : null}
        {step === 3 ? <StepProducts /> : null}

        {step > 0 && step < 3 ? (
          <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-6">
            <LinkButton href={`/cadastro-empresa?etapa=${step}`} variant="ghost">
              Voltar
            </LinkButton>
            <LinkButton href={`/cadastro-empresa?etapa=${step + 2}`} size="lg">
              Continuar
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}
