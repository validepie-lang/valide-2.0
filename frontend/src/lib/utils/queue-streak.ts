/**
 * Placar da fila de validades pendentes (issue 072, item 24).
 *
 * Vem dos apps de quiz bem avaliados no Behance (Quizai, English Learning
 * App, issue 031): acertos seguidos e uma comemoração de tempos em tempos.
 * Na fila, "acerto" é produto salvo; pular zera a sequência, porque o produto
 * continua parado sem validade. A melhor sequência fica para o fim.
 */

export type Streak = { current: number; best: number }

export const NO_STREAK: Streak = { current: 0, best: 0 }

/** A cada quantas seguidas aparece o troféu */
export const STREAK_MILESTONE = 10

export function afterSave(streak: Streak): Streak {
  const current = streak.current + 1
  return { current, best: Math.max(streak.best, current) }
}

export function afterSkip(streak: Streak): Streak {
  return { current: 0, best: streak.best }
}

export function isMilestone(current: number): boolean {
  return current > 0 && current % STREAK_MILESTONE === 0
}

/** "3 seguidas" a partir de duas: uma só não é sequência */
export function streakLabel(current: number): string | null {
  return current >= 2 ? `${current.toLocaleString("pt-BR")} seguidas` : null
}
