import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = { title: "Entrar" }

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Logo acima do título, alinhado à esquerda, e o formulário direto no fundo,
          sem card, como nas referências de login do Behance (issue 034). No
          desktop a marca tem a outra metade da tela; aqui fica só o logo */}
      <Logo />

      <div className="mt-10">
        <h1 className="font-display text-display-sm font-bold text-fg">Entrar na sua conta</h1>
        <p className="mt-1.5 text-label text-fg-muted">
          Use o usuário que o administrador da farmácia criou para você.
        </p>

        {/* A mensagem de erro mora dentro do formulário, que é quem conversa com
            a API. Usuário inexistente e senha errada recebem a mesma mensagem,
            de propósito: mensagem diferente permite descobrir quais usuários
            estão cadastrados */}
        <LoginForm />

        {/* "Don't have an account? Create an account", numa linha, como nas referências */}
        <p className="mt-8 border-t border-line pt-5 text-center text-label text-fg-muted">
          Sua empresa ainda não usa o Valide?{" "}
          <Link href="/cadastro-empresa" className="font-semibold text-fg underline-offset-4 hover:underline">
            Cadastrar empresa
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-micro text-fg-muted">
        Ao entrar você concorda com os termos de uso da plataforma.
      </p>
    </div>
  )
}
