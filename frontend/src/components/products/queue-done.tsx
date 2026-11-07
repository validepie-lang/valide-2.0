"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, Trophy } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/utils/format"

/**
 * A fila zerou. Estado de vitória: o texto reconhece sem exagero.
 *
 * Ícone neutro: verde quer dizer No prazo, não "terminou". O foco vem para o
 * título, senão quem usa teclado ou leitor de tela não fica sabendo que acabou.
 *
 * Os três números lado a lado vêm da tela de resultado do Quizai (Behance,
 * 886 curtidas): perguntas, certas e erradas. Aqui, na fila, preenchidos e
 * pulados, sem cor de status (issue 031). Issue 072 (item 24): a melhor
 * sequência embaixo, como o "best streak" dos mesmos apps.
 */
export function QueueDone({
  total,
  filled,
  skipped,
  best,
}: {
  total: number
  filled: number
  skipped: number
  best: number
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => titleRef.current?.focus(), [])

  const products = (n: number) => `${formatNumber(n)} ${n === 1 ? "produto" : "produtos"}`
  // Três finais diferentes: dizer "o painel já acompanha" quando nada foi
  // preenchido seria dar uma segurança que o usuário não tem
  const title = filled > 0 ? "Fila concluída" : "Fim da fila"
  const body =
    filled === 0
      ? skipped === 1
        ? "Você pulou o único produto. Ele continua na fila para quando tiver o lote e a data em mãos."
        : `Você pulou os ${products(skipped)}. Eles continuam na fila para quando tiver o lote e a data em mãos.`
      : skipped === 0
        ? `Você informou a validade de ${products(filled)}. Agora o painel consegue acompanhar esse estoque.`
        : `Você informou a validade de ${products(filled)} e deixou ${products(skipped)} para depois. O painel já acompanha os que você preencheu; os outros continuam na fila.`

  return (
    <Card className="max-w-2xl">
      <div className="flex items-start gap-4">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-fg-muted" aria-hidden />
        <div className="min-w-0">
          <h2 ref={titleRef} tabIndex={-1} className="font-display text-section font-bold text-fg focus:outline-none">
            {title}
          </h2>
          <p className="mt-1.5 text-body text-fg-muted">{body}</p>

          <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-md border border-line">
            {[
              ["Na fila", total],
              ["Preenchidos", filled],
              ["Para depois", skipped],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-3">
                <dt className="text-label text-fg-muted">{label}</dt>
                <dd className="mt-1 font-display text-[1.75rem] leading-none font-extrabold text-fg">
                  {formatNumber(value as number)}
                </dd>
              </div>
            ))}
          </dl>
          <Progress
            value={filled}
            max={total}
            label={`${filled} de ${total} preenchidos`}
            className="mt-3 h-2"
          />
          {best >= 2 ? (
            <p className="mt-3 flex items-center gap-1.5 text-label text-fg">
              <Trophy className="size-4 shrink-0 text-accent" aria-hidden />
              Melhor sequência: <span className="font-semibold tnum">{formatNumber(best)} seguidas</span>
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <LinkButton href="/">Voltar ao painel</LinkButton>
            <LinkButton href="/estoque" variant="secondary">
              Ver o estoque
            </LinkButton>
          </div>
        </div>
      </div>
    </Card>
  )
}
