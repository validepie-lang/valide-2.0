"use client"

import { useRef, useState } from "react"
import { ImageIcon, ImageUp, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { FormFailure, SavedNote } from "@/components/ui/form-status"
import { deletePhoto, sendPhoto } from "@/lib/actions/product-extras"
import { UNREACHABLE } from "@/lib/actions/result"
import { PHOTO_TYPES, photoFileError } from "@/lib/utils/product-extras"

/**
 * Foto do produto (issue 070, item 13), no alto da coluna da direita, como
 * no Inventar e no Ecommerce Product Details (Behance). Quem edita envia,
 * troca e remove; o tipo e o tamanho são conferidos antes de enviar. Sem
 * foto, quem não edita não vê o cartão: um quadro vazio não lhe diz nada.
 */
export function ProductPhoto({
  productId,
  productName,
  photoUrl,
  canEdit,
}: {
  productId: string
  productName: string
  photoUrl: string | null
  canEdit: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(photoUrl)
  const [busy, setBusy] = useState<"sending" | "removing" | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  if (!url && !canEdit) return null

  async function send(file: File) {
    setDone(null)
    const invalid = photoFileError(file)
    if (invalid) return setFailure(invalid)
    setFailure(null)
    setBusy("sending")
    const form = new FormData()
    form.set("foto", file)
    const result = await sendPhoto(productId, form).catch(() => UNREACHABLE)
    setBusy(null)
    if (!result.ok) return setFailure(result.message)
    // O simulado não guarda: mostra a foto escolhida, que já está no navegador
    setUrl(result.data.photoUrl ?? URL.createObjectURL(file))
    setDone(url ? "Foto trocada." : "Foto enviada.")
  }

  async function remove() {
    setDone(null)
    setFailure(null)
    setBusy("removing")
    const result = await deletePhoto(productId).catch(() => UNREACHABLE)
    setBusy(null)
    if (!result.ok) return setFailure(result.message)
    setUrl(null)
    setDone("Foto removida.")
  }

  return (
    <section
      aria-label="Foto do produto"
      className="overflow-hidden rounded-md border border-line bg-surface shadow-card"
    >
      {/* Sem foto, uma faixa baixa: o quadro vazio empurrava o cartão Estoque para baixo */}
      <div className={cn("relative bg-sunken", url ? "aspect-[4/3]" : "h-24")}>
        {url ? (
          // A foto vem do servidor do Pedro ou do próprio navegador (simulado): o otimizador do Next não alcança
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`Foto de ${productName}`} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-fg-muted">
            <span className="flex items-center gap-2 text-label">
              <ImageIcon className="size-6" strokeWidth={1.5} aria-hidden />
              Sem foto
            </span>
          </div>
        )}
        {busy === "sending" ? (
          <div className="absolute inset-0 grid place-items-center bg-surface/70">
            <Loader2 className="size-6 animate-spin text-fg motion-reduce:animate-none" aria-hidden />
          </div>
        ) : null}
      </div>

      {canEdit ? (
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 md:px-6">
          <input
            ref={input}
            type="file"
            accept={PHOTO_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) void send(file)
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              aria-busy={busy === "sending"}
              onClick={() => input.current?.click()}
            >
              <ImageUp className="size-4" aria-hidden />
              {busy === "sending" ? "Enviando…" : url ? "Trocar foto" : "Enviar foto"}
            </Button>
            {url ? (
              <Button variant="ghost" size="sm" aria-busy={busy === "removing"} onClick={() => void remove()}>
                <Trash2 className="size-4" aria-hidden />
                {busy === "removing" ? "Removendo…" : "Remover"}
              </Button>
            ) : null}
          </div>
          <p className="text-label text-fg-muted">JPG, PNG ou WebP, até 2 MB.</p>
          {failure ? <FormFailure message={failure} after="A foto de antes continua." /> : null}
          <SavedNote message={done} />
        </div>
      ) : null}
    </section>
  )
}
