"use client"

import { ErrorState } from "@/components/ui/error-state"

/**
 * Rede de segurança para qualquer tela da área logada.
 *
 * O `reset` do Next tenta renderizar o segmento de novo, então "Tentar de novo"
 * refaz a busca de dado sem o usuário precisar recarregar a página inteira.
 */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState onRetry={reset} backHref="/" backLabel="Ir para o painel" />
}
