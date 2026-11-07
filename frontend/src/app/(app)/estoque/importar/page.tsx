import { PageHeader } from "@/components/layout/page-header"
import { ImportStepper, STEPS, type StepKey } from "@/components/import/import-stepper"
import { StepSource } from "@/components/import/step-source"
import { StepMapping } from "@/components/import/step-mapping"
import { StepReview } from "@/components/import/step-review"
import { StepResult } from "@/components/import/step-result"
import { ImportDrafts } from "@/components/import/import-drafts"
import { SavedBanner } from "@/components/ui/saved-banner"
import {
  getDetectedColumns,
  getImportHistory,
  getImportJob,
  getImportPreview,
  getSuggestedMapping,
  getUnfinishedImports,
  getValideFields,
} from "@/lib/services/imports"
import { isLive } from "@/lib/api/config"
import type { ImportRowFilter } from "@/lib/types"

export const metadata = { title: "Importar produtos" }

/** O filtro da revisão no endereço, em português (issue 075, item 25) */
const FILTER: Record<string, ImportRowFilter> = { erro: "error", aviso: "warning", desmarcadas: "excluded" }
const PER_PAGE = 25

/** A confirmação de quem voltou à primeira tela (issue 075, itens 38 e 108) */
const BANNER: Record<string, string> = {
  rascunho: "Rascunho salvo. Quando voltar, a importação continua de onde parou.",
  descartada: "Importação descartada. Nada foi gravado no estoque.",
  envio: "Envio cancelado. Nada foi gravado no estoque.",
}

const DESCRIPTION: Record<StepKey, string> = {
  origem: "Traga tudo que você já tem, sem digitar produto por produto.",
  mapeamento: "Diga qual coluna do seu arquivo corresponde a cada campo do Valide.",
  revisao: "Confira o que vai entrar antes de confirmar. Nada é gravado até aqui.",
  resultado: "Seus produtos entraram. Falta informar as validades.",
}

export default async function ImportarPage({
  searchParams,
}: {
  searchParams: Promise<{
    passo?: string
    importacao?: string
    filtro?: string
    pagina?: string
    /** `?rascunho=salvo` e `?descartada=1|envio`: a faixa da primeira tela */
    rascunho?: string
    descartada?: string
    /** o navegador não leu o arquivo no modo de demonstração: segue a importação de exemplo */
    exemplo?: string
  }>
}) {
  // `importacao` leva a importação de um passo ao outro (issue 056); sem ela, a de demonstração
  const query = await searchParams
  const { passo, importacao } = query
  const step: StepKey = STEPS.some((s) => s.key === passo) ? (passo as StepKey) : "origem"
  const filter = query.filtro ? FILTER[query.filtro] : undefined
  const page = Math.max(1, Number(query.pagina) || 1)

  const [job, columns, fields, mapping, preview, history, drafts] = await Promise.all([
    getImportJob(importacao),
    getDetectedColumns(importacao),
    getValideFields(),
    getSuggestedMapping(importacao),
    getImportPreview(importacao, { issue: filter, page, perPage: PER_PAGE }),
    getImportHistory(),
    step === "origem" ? getUnfinishedImports() : [],
  ])
  const banner = query.rascunho
    ? BANNER.rascunho
    : query.descartada === "envio"
      ? BANNER.envio
      : query.descartada
        ? BANNER.descartada
        : null

  return (
    <div>
      <PageHeader
        title="Importar produtos"
        description={DESCRIPTION[step]}
        back={{ href: "/estoque", label: "Voltar ao estoque" }}
      />

      {/* Etapas à esquerda e o passo à direita (Multi-Step Form e Inventar, Behance; issue 032) */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <ImportStepper current={step} />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">
          {step === "origem" ? (
            <div className="flex flex-col gap-6">
              {banner ? <SavedBanner closeHref="/estoque/importar">{banner}</SavedBanner> : null}
              <ImportDrafts jobs={drafts} />
              <StepSource />
            </div>
          ) : null}
          {step === "mapeamento" ? (
            <StepMapping
              job={job}
              columns={columns}
              fields={fields}
              mapping={mapping}
              example={Boolean(query.exemplo)}
            />
          ) : null}
          {step === "revisao" ? (
            <StepReview
              job={job}
              rows={preview.data}
              total={preview.meta.total}
              filter={filter ? query.filtro : undefined}
              page={page}
              demoNote={!isLive("imports") && job.updatedRows === 0}
            />
          ) : null}
          {step === "resultado" ? <StepResult job={job} history={history} /> : null}
        </div>
      </div>
    </div>
  )
}
