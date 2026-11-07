import { ArrowRight, CheckCircle2, CircleX } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { ImportRunning } from "@/components/import/import-run"
import { ImportIssuesExport } from "@/components/import/import-issues-export"
import { formatEventTime, formatNumber } from "@/lib/utils/format"
import { SOURCE_LABEL, type ImportJob } from "@/lib/types"

/**
 * Passo 4: resultado.
 *
 * A ação primária é a fila de validades: terminar a importação sem apontar para
 * ela é deixar o cliente com produtos que o painel ainda não consegue vigiar.
 *
 * Sem verde (verde é No prazo, não "deu certo"), sem degradê e sem barra de
 * progresso: numa importação que terminou, uma barra em 98% parece travada.
 */
export function StepResult({ job, history }: { job: ImportJob; history: ImportJob[] }) {
  // Desde a issue 056 o resultado acompanha a importação: rodando, falhou ou concluída
  const running = job.status === "running" || job.status === "pending"
  return (
    <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-2">
        {running ? <ImportRunning jobId={job.id} fileName={job.fileName} /> : null}
        {job.status === "canceled" ? (
          // Issue 075 (item 108): cancelada antes de confirmar ou desfeita no meio
          <section className="flex items-start gap-3 rounded-md border border-line bg-surface p-5 shadow-card md:p-7">
            <CircleX className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden />
            <div className="min-w-0">
              <h2 className="font-display text-section font-bold text-fg">Importação cancelada</h2>
              <p className="mt-1 text-body text-fg-muted">
                Nenhum produto de {job.fileName ?? "o arquivo"} entrou no estoque. O que tinha sido gravado
                foi desfeito.
              </p>
              <LinkButton href="/estoque/importar?passo=origem" variant="secondary" className="mt-4">
                Começar outra importação
              </LinkButton>
            </div>
          </section>
        ) : null}
        {job.status === "failed" ? (
          <section className="flex items-start gap-3 rounded-md border border-line bg-surface p-5 shadow-card md:p-7">
            <CircleX className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden />
            <div className="min-w-0">
              <h2 className="font-display text-section font-bold text-fg">A importação não terminou</h2>
              <p className="mt-1 text-body text-fg-muted">
                Nenhum produto de {job.fileName ?? "o arquivo"} entrou no estoque. Envie o arquivo de novo; se
                falhar outra vez, exporte a lista de novo no seu sistema.
              </p>
              <LinkButton href="/estoque/importar?passo=origem" variant="secondary" className="mt-4">
                Enviar de novo
              </LinkButton>
            </div>
          </section>
        ) : null}
        {running || job.status === "failed" || job.status === "canceled" ? null : (
          <>
            <section className="flex items-start gap-3 rounded-md border border-line bg-surface p-5 shadow-card md:p-7">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden />
              <div className="min-w-0">
                <h2 className="font-display text-section font-bold text-fg">Importação concluída</h2>
                <p className="mt-1 text-body text-fg-muted">
                  <span className="tnum">{formatNumber(job.createdRows)}</span> produtos criados e{" "}
                  <span className="tnum">{formatNumber(job.updatedRows)}</span> atualizados a partir de{" "}
                  {job.fileName}.
                </p>
                {job.errorRows > 0 ? (
                  // A planilha das linhas com problema voltou na issue 075 (item 107)
                  <>
                    <p className="mt-3 text-body text-fg-muted">
                      <span className="tnum">{formatNumber(job.errorRows)}</span> de{" "}
                      <span className="tnum">{formatNumber(job.totalRows)}</span> linhas ficaram de fora. A
                      planilha diz o motivo de cada uma, para corrigir no seu sistema e importar de novo.
                    </p>
                    <div className="mt-3">
                      <ImportIssuesExport jobId={job.id} />
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            {/* O passo que faz o produto funcionar */}
            <section className="mt-5 rounded-md border border-line border-t-[5px] border-t-primary bg-surface p-5 shadow-card md:p-7">
              <h2 className="font-display text-section font-bold text-fg">Agora informe as validades</h2>
              <p className="mt-1 max-w-xl text-body text-fg-muted">
                Sem data de vencimento, o painel ainda não consegue avisar nada. A fila mostra um produto por
                vez, com três campos, e começa pelos de maior valor.
              </p>
              <LinkButton href="/estoque/validades-pendentes" size="lg" className="mt-5">
                Começar a informar validades
                <ArrowRight className="size-4" aria-hidden />
              </LinkButton>
            </section>
          </>
        )}
      </div>

      <section
        aria-labelledby="importacoes-anteriores"
        className="self-start overflow-hidden rounded-md border border-line bg-surface shadow-card"
      >
        <h2
          id="importacoes-anteriores"
          className="border-b border-line px-5 py-4 font-display text-section font-bold text-fg"
        >
          Importações anteriores
        </h2>
        <ul className="divide-y divide-line">
          {history.map((item) => {
            const failed = item.status === "failed" || item.status === "canceled"
            return (
              <li key={item.id} className="px-5 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-body text-fg">
                    {item.fileName ?? SOURCE_LABEL[item.source]}
                  </p>
                  {failed ? (
                    <span className="inline-flex shrink-0 items-center gap-1 self-center text-label font-medium text-fg">
                      <CircleX className="size-3.5" aria-hidden />
                      {item.status === "canceled" ? "Cancelada" : "Falhou"}
                    </span>
                  ) : (
                    <span className="shrink-0 text-label text-fg-muted">Concluída</span>
                  )}
                </div>
                <p className="mt-0.5 text-label text-fg-muted">
                  {formatEventTime(item.createdAt)} ·{" "}
                  {failed ? (
                    "nenhum produto entrou"
                  ) : (
                    <>
                      <span className="tnum">{formatNumber(item.createdRows)}</span> criados,{" "}
                      <span className="tnum">{formatNumber(item.updatedRows)}</span> atualizados
                    </>
                  )}
                </p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
