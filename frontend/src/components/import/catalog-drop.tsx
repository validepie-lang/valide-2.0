"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, FileSpreadsheet, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadFiles, type UploadFile } from "@/components/import/upload-files"
import { finishUpload, openImport, sendImportPart, stopImport } from "@/lib/actions/imports"
import { UNREACHABLE } from "@/lib/actions/result"
import { isLive } from "@/lib/api/config"
import { readCatalog, type CatalogSample } from "@/lib/utils/catalog-read"
import { PART_BYTES, checkCatalogFiles, partCount } from "@/lib/utils/import-draft"
import { cn } from "@/lib/utils/cn"

/**
 * Escolher ou arrastar as planilhas e enviar (issues 056 e 075). A área
 * tracejada com "arraste ou escolha" e os formatos embaixo (File Upload UI,
 * Behance); depois de escolher, cada arquivo numa linha com a barra do envio
 * (Upload Files Design, Behance).
 *
 * Desde a 075: até 5 planilhas (item 37), em partes de 1 MB (itens 35 e 109),
 * com "Cancelar envio" (item 108). No modo de demonstração, o navegador também
 * lê o cabeçalho e as primeiras linhas (item 106); com a API ligada, só envia.
 *
 * Arrastar é atalho de mouse: o caminho de teclado é o botão, que abre o
 * seletor do sistema.
 */
export function CatalogDrop() {
  const input = useRef<HTMLInputElement>(null)
  const canceled = useRef(false)
  const router = useRouter()
  const [over, setOver] = useState(false)
  const [files, setFiles] = useState<UploadFile[] | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function fail(message: string, failedIndex?: number) {
    setError(message)
    setFiles((list) => list?.map((f, i) => (i === failedIndex ? { ...f, failed: true } : f)) ?? null)
    if (input.current) input.current.value = ""
  }

  async function send(list: File[]) {
    if (files && !error) return
    const problem = checkCatalogFiles(list)
    setError(problem)
    if (problem) return
    canceled.current = false
    setFiles(list.map((f) => ({ name: f.name, size: f.size, received: 0, failed: false })))

    const opened = await openImport(list.map((f) => ({ name: f.name, size: f.size }))).catch(
      () => UNREACHABLE,
    )
    if (!opened.ok) return fail(opened.message)
    const id = opened.data.id
    setJobId(id)
    // Só no modo de demonstração: com a API ligada, quem lê o arquivo é o servidor
    const reading = isLive("imports")
      ? null
      : Promise.all(list.map(async (f) => readCatalog(f.name, new Uint8Array(await f.arrayBuffer()))))

    for (const [fileIndex, file] of list.entries()) {
      for (let index = 0; index < partCount(file.size); index++) {
        if (canceled.current) return
        const form = new FormData()
        form.set("importacao", id)
        form.set("arquivo", String(fileIndex))
        form.set("indice", String(index))
        form.set("parte", file.slice(index * PART_BYTES, (index + 1) * PART_BYTES))
        const sent = await sendImportPart(form).catch(() => UNREACHABLE)
        if (!sent.ok) return fail(sent.message, fileIndex)
        setFiles(
          (current) =>
            current?.map((f, i) => (i === fileIndex ? { ...f, received: sent.data.received } : f)) ?? null,
        )
      }
    }
    if (canceled.current) return

    const samples: (CatalogSample | null)[] | undefined = reading ? await reading : undefined
    const read = await finishUpload(id, samples).catch(() => UNREACHABLE)
    if (!read.ok) return fail(read.message)
    const example = samples?.some((s) => s === null) ? "&exemplo=1" : ""
    router.push(`/estoque/importar?passo=mapeamento&importacao=${encodeURIComponent(id)}${example}`)
  }

  async function cancel() {
    canceled.current = true
    if (jobId) await stopImport(jobId).catch(() => UNREACHABLE)
    setFiles(null)
    setJobId(null)
    setError(null)
    if (input.current) input.current.value = ""
    router.push("/estoque/importar?descartada=envio")
  }

  const sending = files !== null && !error

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        void send([...event.dataTransfer.files])
      }}
      className={cn(
        "mt-5 rounded-md border-2 border-dashed px-4 py-10 text-center transition-colors sm:px-6",
        over ? "border-primary bg-primary-soft" : "border-line-strong bg-page",
      )}
    >
      <input
        ref={input}
        type="file"
        multiple
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void send([...(event.target.files ?? [])])}
      />

      {files ? (
        <div className="flex flex-col gap-4" role="status">
          <UploadFiles files={files} />
          {sending ? (
            <Button variant="ghost" className="self-center" onClick={() => void cancel()}>
              <X className="size-4" aria-hidden />
              Cancelar envio
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <UploadCloud className="mx-auto size-7 text-fg-muted" aria-hidden />
          <p className="mt-3 text-body font-medium text-fg">
            Arraste as planilhas aqui, ou escolha no computador
          </p>
          <p className="mt-1 text-label text-fg-muted">
            CSV ou Excel (XLSX), até 5 arquivos e 20 MB. Várias planilhas precisam ter as mesmas colunas.
          </p>
          <Button className="mt-5" onClick={() => input.current?.click()}>
            <FileSpreadsheet className="size-4" aria-hidden />
            Escolher arquivos
          </Button>
        </>
      )}

      {error ? (
        <div className="mx-auto mt-5 flex max-w-md flex-col items-center gap-3">
          <p
            role="alert"
            className="flex w-full items-start gap-2 rounded-sm bg-error-bg px-4 py-3 text-left text-label text-error-fg"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
          {files ? (
            <Button variant="secondary" onClick={() => input.current?.click()}>
              Escolher outros arquivos
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
