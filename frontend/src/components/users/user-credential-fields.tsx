"use client"

import Link from "next/link"
import { Field, Input } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"

/**
 * A senha na janela de pessoa (issue 040). A própria muda em Meu perfil, que
 * pede a atual (ponto aberto 10); a de outra pessoa, aqui, opcional na edição.
 *
 * Os dois campos de acesso (usuário e senha) saíram de `user-form-dialog` na
 * issue 058, que passava de 200 linhas.
 */
export function UserPasswordField({
  isSelf,
  editing,
  error,
  readOnly,
  onChange,
}: {
  isSelf: boolean
  editing: boolean
  error?: string
  readOnly: boolean
  onChange: () => void
}) {
  if (isSelf) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-medium text-fg">Senha</span>
        <span className="flex min-h-11 items-center text-body text-fg-muted">
          <span>
            A sua muda em{" "}
            <Link href="/configuracoes" className="font-medium text-fg underline-offset-4 hover:underline">
              Meu perfil
            </Link>
            .
          </span>
        </span>
      </div>
    )
  }
  return (
    <Field
      label={editing ? "Nova senha" : "Senha inicial"}
      htmlFor="pessoa-senha"
      error={error}
      hint={editing ? "Deixe em branco para manter a atual." : "Ao menos 8 caracteres."}
    >
      <PasswordInput
        id="pessoa-senha"
        name="password"
        invalid={Boolean(error)}
        aria-describedby="pessoa-senha-mensagem"
        readOnly={readOnly}
        autoComplete="new-password"
        onChange={onChange}
      />
    </Field>
  )
}

/** O usuário de acesso: escolhido ao adicionar; na edição, só leitura (o PATCH não o muda) */
export function UserLoginField({
  login,
  error,
  readOnly,
  onChange,
}: {
  /** o usuário de quem está sendo editado; ausente ao adicionar */
  login?: string
  error?: string
  readOnly: boolean
  onChange: () => void
}) {
  if (login !== undefined) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-medium text-fg">Usuário de acesso</span>
        <span className="flex h-11 items-center text-body text-fg">{login}</span>
      </div>
    )
  }
  return (
    <Field label="Usuário de acesso" htmlFor="pessoa-login" error={error} hint="Ex.: maria.souza">
      <Input
        id="pessoa-login"
        name="login"
        invalid={Boolean(error)}
        aria-describedby="pessoa-login-mensagem"
        readOnly={readOnly}
        maxLength={60}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        onChange={onChange}
      />
    </Field>
  )
}
