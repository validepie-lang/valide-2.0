"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { signIn } from "@/lib/services/auth"

/**
 * Formulário de entrada.
 *
 * É o único ponto do app com "use client" ligado à sessão, e ele não toca no
 * cookie: só entrega usuário e senha para o backend, que grava a sessão.
 * Depois disso tudo é Server Component lendo o cookie da requisição.
 */
export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const data = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    try {
      await signIn(String(data.get("login") ?? "").trim(), String(data.get("senha") ?? ""))
      // As telas são Server Component e precisam enxergar o cookie que o backend
      // acabou de gravar: o refresh relê a rota com a requisição já autenticada.
      router.push("/")
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar. Tente de novo.")
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md bg-error-bg px-3.5 py-3 text-label text-error-fg"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      <Field label="Usuário" htmlFor="login" required>
        <Input
          id="login"
          name="login"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Ex.: juliana.ferreira"
          invalid={Boolean(error)}
        />
      </Field>

      <Field label="Senha" htmlFor="senha" required>
        <PasswordInput
          id="senha"
          name="senha"
          autoComplete="current-password"
          invalid={Boolean(error)}
        />
      </Field>

      <label className="flex items-center gap-2 text-label text-fg-muted">
        <input type="checkbox" className="size-4 accent-[var(--primary)]" />
        Continuar conectado
      </label>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? "Entrando" : "Entrar"}
      </Button>

      {/* Recuperação por e-mail não existe: o banco não guarda e-mail (v6) e
          quem administra cria e troca as senhas. Até 09/10 havia um "Esqueci a
          senha" em cinza apagado que não fazia nada */}
      <p className="text-center text-label text-fg-muted">
        Esqueceu a senha? Peça a quem administra a conta da farmácia.
      </p>
    </form>
  )
}
