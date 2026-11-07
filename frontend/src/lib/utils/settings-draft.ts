/**
 * Regras de Meu perfil e Empresa (issue 059): o aviso antes de enviar. Quem
 * confere a senha atual e grava é o servidor.
 */

import { MIN_PASSWORD } from "./user-draft.ts"

export type PasswordDraft = { current: string; next: string; repeat: string }
export type PasswordErrors = Partial<Record<keyof PasswordDraft, string>>

export function validatePasswordChange(draft: PasswordDraft): PasswordErrors {
  const errors: PasswordErrors = {}
  if (!draft.current) errors.current = "Digite a senha que você usa hoje."
  if (draft.next.length < MIN_PASSWORD)
    errors.next = `A nova senha precisa de ao menos ${MIN_PASSWORD} caracteres.`
  else if (draft.next === draft.current) errors.next = "A nova senha precisa ser diferente da atual."
  if (!errors.next && draft.repeat !== draft.next) errors.repeat = "As duas senhas novas não são iguais."
  return errors
}

const digits = (value: string) => value.replace(/\D/g, "")

/** Os dois dígitos verificadores do CNPJ (regra da Receita Federal) */
export function isValidCnpj(value: string): boolean {
  const n = digits(value).split("").map(Number)
  if (n.length !== 14 || n.every((d) => d === n[0])) return false
  const check = (size: number) => {
    const weights =
      size === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const rest = weights.reduce((sum, w, i) => sum + w * n[i], 0) % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return check(12) === n[12] && check(13) === n[13]
}

/** O que identifica a empresa, conferido igual no cadastro e em Configurações (issue 065) */
export type CompanyIdentity = { cnpj: string; legalName: string; tradeName: string }

export function companyIdentityErrors(draft: CompanyIdentity): Partial<Record<keyof CompanyIdentity, string>> {
  const errors: Partial<Record<keyof CompanyIdentity, string>> = {}
  const cnpj = draft.cnpj.trim()
  if (!cnpj) errors.cnpj = "Informe o CNPJ da farmácia."
  else if (!isValidCnpj(cnpj)) errors.cnpj = "Este CNPJ não confere. Confira os 14 números no cartão do CNPJ."
  if (!draft.legalName.trim()) errors.legalName = "Informe a razão social, como está no CNPJ."
  if (!draft.tradeName.trim()) errors.tradeName = "Informe o nome fantasia, o que está na fachada."
  return errors
}

export type CompanyDraft = {
  cnpj: string
  tradeName: string
  legalName: string
  stateRegistration: string
  cityRegistration: string
  taxRegime: string
  zipCode: string
  street: string
  number: string
  district: string
  city: string
  phone: string
  email: string
  website: string
  soonThresholdDays: string
  timezone: string
}
export type CompanyDraftErrors = Partial<Record<keyof CompanyDraft, string>>

/** O que `PATCH /companies/current` recebe desta tela */
export type CompanyPatch = {
  cnpj: string
  tradeName: string
  legalName: string
  stateRegistration: string | null
  cityRegistration: string | null
  taxRegime: string
  address: { zipCode: string; street: string; number: string; district: string; city: string }
  phone: string
  email: string
  website: string | null
  soonThresholdDays: number
  timezone: string
}

/**
 * Site como a pessoa escreve ("www.farmacia.com.br") vira endereço completo,
 * com https://. Sem ponto no domínio, ou com espaço, não é site: null.
 */
export function normalizeWebsite(value: string): string | null {
  const text = value.trim()
  if (!text || /\s/.test(text)) return null
  const url = /^https?:\/\//i.test(text) ? text : `https://${text}`
  try {
    const { hostname } = new URL(url)
    return /\.[a-z]{2,}$/i.test(hostname) ? url : null
  } catch {
    return null
  }
}

export function validateCompany(draft: CompanyDraft): {
  errors: CompanyDraftErrors
  input: CompanyPatch | null
} {
  const errors: CompanyDraftErrors = {}
  const t = (key: keyof CompanyDraft) => draft[key].trim()
  const identity = companyIdentityErrors(draft)
  if (identity.cnpj) errors.cnpj = identity.cnpj
  if (identity.tradeName) errors.tradeName = identity.tradeName
  if (identity.legalName) errors.legalName = identity.legalName
  if (t("zipCode") && digits(t("zipCode")).length !== 8) errors.zipCode = "O CEP tem 8 números."
  if (t("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t("email"))) {
    errors.email = "Confira o e-mail: falta o @ ou o domínio."
  }
  const website = normalizeWebsite(t("website"))
  if (t("website") && !website) errors.website = "Confira o site: falta o domínio, como suafarmacia.com.br."
  const days = Number(t("soonThresholdDays"))
  if (!Number.isInteger(days) || days <= 0) errors.soonThresholdDays = "Escolha a antecedência."

  if (Object.keys(errors).length > 0) return { errors, input: null }
  return {
    errors,
    input: {
      cnpj: t("cnpj"),
      tradeName: t("tradeName"),
      legalName: t("legalName"),
      stateRegistration: t("stateRegistration") || null,
      cityRegistration: t("cityRegistration") || null,
      taxRegime: t("taxRegime"),
      address: {
        zipCode: t("zipCode"),
        street: t("street"),
        number: t("number"),
        district: t("district"),
        city: t("city"),
      },
      phone: t("phone"),
      email: t("email"),
      website,
      soonThresholdDays: days,
      timezone: t("timezone"),
    },
  }
}
