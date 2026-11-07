import Link from "next/link"
import { CircleAlert, FileSpreadsheet } from "lucide-react"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { MappingForm } from "@/components/import/mapping-form"
import { formatNumber } from "@/lib/utils/format"
import type { VALIDE_FIELDS, DETECTED_COLUMNS } from "@/lib/mocks/imports"
import type { ImportJob } from "@/lib/types"

/**
 * Passo 2: mapear colunas.
 *
 * A prévia de três linhas ao lado de cada coluna existe para o usuário conferir
 * que pegou a coluna certa. Sem ela, o mapeamento é adivinhação. As escolhas
 * e o envio moram em `MappingForm` (issue 056).
 */
export function StepMapping({
  job,
  columns,
  fields,
  mapping,
  example = false,
}: {
  job: ImportJob
  columns: typeof DETECTED_COLUMNS
  fields: typeof VALIDE_FIELDS
  mapping: Record<string, string>
  /** modo de demonstração em que o navegador não conseguiu ler o arquivo (issue 075, item 106) */
  example?: boolean
}) {
  const mapped = Object.values(mapping).filter(Boolean).length

  return (
    <Card>
      {/* O arquivo escolhido numa linha, como nas referências de envio do Behance
          (File Upload UI, Upload Files Design): nome, tamanho e trocar. Até aqui
          o resumo ficava num card à parte, na coluna da direita (issue 032) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-line bg-page px-4 py-3">
        <FileSpreadsheet className="size-5 shrink-0 text-fg-muted" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-fg">{job.fileName}</p>
          <p className="text-label text-fg-muted">
            <span className="tnum">{formatNumber(job.totalRows)}</span> linhas ·{" "}
            <span className="tnum">{formatNumber(columns.length)}</span> colunas,{" "}
            <span className="tnum">{formatNumber(mapped)}</span> já reconhecidas
          </p>
        </div>
        <Link
          href="/estoque/importar?passo=origem"
          className="inline-flex min-h-11 items-center text-label font-semibold text-fg underline-offset-4 hover:underline md:min-h-0"
        >
          Trocar arquivo
        </Link>
      </div>

      {example ? (
        <p className="mt-4 flex gap-2.5 rounded-md bg-sunken p-3.5 text-label text-fg-muted">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          <span>
            Na demonstração não deu para ler este arquivo aqui no navegador. As colunas abaixo são as da
            importação de exemplo; com o Valide ligado ao servidor, aparecem as do seu arquivo.
          </span>
        </p>
      ) : null}

      <div className="mt-6">
        <CardTitle>Confira o que é cada coluna</CardTitle>
        <CardSubtitle>
          Já preenchemos o que deu para reconhecer. Corrija o que estiver errado e deixe em branco o que não
          interessa.
        </CardSubtitle>
      </div>

      <MappingForm jobId={job.id} columns={columns} fields={fields} initial={mapping} />
    </Card>
  )
}
