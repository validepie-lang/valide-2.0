"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, CircleAlert, Save } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { Select } from "@/components/ui/field"
import { FormFailure, SubmitLabel } from "@/components/ui/form-status"
import { DiscardImport } from "@/components/import/discard-import"
import { saveMapping } from "@/lib/actions/imports"
import { UNREACHABLE } from "@/lib/actions/result"
import { hasMappingErrors, validateMapping } from "@/lib/utils/import-draft"
import { cn } from "@/lib/utils/cn"

type Column = { name: string; samples: string[] }
type ValideField = { key: string; label: string; required: boolean }

/**
 * As colunas do arquivo e o campo do Valide de cada uma (issue 032), com as
 * escolhas valendo desde a issue 056: "Continuar" confere (o nome do produto
 * em alguma coluna, cada campo numa coluna só) e grava o mapeamento no
 * servidor antes da revisão, que é calculada a partir dele.
 *
 * Issue 075: "Salvar rascunho" grava o mapeamento e volta à primeira tela,
 * onde a importação espera para continuar (item 38); "Descartar importação"
 * some com ela (item 108).
 */
export function MappingForm({
  jobId,
  columns,
  fields,
  initial,
}: {
  jobId: string
  columns: Column[]
  fields: readonly ValideField[]
  initial: Record<string, string>
}) {
  const router = useRouter()
  const [mapping, setMapping] = useState(initial)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState<"next" | "draft" | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const names = columns.map((c) => c.name)
  const errors = attempted
    ? validateMapping(mapping, names, fields)
    : { columns: {} as Record<string, string> }
  const bringsExpiry = Object.values(mapping).includes("expiresAt")

  async function save(draft = false) {
    if (saving) return
    const invalid = validateMapping(mapping, names, fields)
    setAttempted(true)
    setFailure(null)
    if (hasMappingErrors(invalid)) {
      const column = names.find((name) => invalid.columns[name]) ?? names[0]
      document.getElementById(`map-${column}`)?.focus()
      return
    }
    setSaving(draft ? "draft" : "next")
    const result = await saveMapping(jobId, mapping).catch(() => UNREACHABLE)
    if (!result.ok) {
      setSaving(null)
      setFailure(result.message)
      return
    }
    router.push(
      draft
        ? "/estoque/importar?rascunho=salvo"
        : `/estoque/importar?passo=revisao&importacao=${encodeURIComponent(jobId)}`,
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {columns.map((column) => {
          const error = errors.columns[column.name]
          const id = `map-${column.name}`
          return (
            <li key={column.name} className="grid gap-3 py-4 sm:grid-cols-2 sm:gap-6">
              <div className="min-w-0">
                <p className="text-body font-medium text-fg">{column.name}</p>
                <p className="mt-1 truncate text-micro text-fg-muted">{column.samples.join(" · ")}</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="mt-3.5 hidden size-4 shrink-0 text-fg-disabled sm:block" aria-hidden />
                <label htmlFor={id} className="sr-only">
                  Campo do Valide para a coluna {column.name}
                </label>
                {/* O flex-1 vai no invólucro: no Select ele ia para o <select>, dentro de uma div
                    que não crescia, e em 360 o campo ficava pela metade (ficou de fora, item 27) */}
                <div className="min-w-0 flex-1">
                  <Select
                    id={id}
                    value={mapping[column.name] ?? ""}
                    onChange={(e) => setMapping((current) => ({ ...current, [column.name]: e.target.value }))}
                    disabled={saving !== null}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-mensagem` : undefined}
                    className={cn(error && "border-error hover:border-error")}
                  >
                    <option value="">Não importar esta coluna</option>
                    {fields.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                        {field.required ? " (obrigatório)" : ""}
                      </option>
                    ))}
                  </Select>
                  {error ? (
                    <p
                      id={`${id}-mensagem`}
                      className="mt-1.5 flex items-start gap-1.5 text-label text-error-fg"
                    >
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      {error}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Só quando o arquivo não traz validade: com a coluna escolhida, o aviso mentiria */}
      {!bringsExpiry ? (
        <p className="mt-5 flex gap-2.5 rounded-md bg-sunken p-3.5 text-label text-fg-muted">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold text-fg">Este arquivo não traz lote nem validade.</span> É o
            normal: o sistema da loja controla estoque, não vencimento. Os produtos entram como Sem validade
            e, logo depois, você informa as datas numa fila rápida.
          </span>
        </p>
      ) : null}

      {errors.general ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-sm bg-error-bg px-4 py-3 text-label text-error-fg"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{errors.general}</span>
        </p>
      ) : null}
      {failure ? <FormFailure message={failure} className="mt-5" /> : null}

      {/* Ações no fim do passo: voltar como texto, avançar como botão (Multi-Step Form, Inventar) */}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <LinkButton href="/estoque/importar?passo=origem" variant="ghost">
            Voltar
          </LinkButton>
          <DiscardImport jobId={jobId} />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button variant="secondary" onClick={() => void save(true)} aria-busy={saving === "draft"}>
            <SubmitLabel saving={saving === "draft"} icon={Save}>
              Salvar rascunho
            </SubmitLabel>
          </Button>
          <Button type="submit" size="lg" aria-busy={saving === "next"}>
            <SubmitLabel saving={saving === "next"} icon={ArrowRight} iconAfter>
              Continuar para a revisão
            </SubmitLabel>
          </Button>
        </div>
      </div>
    </form>
  )
}
