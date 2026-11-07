import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { formatMoney, formatMoneyWhole, formatNumber } from "@/lib/utils/format"
import { streakLabel } from "@/lib/utils/queue-streak"
import type { Product } from "@/lib/types"

/**
 * Progresso da fila, no topo do cartão do produto (issue 031), como a
 * "pergunta 3 de 10" dos apps de quiz bem avaliados no Behance (Quizai,
 * 27.801 visualizações; English Learning App, 32.037): a posição à esquerda,
 * a barra de largura inteira embaixo. Até aqui era uma linha solta sob o
 * título da página, longe de onde o olho está.
 *
 * Issue 072 (item 24): "N seguidas" ao lado, o placar dos mesmos apps, em
 * cor da marca (verde e vermelho são de status).
 */
export function QueueProgress({
  position,
  total,
  filled,
  streak,
  remainingValue,
}: {
  /** o produto em foco, a partir de 1 */
  position: number
  total: number
  filled: number
  /** produtos salvos em seguida, sem pular */
  streak: number
  /** centavos ainda parados nos produtos que não foram preenchidos */
  remainingValue: number
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-label font-semibold text-fg" aria-live="polite">
          <span>
            Produto <span className="tnum">{formatNumber(position)}</span> de{" "}
            <span className="tnum">{formatNumber(total)}</span>
          </span>
          {streakLabel(streak) ? (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-accent-strong tnum">
              {streakLabel(streak)}
            </span>
          ) : null}
        </p>
        <p className="text-label text-fg-muted">
          <span className="font-medium text-fg tnum">{formatNumber(filled)}</span> preenchidos ·{" "}
          <span title={formatMoney(remainingValue)}>{formatMoneyWhole(remainingValue)}</span> ainda parados
        </p>
      </div>
      <Progress
        value={position - 1}
        max={total}
        label={`Produto ${position} de ${total}`}
        className="mt-2.5 h-2"
      />
    </div>
  )
}

/** Os próximos da fila, para quem preenche saber o que vem. Lista simples, sem card */
export function UpNext({ products }: { products: Product[] }) {
  return (
    <section
      aria-labelledby="a-seguir"
      className="self-start overflow-hidden rounded-md border border-line bg-surface shadow-card"
    >
      <h2 id="a-seguir" className="border-b border-line px-5 py-4 font-display text-section font-bold text-fg">
        A seguir
      </h2>
      {products.length === 0 ? (
        <p className="px-5 py-4 text-body text-fg-muted">Este é o último da fila.</p>
      ) : (
        <ol className="divide-y divide-line">
          {products.map((next) => (
            <li key={next.id} className="flex items-baseline justify-between gap-3 px-5 py-3">
              <span className="min-w-0 truncate text-body text-fg">{next.name}</span>
              <span className="shrink-0 text-label text-fg-muted tnum">
                {formatMoneyWhole(next.totalQuantity * next.acquisitionCost)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <Link
        href="/estoque?status=unknown"
        className="flex min-h-11 items-center gap-1.5 border-t border-line px-5 py-3 text-label font-semibold text-fg transition-colors hover:bg-primary-soft"
      >
        Ver a fila inteira no estoque
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </section>
  )
}
