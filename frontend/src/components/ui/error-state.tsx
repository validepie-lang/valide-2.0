"use client"

import { RotateCcw, WifiOff } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/**
 * Estado de erro de tela.
 *
 * Diz o que aconteceu e o que fazer em seguida. Nunca mostra stack, código de
 * erro ou nome de serviço: isso é material de reconhecimento para quem quer
 * atacar o sistema, e é inútil para o balconista.
 *
 * Em produção o Next substitui a mensagem de erro do servidor por uma genérica
 * antes de mandar para o navegador, então o texto aqui não pode depender do que
 * foi lançado lá atrás. Por isso ele é curto, honesto e acionável.
 * Ver docs/01-references/security-rules.md seção 5.
 */
export function ErrorState({
  title = "Não foi possível carregar esta tela",
  description = "Pode ter sido a conexão, ou o servidor pode estar fora do ar por um instante. Tente de novo.",
  onRetry,
  backHref,
  backLabel,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  backHref?: string
  backLabel?: string
}) {
  return (
    <Card className="mx-auto my-6 max-w-2xl">
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <WifiOff className="size-8 text-fg-muted" strokeWidth={1.5} aria-hidden />
        <h2 className="mt-4 text-section font-semibold text-fg">{title}</h2>
        <p className="mt-1.5 max-w-sm text-body text-fg-muted">{description}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {onRetry ? (
            <Button onClick={onRetry}>
              <RotateCcw className="size-4" aria-hidden />
              Tentar de novo
            </Button>
          ) : null}
          {backHref ? (
            <LinkButton href={backHref} variant="secondary">
              {backLabel ?? "Voltar"}
            </LinkButton>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
