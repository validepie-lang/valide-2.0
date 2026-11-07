import { Check, RotateCcw, Trophy } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { isMilestone, streakLabel } from "@/lib/utils/queue-streak"

export type QueueNotice = { kind: "saved"; text: string; streak: number } | { kind: "undone"; text: string }

/**
 * A confirmação do produto que acabou de sair da tela (Primer, Saving), com
 * "Desfazer" ao lado, como o do Gmail (issue 072, item 98), e o placar
 * (item 24): a cada 10 seguidas, troféu e "Muito bem!", como a comemoração
 * dos apps de quiz do Behance (Quizai, English Learning App).
 *
 * Tom da marca, nunca verde: verde quer dizer No prazo (Marcus, 12/10).
 * Sem animação: a fila é trabalho repetido e o movimento cansaria.
 */
export function QueueSaved({
  notice,
  undoing,
  onUndo,
}: {
  notice: QueueNotice | null
  undoing: boolean
  onUndo: () => void
}) {
  const trophy = notice?.kind === "saved" && isMilestone(notice.streak)

  return (
    <div role="status" className="text-label">
      {notice ? (
        <p
          className={cn(
            "mt-3 flex items-start gap-1.5 rounded-md px-3 py-2",
            notice.kind === "saved" ? "bg-primary-soft text-fg" : "text-fg-muted",
          )}
        >
          {trophy ? (
            <Trophy className="mt-px size-4 shrink-0 text-accent" aria-hidden />
          ) : notice.kind === "saved" ? (
            <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
          ) : (
            <RotateCcw className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          )}
          <span className="min-w-0">
            {trophy ? (
              <strong className="font-semibold">Muito bem! {streakLabel(notice.streak)}. </strong>
            ) : null}
            {notice.text}
            {notice.kind === "saved" ? (
              <>
                {" "}
                <button
                  type="button"
                  onClick={onUndo}
                  aria-busy={undoing}
                  className="inline-flex items-center gap-1 align-bottom font-semibold whitespace-nowrap text-fg underline-offset-4 hover:underline"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  {undoing ? "Desfazendo…" : "Desfazer"}
                </button>
              </>
            ) : null}
          </span>
        </p>
      ) : null}
    </div>
  )
}
