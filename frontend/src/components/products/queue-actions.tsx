import { Check, CornerDownLeft, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubmitLabel } from "@/components/ui/form-status"
import { QUEUE_FORM_ID } from "@/components/products/queue-lot-fields"

/** Salvar e pular, com a dica do teclado: quem preenche 400 itens não usa mouse */
export function QueueActions({ saving, onSkip }: { saving: boolean; onSkip: () => void }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <Button type="submit" form={QUEUE_FORM_ID} size="lg" className="w-full sm:w-auto" aria-busy={saving}>
        <SubmitLabel saving={saving} icon={Check}>
          Salvar e ir para o próximo
        </SubmitLabel>
      </Button>
      <Button onClick={onSkip} variant="secondary" size="lg" className="w-full sm:w-auto">
        <SkipForward className="size-4" aria-hidden />
        Pular este
      </Button>
      <p className="ml-auto hidden items-center gap-1.5 text-label text-fg-muted sm:flex">
        <kbd className="rounded-sm border border-line bg-surface px-1.5 py-0.5 font-sans text-label">Tab</kbd>
        entre campos,
        <kbd className="inline-flex items-center gap-1 rounded-sm border border-line bg-surface px-1.5 py-0.5 font-sans text-label">
          <CornerDownLeft className="size-3" aria-hidden />
          Enter
        </kbd>
        salva e avança
      </p>
    </div>
  )
}
