import { ArrowRight, FileClock } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { DiscardImport } from "@/components/import/discard-import"
import { formatEventTime, formatNumber } from "@/lib/utils/format"
import type { ImportJob } from "@/lib/types"

const WHERE: Partial<Record<ImportJob["status"], { label: string; step: string | null }>> = {
  uploading: { label: "o envio não terminou", step: null },
  mapping: { label: "parou em Confira as colunas", step: "mapeamento" },
  previewing: { label: "colunas conferidas, falta revisar", step: "revisao" },
}

/**
 * As importações paradas no meio (issue 075, item 38), no alto da primeira
 * tela, como o "Save as Draft" do Inventar (Behance) pede: quem salvou o
 * rascunho volta e continua de onde parou, ou descarta.
 */
export function ImportDrafts({ jobs }: { jobs: ImportJob[] }) {
  if (jobs.length === 0) return null
  return (
    <section aria-labelledby="importacao-parada" className="flex flex-col gap-3">
      <h2 id="importacao-parada" className="font-display text-section font-bold text-fg">
        {jobs.length === 1 ? "Importação não terminada" : "Importações não terminadas"}
      </h2>
      {jobs.map((job) => {
        const where = WHERE[job.status] ?? { label: "parou no meio", step: null }
        return (
          <div
            key={job.id}
            className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center md:p-5"
          >
            <FileClock className="hidden size-5 shrink-0 text-fg-muted sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-fg">{job.fileName}</p>
              <p className="mt-0.5 text-label text-fg-muted">
                {formatEventTime(job.createdAt)} · {where.label}
                {job.totalRows > 0 && where.step ? (
                  <>
                    {" "}
                    · <span className="tnum">{formatNumber(job.totalRows)}</span> linhas
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DiscardImport jobId={job.id} />
              {where.step ? (
                <LinkButton
                  href={`/estoque/importar?passo=${where.step}&importacao=${encodeURIComponent(job.id)}`}
                  variant="secondary"
                >
                  Continuar
                  <ArrowRight className="size-4" aria-hidden />
                </LinkButton>
              ) : null}
            </div>
          </div>
        )
      })}
    </section>
  )
}
