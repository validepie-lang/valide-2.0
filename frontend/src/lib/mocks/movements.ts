import { daily, mockProducts, isoAtLocalTime } from "@/lib/mocks/catalog"
import type { ExitReason, Movement } from "@/lib/types"

const USERS = [
  { id: "u2", name: "Juliana Ferreira" },
  { id: "u3", name: "Rafael Nogueira" },
  { id: "u1", name: "Marcus Campos" },
  { id: "u4", name: "Camila Duarte" },
]

/** Descarte só por Farmacêutico ou Administrador (regra do banco, 07/10) */
const DISCARDERS = [USERS[1], USERS[2]]

/** [índice do produto, tipo, motivo, quantidade, dias atrás, hora, observação] */
type MovementSeed = [number, "in" | "out", ExitReason | null, number, number, string, string | null]

// prettier-ignore
const SEEDS: MovementSeed[] = [
  [0,  "out", "sale",     6, 0, "14:22", null],
  [20, "out", "sale",    12, 0, "11:47", null],
  [5,  "out", "expiry",   4, 0, "09:15", "Lote descartado na conferência da manhã"],
  [52, "out", "sale",    18, 1, "17:03", null],
  [1,  "in",  null,      24, 1, "08:40", "Entrada da Panarello, nota 44821"],
  [29, "out", "damage",   2, 1, "16:12", "Caixa amassada no transporte"],
  [11, "out", "sale",     3, 2, "10:58", null],
  [40, "out", "sale",     5, 2, "15:31", null],
  [22, "in",  null,      40, 3, "09:05", "Entrada da Servimed, nota 17093"],
  [63, "out", "internal", 1, 3, "13:44", "Uso no balcão para demonstração"],
  [9,  "out", "sale",     2, 4, "18:20", null],
  [31, "out", "theft",    3, 5, "19:48", "Falta identificada na contagem do fechamento"],
]

function seeded(seed: number) {
  let x = seed
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648
    return x / 2147483648
  }
}

const SUPPLIERS = ["Panarello", "Servimed", "Profarma", "Santa Cruz"]

/**
 * Mais 58 em 30 dias (issue 041), para a tela Movimentações ter dias, filtros
 * e páginas. Venda é a maioria, como no balcão; entrada vem com fornecedor e
 * nota. Sempre o mesmo resultado: o gerador tem semente fixa.
 */
const GENERATED: MovementSeed[] = (() => {
  const rand = seeded(20261011)
  const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
  // Só produto com lote: sem lote não há o que sair nem onde entrar
  const withLots = mockProducts().flatMap((p, index) => (p.lots.length > 0 ? [index] : []))
  const list: MovementSeed[] = []
  for (let i = 0; i < 58; i++) {
    const daysAgo = 1 + Math.floor(rand() * 29)
    const hour = 8 + Math.floor(rand() * 12)
    const time = `${String(hour).padStart(2, "0")}:${String(Math.floor(rand() * 60)).padStart(2, "0")}`
    const product = pick(withLots)
    const roll = rand()
    if (roll < 0.18) {
      list.push([
        product,
        "in",
        null,
        12 + Math.floor(rand() * 36),
        daysAgo,
        time,
        `Entrada da ${pick(SUPPLIERS)}, nota ${10000 + Math.floor(rand() * 89999)}`,
      ])
    } else {
      const reason: ExitReason =
        roll < 0.8
          ? "sale"
          : roll < 0.88
            ? "expiry"
            : roll < 0.94
              ? "damage"
              : roll < 0.97
                ? "internal"
                : "theft"
      list.push([
        product,
        "out",
        reason,
        1 + Math.floor(rand() * (reason === "sale" ? 8 : 4)),
        daysAgo,
        time,
        null,
      ])
    }
  }
  return list
})()

export const mockMovements = daily((): Movement[] =>
  [...SEEDS, ...GENERATED]
    .map((seed, i) => {
      const [productIndex, type, reason, quantity, daysAgo, time, note] = seed
      const product = mockProducts()[productIndex]
      const lot = product.lots[0]
      const discard = reason === "expiry" || reason === "damage"
      const user = discard ? DISCARDERS[i % DISCARDERS.length] : USERS[i % USERS.length]

      return {
        id: `m${i + 1}`,
        productId: product.id,
        productName: product.name,
        lotId: lot?.id ?? `${product.id}-l0`,
        lotCode: lot?.code ?? "sem lote",
        type,
        reason,
        quantity,
        unit: product.unit,
        userId: user.id,
        userName: user.name,
        createdAt: isoAtLocalTime(daysAgo, time),
        note,
      } satisfies Movement
    })
    // A API devolve do mais recente para o mais antigo
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)
