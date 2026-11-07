"use client"

import Link from "next/link"
import { PasswordInput } from "@/components/ui/password-input"
import { ArrowRight, FileSpreadsheet, PackagePlus } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"

export function Title({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-display-sm font-bold text-fg">{title}</h1>
      <p className="mt-1.5 text-label text-fg-muted">{description}</p>
    </div>
  )
}

/** O id de cada campo da etapa 1, na ordem da tela: o primeiro errado recebe o foco */
export const SIGNUP_COMPANY_IDS = { cnpj: "cnpj", legalName: "razao", tradeName: "fantasia" } as const

type StepCompanyErrors = Partial<Record<keyof typeof SIGNUP_COMPANY_IDS, string>>

export function StepCompany({ errors = {} }: { errors?: StepCompanyErrors }) {
  const f = (key: keyof typeof SIGNUP_COMPANY_IDS) => ({
    id: SIGNUP_COMPANY_IDS[key],
    name: key,
    invalid: Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${SIGNUP_COMPANY_IDS[key]}-mensagem` : undefined,
  })
  return (
    <>
      <Title title="Dados da sua empresa" description="São os dados que aparecem nos seus relatórios." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CNPJ" htmlFor="cnpj" required error={errors.cnpj} className="sm:col-span-2">
          <Input {...f("cnpj")} placeholder="00.000.000/0000-00" inputMode="numeric" />
        </Field>
        <Field label="Razão social" htmlFor="razao" required error={errors.legalName} className="sm:col-span-2">
          <Input {...f("legalName")} />
        </Field>
        <Field
          label="Nome fantasia"
          htmlFor="fantasia"
          required
          error={errors.tradeName}
          hint="É o nome que sua equipe vê no sistema."
          className="sm:col-span-2"
        >
          <Input {...f("tradeName")} />
        </Field>
        <Field label="Inscrição estadual" htmlFor="ie" hint="Opcional">
          <Input id="ie" />
        </Field>
        <Field label="Inscrição municipal" htmlFor="im" hint="Opcional">
          <Input id="im" />
        </Field>
      </div>
    </>
  )
}

export function StepStructure() {
  return (
    <>
      <Title
        title="Estrutura e primeiro acesso"
        description="Você entra como administrador e cadastra o resto da equipe depois."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Regime tributário" htmlFor="regime" required>
          <Select id="regime" defaultValue="simples">
            <option value="simples">Simples Nacional</option>
            <option value="presumido">Lucro Presumido</option>
            <option value="real">Lucro Real</option>
            <option value="mei">MEI</option>
          </Select>
        </Field>
        <Field
          label="Esta unidade é"
          htmlFor="unidade"
          required
          hint="A gestão de várias unidades entra em uma versão futura."
        >
          <Select id="unidade" defaultValue="matriz">
            <option value="matriz">Matriz</option>
            <option value="filial">Filial</option>
          </Select>
        </Field>

        <hr className="my-2 border-line sm:col-span-2" />

        <Field label="Seu nome" htmlFor="nome-admin" required className="sm:col-span-2">
          <Input id="nome-admin" autoComplete="name" />
        </Field>
        {/* Usuário, não e-mail: o banco não guarda e-mail e a entrada é por
            usuário (contrato v6, 07/10) */}
        <Field
          label="Crie seu usuário"
          htmlFor="login-admin"
          required
          hint="É com ele que você entra. Sem espaço nem acento."
        >
          <Input
            id="login-admin"
            placeholder="Ex.: marcus.campos"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>
        <Field label="Crie uma senha" htmlFor="senha-admin" required hint="Ao menos 8 caracteres">
          <PasswordInput id="senha-admin" autoComplete="new-password" />
        </Field>
      </div>
    </>
  )
}

/**
 * Quarta etapa: como trazer os produtos.
 *
 * Quem pula cai no estado vazio do estoque, que oferece as mesmas três opções.
 * Ninguém fica sem saída. Ver docs/01-references/screen-map.md seção 2.
 */
export function StepProducts() {
  const options = [
    {
      href: "/estoque/importar",
      icon: FileSpreadsheet,
      title: "Enviar uma planilha",
      body: "Exporte a lista do sistema que você já usa e envie aqui. É o caminho mais rápido.",
      primary: true,
    },
    {
      href: "/estoque/novo",
      icon: PackagePlus,
      title: "Cadastrar manualmente",
      body: "Para começar aos poucos, com um produto de cada vez.",
      primary: false,
    },
  ]

  return (
    <>
      <Title
        title="Como quer trazer seus produtos?"
        description="Você não precisa digitar produto por produto. Escolha por onde começar."
      />
      <div className="grid gap-3">
        {options.map(({ href, icon: Icon, title, body, primary }) => (
          <Link
            key={href}
            href={href}
            className={
              primary
                ? "flex gap-4 rounded-md border-2 border-primary p-4 transition-colors hover:bg-primary-soft"
                : "flex gap-4 rounded-md border border-line p-4 transition-colors hover:border-line-strong hover:bg-primary-soft"
            }
          >
            {/* Ícone solto, sem quadrado (SPEC 4.6). O destaque da primeira opção é a borda */}
            <Icon className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden />
            <span className="min-w-0">
              <span className="block text-body font-semibold text-fg">{title}</span>
              <span className="mt-1 block text-label text-fg-muted">{body}</span>
            </span>
            <ArrowRight className="ml-auto size-4 shrink-0 self-center text-fg-muted" aria-hidden />
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-6">
        <LinkButton href="/cadastro-empresa?etapa=3" variant="ghost">
          Voltar
        </LinkButton>
        <Link href="/" className="text-label font-medium text-fg-muted transition-colors hover:text-fg">
          Decidir depois
        </Link>
      </div>
    </>
  )
}
