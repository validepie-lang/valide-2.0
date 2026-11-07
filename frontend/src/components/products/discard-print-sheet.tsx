import { formatDate, formatQuantity } from "@/lib/utils/format"
import type { ExpiredLotRow } from "@/components/products/discard-batch"

/**
 * A lista de vencidos no papel (issue 048, item 48), para quem percorre as
 * gôndolas com a folha na mão: a mesma ordem da tela, com uma caixa para
 * marcar o que já saiu da prateleira e o que não foi achado.
 *
 * Só existe na impressão (`hidden print:block`); a tela some (`print:hidden`).
 * Preto no branco, sem cor de status: a impressora do balcão é de uma cor só.
 */
export function DiscardPrintSheet({
  rows,
  pharmacy,
  today,
}: {
  rows: ExpiredLotRow[]
  pharmacy: string
  today: string
}) {
  return (
    <div className="hidden text-[11pt] text-black print:block">
      <h1 className="text-[16pt] font-bold">Retirar vencidos da prateleira</h1>
      <p className="mt-1">
        {pharmacy} · {today} · {rows.length} {rows.length === 1 ? "lote" : "lotes"}
      </p>
      <table className="mt-4 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-1.5 pr-2">Produto</th>
            <th className="px-2 py-1.5">Lote</th>
            <th className="px-2 py-1.5">Venceu em</th>
            <th className="px-2 py-1.5 text-right">Quantidade</th>
            <th className="px-2 py-1.5 text-center">Retirado</th>
            <th className="py-1.5 pl-2 text-center">Não achei</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.lotId} className="border-b border-black/40 break-inside-avoid">
              <td className="py-2 pr-2">{row.productName}</td>
              <td className="px-2 py-2 whitespace-nowrap">{row.lotCode}</td>
              <td className="px-2 py-2 whitespace-nowrap">{formatDate(row.expiresAt)}</td>
              <td className="px-2 py-2 text-right whitespace-nowrap">
                {formatQuantity(row.quantity, row.unit)}
              </td>
              <td className="px-2 py-2 text-center">
                <span className="inline-block size-4 border border-black" />
              </td>
              <td className="py-2 pl-2 text-center">
                <span className="inline-block size-4 border border-black" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6">Conferido por: ______________________________ Data: ____/____/______</p>
      <p className="mt-2">
        Depois de retirar, o descarte é registrado no Valide pelo farmacêutico ou pelo administrador.
      </p>
    </div>
  )
}
