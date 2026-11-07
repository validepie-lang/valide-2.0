import { ReadOnlyRows, SettingsSection } from "@/components/layout/settings-section"
import { CepInput } from "@/components/ui/cep-input"
import { Field, Input, Select } from "@/components/ui/field"
import type { CompanyDraft, CompanyDraftErrors } from "@/lib/utils/settings-draft"
import type { Company } from "@/lib/types"

/** O id de cada campo, na ordem da tela: o primeiro errado recebe o foco */
export const COMPANY_FIELD_IDS: Record<keyof CompanyDraft, string> = {
  cnpj: "emp-cnpj",
  tradeName: "emp-fantasia",
  legalName: "emp-razao",
  stateRegistration: "emp-ie",
  cityRegistration: "emp-im",
  taxRegime: "emp-regime",
  zipCode: "emp-cep",
  street: "emp-rua",
  number: "emp-num",
  district: "emp-bairro",
  city: "emp-cidade",
  phone: "emp-tel",
  email: "emp-email",
  website: "emp-site",
  soonThresholdDays: "janela",
  timezone: "fuso",
}

/** Lê os campos pelo `name`, que é a chave do rascunho */
export function readCompanyDraft(form: HTMLFormElement): CompanyDraft {
  const data = new FormData(form)
  const draft = {} as CompanyDraft
  for (const key of Object.keys(COMPANY_FIELD_IDS) as (keyof CompanyDraft)[]) {
    draft[key] = String(data.get(key) ?? "")
  }
  return draft
}

/**
 * As seções de Empresa (SPEC 5.6), tiradas da página na issue 059, quando o
 * formulário passou a gravar. Campos sem estado: o formulário lê pelo `name`.
 *
 * Campos curtos e ligados entre si dividem a linha (Logradouro e Número,
 * Bairro e Cidade), como no endereço impresso. A largura do campo segue o
 * tamanho da resposta.
 */
export function CompanyFields({
  company,
  errors,
  readOnly,
}: {
  company: Company
  errors: CompanyDraftErrors
  readOnly: boolean
}) {
  const f = (key: keyof CompanyDraft, defaultValue: string) => ({
    id: COMPANY_FIELD_IDS[key],
    name: key,
    defaultValue,
    invalid: Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${COMPANY_FIELD_IDS[key]}-mensagem` : undefined,
    readOnly,
  })
  const select = (key: keyof CompanyDraft, defaultValue: string) => ({
    id: COMPANY_FIELD_IDS[key],
    name: key,
    defaultValue,
  })
  const label = (key: keyof CompanyDraft) => ({ htmlFor: COMPANY_FIELD_IDS[key], error: errors[key] })

  return (
    <>
      <SettingsSection title="Dados cadastrais" description="Aparecem nos relatórios que você exporta.">
        <div className="flex flex-col gap-4">
          <Field label="CNPJ" {...label("cnpj")} required className="sm:max-w-xs">
            <Input {...f("cnpj", company.cnpj)} inputMode="numeric" />
          </Field>
          <Field label="Nome fantasia" {...label("tradeName")} required>
            <Input {...f("tradeName", company.tradeName)} />
          </Field>
          <Field label="Razão social" {...label("legalName")} required>
            <Input {...f("legalName", company.legalName)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inscrição estadual" {...label("stateRegistration")} hint="Opcional">
              <Input {...f("stateRegistration", company.stateRegistration ?? "")} />
            </Field>
            <Field label="Inscrição municipal" {...label("cityRegistration")} hint="Opcional">
              <Input {...f("cityRegistration", company.cityRegistration ?? "")} />
            </Field>
          </div>
          <Field label="Regime tributário" {...label("taxRegime")} className="sm:max-w-xs">
            <Select {...select("taxRegime", company.taxRegime)}>
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
              <option>MEI</option>
            </Select>
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection title="Endereço e contato">
        <div className="flex flex-col gap-4">
          {/* O CEP preenche logradouro, bairro e cidade (issue 063). A largura vai no campo:
              a mensagem da busca usa a linha toda */}
          <Field label="CEP" {...label("zipCode")}>
            <CepInput
              {...f("zipCode", company.address.zipCode)}
              className="sm:max-w-48"
              targets={{
                street: COMPANY_FIELD_IDS.street,
                district: COMPANY_FIELD_IDS.district,
                city: COMPANY_FIELD_IDS.city,
              }}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Logradouro" {...label("street")} className="sm:col-span-3">
              <Input {...f("street", company.address.street)} />
            </Field>
            <Field label="Número" {...label("number")}>
              <Input {...f("number", company.address.number)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bairro" {...label("district")}>
              <Input {...f("district", company.address.district)} />
            </Field>
            <Field label="Cidade" {...label("city")}>
              <Input {...f("city", company.address.city)} />
            </Field>
          </div>
          <Field label="Telefone" {...label("phone")} className="sm:max-w-xs">
            <Input {...f("phone", company.phone)} type="tel" />
          </Field>
          <Field label="E-mail" {...label("email")}>
            <Input {...f("email", company.email)} type="email" />
          </Field>
          <Field label="Site" {...label("website")} hint="Opcional">
            <Input
              {...f("website", company.website ?? "")}
              type="url"
              inputMode="url"
              placeholder="Ex.: www.suafarmacia.com.br"
            />
          </Field>
        </div>
      </SettingsSection>

      {/* Decisão fechada em 16/09: 30 dias como padrão, configurável por conta */}
      <SettingsSection
        title="Janela de a vencer"
        description="Quantos dias antes do vencimento um produto passa a contar como A vencer."
      >
        <Field
          label="Avisar com antecedência de"
          {...label("soonThresholdDays")}
          hint="Padrão de 30 dias. Loja com giro rápido costuma usar menos. Ao salvar, a contagem do painel inteiro muda."
        >
          {/* A largura vai no campo, não no Field: o texto de apoio quebrava em três linhas */}
          <div className="sm:max-w-xs">
            <Select {...select("soonThresholdDays", String(company.soonThresholdDays))}>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="45">45 dias</option>
              <option value="60">60 dias</option>
              <option value="90">90 dias</option>
            </Select>
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection title="Preferências">
        <Field label="Fuso horário" {...label("timezone")} className="sm:max-w-sm">
          <Select {...select("timezone", company.timezone)}>
            <option value="America/Bahia">Brasília, horário de Salvador</option>
            <option value="America/Sao_Paulo">Brasília, horário de São Paulo</option>
            <option value="America/Manaus">Manaus</option>
          </Select>
        </Field>
        {/* Uma opção só: lista de escolha com um item é ruído */}
        <ReadOnlyRows className="mt-6" rows={[{ label: "Moeda", value: "Real brasileiro, R$" }]} />
      </SettingsSection>
    </>
  )
}
