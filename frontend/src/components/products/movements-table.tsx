import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, PencilLine } from "lucide-react"
import { formatEventTime, formatQuantity } from "@/lib/utils/format"
import { EXIT_REASON_LABEL, type Movement } from "@/lib/types"
import { cn } from "@/lib/utils/cn"
import { movementNoteText, shortEventTime } from "@/lib/utils/movement-fix"

/**
 * Movimentação de estoque.
 *
 * Entrada e saída não usam cor de status: verde e vermelho aqui significariam
 * validade. A direção é comunicada por ícone e por sinal no número.
 */
export function MovementsTable({
  movements,
  showProduct = true,
}: {
  movements: Movement[]
  showProduct?: boolean
}) {
  return (
    <>
      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-body">
          <thead>
            <tr className="border-b border-line text-left">
              {showProduct ? <Th>Produto</Th> : null}
              <Th>Lote</Th>
              <Th>Movimento</Th>
              <Th className="text-right">Quantidade</Th>
              <Th>Responsável</Th>
              <Th>Quando</Th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr
                key={m.id}
                className="border-b border-line last:border-b-0 hover:bg-primary-soft"
              >
                {showProduct ? (
                  <Td>
                    <Link
                      href={`/estoque/${m.productId}`}
                      className="font-medium text-fg hover:underline"
                    >
                      {m.productName}
                    </Link>
                  </Td>
                ) : null}
                <Td className="text-fg-muted">{m.lotCode}</Td>
                <Td>
                  <MovementBadge movement={m} />
                  <MovementNote movement={m} />
                </Td>
                <Td className="text-right font-medium text-fg tnum">
                  {signedQuantity(m)}
                </Td>
                <Td className="text-fg-muted">{m.userName}</Td>
                <Td className="text-fg-muted tnum">{formatEventTime(m.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular: lista de cards, nunca rolagem horizontal */}
      <ul className="divide-y divide-line md:hidden">
        {movements.map((m) => (
          <li key={m.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              {showProduct ? (
                <p className="truncate text-body font-medium text-fg">{m.productName}</p>
              ) : null}
              <div className="mt-1">
                <MovementBadge movement={m} />
                <MovementNote movement={m} />
              </div>
              <p className="mt-1.5 text-micro text-fg-muted">
                Lote {m.lotCode}, {m.userName}, {formatEventTime(m.createdAt)}
              </p>
            </div>
            <span className="shrink-0 text-body font-semibold text-fg tnum">
              {signedQuantity(m)}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

/** "+24 un" ou "−6 un": a direção vai no sinal e no ícone, nunca em cor. O ajuste já vem com sinal (073) */
export function signedQuantity(m: Movement): string {
  return formatQuantity(m.type === "out" ? -m.quantity : m.quantity, m.unit, { signed: true })
}

export function MovementBadge({ movement }: { movement: Movement }) {
  const isIn = movement.type === "in"
  // Ajuste: a correção de uma entrada ou saída (issue 073), o AJUSTE do banco
  const Icon = movement.type === "adjust" ? PencilLine : isIn ? ArrowUpRight : ArrowDownRight
  const label =
    movement.type === "adjust"
      ? "Ajuste"
      : isIn
        ? "Entrada"
        : `Saída, ${(movement.reason ? EXIT_REASON_LABEL[movement.reason] : "sem motivo").toLowerCase()}`
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-sunken px-2.5 py-1 text-label font-medium whitespace-nowrap text-fg-muted">
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}

/** Justificativa da saída, fornecedor e nota da entrada (072), o que o ajuste corrige e "Corrigida" (073) */
function MovementNote({ movement }: { movement: Movement }) {
  const note = movementNoteText(movement)
  const corrected = movement.correctedAt ? `Corrigida em ${shortEventTime(movement.correctedAt)}` : null
  const text = [note, corrected].filter(Boolean).join(". ")
  return text ? <span className="mt-1 block text-micro text-fg-muted">{text}</span> : null
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("px-3 py-2.5 text-label font-medium text-fg-muted first:pl-0 last:pr-0", className)}
    >
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-3 py-3.5 align-middle first:pl-0 last:pr-0", className)}>
      {children}
    </td>
  )
}
