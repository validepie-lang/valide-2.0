"use client"

import { Title } from "@/components/auth/signup-steps"
import { CepInput } from "@/components/ui/cep-input"
import { Field, Input } from "@/components/ui/field"

/**
 * Passo 2 do cadastro da empresa, separado de `signup-steps.tsx` na issue 063.
 * O CEP preenche logradouro, bairro, cidade e estado (Baymard, autodetecção
 * pelo CEP); a pessoa confere e completa o número. Site entrou na mesma issue.
 */
export function StepAddress() {
  return (
    <>
      <Title
        title="Onde fica e como falamos com você"
        description="Digite o CEP e preenchemos o resto para você conferir."
      />
      <div className="grid gap-4 sm:grid-cols-6">
        <Field label="CEP" htmlFor="cep" required className="sm:col-span-6">
          <CepInput
            id="cep"
            placeholder="00000-000"
            className="sm:max-w-48"
            targets={{ street: "rua", district: "bairro", city: "cidade", state: "uf" }}
          />
        </Field>
        <Field label="Logradouro" htmlFor="rua" required className="sm:col-span-4">
          <Input id="rua" autoComplete="address-line1" />
        </Field>
        <Field label="Número" htmlFor="numero" required className="sm:col-span-2">
          <Input id="numero" inputMode="numeric" />
        </Field>
        <Field label="Complemento" htmlFor="complemento" hint="Opcional" className="sm:col-span-6">
          <Input id="complemento" placeholder="Ex.: Loja 2" autoComplete="address-line2" />
        </Field>
        <Field label="Bairro" htmlFor="bairro" required className="sm:col-span-3">
          <Input id="bairro" />
        </Field>
        <Field label="Cidade" htmlFor="cidade" required className="sm:col-span-2">
          <Input id="cidade" autoComplete="address-level2" />
        </Field>
        <Field label="Estado" htmlFor="uf" required className="sm:col-span-1">
          <Input id="uf" maxLength={2} autoComplete="address-level1" />
        </Field>
        <Field label="Telefone" htmlFor="telefone" required className="sm:col-span-3">
          <Input id="telefone" type="tel" placeholder="(00) 0000-0000" autoComplete="tel" />
        </Field>
        <Field label="E-mail da empresa" htmlFor="email-empresa" required className="sm:col-span-3">
          <Input
            id="email-empresa"
            type="email"
            placeholder="Ex.: contato@suaempresa.com.br"
            autoComplete="email"
          />
        </Field>
        <Field label="Site" htmlFor="site-empresa" hint="Opcional" className="sm:col-span-6">
          <Input
            id="site-empresa"
            type="url"
            inputMode="url"
            placeholder="Ex.: www.suaempresa.com.br"
            autoComplete="url"
          />
        </Field>
      </div>
    </>
  )
}
