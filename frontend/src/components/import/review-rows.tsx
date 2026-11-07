import { CircleAlert, TriangleAlert } from "lucide-react"
import { RowToggle } from "@/components/import/row-toggle"
import { formatMoney, formatNumber, formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import type { ImportPreviewRow } from "@/lib/types"

/**
 * Linhas da revisão. Tabela a partir de `lg`; abaixo, lista, porque a tabela
 * rolava de lado e escondia a coluna Ação, que é o que a linha decide.
 *
 * A decisão entre criar, atualizar e ignorar é do servidor. A regra que define
 * criar ou atualizar ainda está aberta com o Pedro (pauta-reuniao.md item 2.1).
 *
 * Issue 075 (item 25): a caixa de marcar na primeira coluna. Linha com erro
 * não tem caixa: ela já fica de fora.
 */
const ACTION: Record<ImportPreviewRow["action"], { label: string; className: string }> = {
  create: { label: "Criar", className: "bg-sunken text-fg" },
  update: { label: "Atualizar", className: "bg-sunken text-fg" },
  skip: { label: "Ignorar", className: "border border-line text-fg-muted" },
}

export function ReviewRows({ rows, jobId }: { rows: ImportPreviewRow[]; jobId: string }) {
  return (
    <>
      <table className="hidden w-full border-collapse text-body lg:table">
        <thead>
          <tr className="border-b border-line bg-sunken text-left">
            <Th className="w-14">
              <span className="sr-only">Importar</span>
            </Th>
            <Th className="w-16">Linha</Th>
            <Th>Produto</Th>
            <Th>Código</Th>
            <Th className="text-right">Estoque</Th>
            <Th className="text-right">Custo</Th>
            <Th>Ação</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.rowNumber}
              className={cn("border-b border-line last:border-b-0", row.excluded && "text-fg-muted")}
            >
              <td className="px-4 py-3 align-top">
                <Pick row={row} jobId={jobId} />
              </td>
              <td className="px-4 py-3 align-top text-label text-fg-muted tnum">{row.rowNumber}</td>
              <td className="px-4 py-3 align-top">
                <Name row={row} />
                <Issue row={row} />
              </td>
              <td className="px-4 py-3 align-top text-label text-fg-muted">{code(row)}</td>
              <td className="px-4 py-3 text-right align-top whitespace-nowrap text-fg tnum">
                {quantity(row)}
              </td>
              <td className="px-4 py-3 text-right align-top whitespace-nowrap text-fg-muted tnum">
                {cost(row)}
              </td>
              <td className="px-4 py-3 align-top">
                <Action row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line lg:hidden">
        {rows.map((row) => (
          <li key={row.rowNumber} className="flex gap-3 px-4 py-3.5">
            <div className="pt-0.5">
              <Pick row={row} jobId={jobId} />
            </div>
            <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Name row={row} />
                <p className="mt-0.5 text-label text-fg-muted">
                  Linha <span className="tnum">{row.rowNumber}</span> · {code(row)}
                </p>
              </div>
              <Action row={row} />
            </div>
            <p className="mt-1 text-label text-fg-muted">
              <span className="tnum">{quantity(row)}</span> em estoque · custo{" "}
              <span className="tnum">{cost(row)}</span>
            </p>
            <Issue row={row} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

const code = (row: ImportPreviewRow) => row.data.barcode ?? row.data.sku ?? "não veio no arquivo"

function quantity({ data }: ImportPreviewRow) {
  if (data.totalQuantity === undefined) return "não veio"
  return data.unit ? formatQuantity(data.totalQuantity, data.unit) : formatNumber(data.totalQuantity)
}

const cost = ({ data }: ImportPreviewRow) =>
  data.acquisitionCost !== undefined ? formatMoney(data.acquisitionCost) : "não veio"

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <th scope="col" className={cn("px-4 py-2.5 text-label font-medium text-fg-muted", className)}>
      {children}
    </th>
  )
}

function Name({ row }: { row: ImportPreviewRow }) {
  return row.data.name ? (
    <p className="font-medium text-fg">{row.data.name}</p>
  ) : (
    <p className="text-fg-muted italic">sem nome no arquivo</p>
  )
}

function Pick({ row, jobId }: { row: ImportPreviewRow; jobId: string }) {
  if (row.action === "skip") return <span className="sr-only">Fica de fora</span>
  return <RowToggle jobId={jobId} rowNumber={row.rowNumber} excluded={Boolean(row.excluded)} />
}

function Action({ row }: { row: ImportPreviewRow }) {
  if (row.excluded) {
    return (
      <span className="inline-flex shrink-0 rounded-pill border border-line px-2.5 py-0.5 text-label font-medium text-fg-muted">
        Desmarcada
      </span>
    )
  }
  const action = ACTION[row.action]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-pill px-2.5 py-0.5 text-label font-medium",
        action.className,
      )}
    >
      {action.label}
    </span>
  )
}

/**
 * Erro (a linha não entra) em vermelho, pela exceção de 08/10: problema que
 * exige ação. Aviso (a linha entra, mas vale conferir) é neutro. Nenhum dos
 * dois pinta a linha: o fundo vermelho competia com o status de validade.
 */
function Issue({ row }: { row: ImportPreviewRow }) {
  const error = row.issues.find((i) => i.severity === "error")
  const warning = row.issues.find((i) => i.severity === "warning")
  const issue = error ?? warning
  if (!issue) return null

  const Icon = error ? TriangleAlert : CircleAlert
  return (
    <p
      className={cn(
        "mt-1 flex items-start gap-1.5 text-label",
        error ? "text-error-fg" : "text-fg-muted",
      )}
    >
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", error && "text-error")} aria-hidden />
      <span>
        <span className="sr-only">{error ? "Erro: " : "Aviso: "}</span>
        {issue.message}
      </span>
    </p>
  )
}
