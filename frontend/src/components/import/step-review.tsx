import { CircleAlert, Save } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { ConfirmImportButton } from "@/components/import/import-run"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { Metric } from "@/components/ui/metric"
import { Chip } from "@/components/products/filter-bar"
import { StockPagination } from "@/components/products/stock-pagination"
import { DiscardImport } from "@/components/import/discard-import"
import { ImportIssuesExport } from "@/components/import/import-issues-export"
import { ReviewRows } from "@/components/import/review-rows"
import { formatNumber } from "@/lib/utils/format"
import type { ImportJob, ImportPreviewRow } from "@/lib/types"

const PER_PAGE = 25

/**
 * Passo 3: revisar. Nada é gravado antes do botão "Importar", que desde a
 * issue 056 confirma de verdade (`ConfirmImportButton`).
 *
 * Os três números ficam direto na página, sem card (SPEC 5.5). O de linhas com
 * problema não é colorido: a cor está nas linhas, onde o usuário age.
 *
 * Issue 075: filtros com a contagem e caixa de marcar em cada linha (item 25),
 * como o Data Table UX/UI (Behance); "Baixar as linhas com problema" (107);
 * "Salvar rascunho" (38) e "Descartar importação" (108).
 */
export function StepReview({
  job,
  rows,
  total,
  filter,
  page,
  demoNote = false,
}: {
  job: ImportJob
  rows: ImportPreviewRow[]
  /** quantas linhas o filtro acha no arquivo inteiro */
  total: number
  /** o filtro do endereço: `erro`, `aviso` ou `desmarcadas` */
  filter?: string
  page: number
  /** modo de demonstração com o arquivo de verdade: a regra de repetido (item 26) não existe ainda */
  demoNote?: boolean
}) {
  const base = `/estoque/importar?passo=revisao&importacao=${encodeURIComponent(job.id)}`
  const chips = [
    { slug: undefined, label: "Todas", count: job.totalRows },
    { slug: "aviso", label: "Com aviso", count: job.warningRows ?? 0 },
    { slug: "erro", label: "Com erro", count: job.errorRows },
    { slug: "desmarcadas", label: "Desmarcadas", count: job.excludedRows ?? 0 },
  ]
  const hrefFor = (p: number) => `${base}${filter ? `&filtro=${filter}` : ""}${p > 1 ? `&pagina=${p}` : ""}`

  return (
    <div className="flex flex-col gap-8">
      {/* Direção A: o indicador principal fica em card; gap-px sobre o fio faz as divisórias */}
      <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line shadow-card sm:grid-cols-3">
        <Metric
          className="bg-surface p-5 md:p-6"
          valueClassName="font-display text-[2.25rem] font-extrabold"
          label="Produtos novos"
          value={formatNumber(job.createdRows)}
          context="Ainda não existem no Valide"
        />
        <Metric
          className="bg-surface p-5 md:p-6"
          valueClassName="font-display text-[2.25rem] font-extrabold"
          label="Produtos atualizados"
          value={formatNumber(job.updatedRows)}
          context="Já existem e serão completados"
        />
        <Metric
          className="bg-surface p-5 md:p-6"
          valueClassName="font-display text-[2.25rem] font-extrabold"
          label="Linhas com problema"
          value={formatNumber(job.errorRows)}
          context="Ficam de fora desta importação"
          muted={job.errorRows === 0}
        />
      </div>

      {demoNote ? (
        <p className="-mt-4 flex gap-2.5 rounded-md bg-sunken p-3.5 text-label text-fg-muted">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          <span>
            Na demonstração, toda linha aparece como produto novo: a regra que reconhece um produto que já
            existe ainda está em decisão com a equipe.
          </span>
        </p>
      ) : null}

      <Card className="p-0 md:p-0">
        <div className="flex flex-col gap-4 p-4 md:px-6 md:pt-6 md:pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>O que vai entrar</CardTitle>
              <CardSubtitle>
                {total === 0 ? (
                  "Nenhuma linha neste filtro."
                ) : (
                  <>
                    Mostrando <span className="tnum">{formatNumber(rows.length)}</span> de{" "}
                    <span className="tnum">{formatNumber(total)}</span> linhas
                    {page === 1 && rows.length < PER_PAGE && rows.length < total
                      ? ", as primeiras do arquivo (a demonstração não mostra todas)"
                      : ""}
                    . Desmarque o que não deve entrar.
                  </>
                )}
              </CardSubtitle>
            </div>
            {job.errorRows + (job.warningRows ?? 0) > 0 ? <ImportIssuesExport jobId={job.id} /> : null}
          </div>
          <nav aria-label="Filtrar as linhas">
            <ul className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.label}>
                  <Chip href={c.slug ? `${base}&filtro=${c.slug}` : base} active={filter === c.slug}>
                    {c.label}
                    <span className="tnum font-medium">{formatNumber(c.count)}</span>
                  </Chip>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-line">
          {rows.length > 0 ? (
            <ReviewRows rows={rows} jobId={job.id} />
          ) : (
            <p className="px-4 py-6 text-body text-fg-muted md:px-6">
              {total > 0
                ? "Na demonstração, só as primeiras linhas do arquivo aparecem aqui."
                : "Nada para mostrar neste filtro."}
            </p>
          )}
        </div>
        {/* Só quando há mesmo outra página: na demonstração, a prévia tem só as primeiras linhas */}
        {total > PER_PAGE && (rows.length === PER_PAGE || page > 1) ? (
          <StockPagination
            page={page}
            perPage={PER_PAGE}
            total={total}
            noun={["linha", "linhas"]}
            label="Páginas da revisão"
            hrefFor={hrefFor}
          />
        ) : null}
      </Card>

      {/* No celular o primário vem primeiro, os dois na largura inteira */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <LinkButton
            href={`/estoque/importar?passo=mapeamento&importacao=${encodeURIComponent(job.id)}`}
            variant="ghost"
          >
            Voltar
          </LinkButton>
          <DiscardImport jobId={job.id} />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start">
          {/* As desmarcadas já ficam no servidor: salvar o rascunho é só sair daqui */}
          <LinkButton href="/estoque/importar?rascunho=salvo" variant="secondary">
            <Save className="size-4" aria-hidden />
            Salvar rascunho
          </LinkButton>
          <ConfirmImportButton jobId={job.id} rows={job.validRows} />
        </div>
      </div>
    </div>
  )
}
