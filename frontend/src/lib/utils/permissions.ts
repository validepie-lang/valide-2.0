/**
 * O que cada cargo vê na interface.
 *
 * Isto esconde, não protege. Quem bloqueia é o servidor: um descarte enviado
 * por Balconista precisa voltar 403 de qualquer jeito. Ver
 * docs/00-context/business-rules.md seção 5.
 */

import type { ExitReason, UserRole } from "@/lib/types"

/** Saídas que são descarte no banco: o produto vai para o lixo, não para o cliente. */
export const DISCARD_REASONS: readonly ExitReason[] = ["expiry", "damage"]

/** Regra do banco, 07/10/2026: descarte só por Farmacêutico ou Administrador. */
export function canDiscard(role: UserRole): boolean {
  return role === "pharmacist" || role === "admin"
}

/**
 * Quem edita o cadastro do produto e o move de pasta (issue 070, item 18,
 * decisão do Marcus em 12/10): Administrador e Farmacêutico. O Balconista vê.
 */
export function canEditProduct(role: UserRole): boolean {
  return role === "pharmacist" || role === "admin"
}

/**
 * Quem corrige uma movimentação com um ajuste (issue 073, item 79): o banco diz
 * que o nível 2, Farmacêutico, "autoriza descartes e ajustes". O Administrador também.
 */
export function canAdjustStock(role: UserRole): boolean {
  return role === "pharmacist" || role === "admin"
}

export function isDiscard(reason: ExitReason): boolean {
  return DISCARD_REASONS.includes(reason)
}

const DEMO_ROLES: Record<string, UserRole> = {
  balconista: "clerk",
  farmaceutico: "pharmacist",
}

/**
 * Cargo para demonstração: `?cargo=balconista` ou `?cargo=farmaceutico` mostra
 * a tela como aquele cargo vê. Some quando a sessão real existir.
 */
export function demoRole(cargo: string | undefined, sessionRole: UserRole): UserRole {
  return (cargo && DEMO_ROLES[cargo]) || sessionRole
}
