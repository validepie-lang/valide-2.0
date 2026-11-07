"use client"

import { ErrorState } from "@/components/ui/error-state"

export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-lg">
      <ErrorState
        title="Não foi possível abrir esta tela"
        description="Pode ter sido a conexão. Tente de novo, ou volte para a tela de entrada."
        onRetry={reset}
        backHref="/login"
        backLabel="Ir para o login"
      />
    </div>
  )
}
