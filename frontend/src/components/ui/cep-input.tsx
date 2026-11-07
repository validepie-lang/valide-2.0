"use client"

import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/field"
import { lookupCep } from "@/lib/services/cep"
import { cepDigits, type CepAddress } from "@/lib/utils/cep"

type Targets = Partial<Record<keyof CepAddress, string>>

const MESSAGE = {
  searching: "Buscando o endereço…",
  filled: "Endereço preenchido pelo CEP. Confira e informe o número.",
  not_found: "Não achamos este CEP. Confira os números ou preencha o endereço.",
  unreachable: "Não foi possível buscar o CEP agora. Preencha o endereço.",
} as const

/** Troca o valor de um campo sem estado e avisa o formulário, como se a pessoa tivesse digitado */
function fillField(id: string, value: string) {
  const el = document.getElementById(id)
  if (!(el instanceof HTMLInputElement) || !value) return
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
}

/**
 * CEP que preenche o endereço (issue 063), como recomenda o Baymard: ao chegar
 * a 8 números, busca e preenche só o que veio; os campos continuam editáveis.
 * O foco fica no CEP (mudar o foco sozinho desorienta) e a mensagem embaixo é
 * anunciada. Se a busca falha, diz e deixa digitar: nunca bloqueia o cadastro.
 *
 * `targets` são os ids dos campos de endereço da tela que usa o componente.
 */
export function CepInput({
  targets,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; targets: Targets }) {
  const [state, setState] = useState<keyof typeof MESSAGE | null>(null)
  const last = useRef(cepDigits(String(props.defaultValue ?? "")))
  const statusId = `${props.id}-busca`

  async function search(value: string) {
    const digits = cepDigits(value)
    if (digits.length !== 8 || digits === last.current) return
    last.current = digits
    setState("searching")
    const result = await lookupCep(digits)
    // A pessoa mudou o CEP enquanto buscava: esta resposta já não vale
    if (last.current !== digits) return
    if (!result.ok) return setState(result.reason)
    for (const [key, id] of Object.entries(targets) as [keyof CepAddress, string][]) {
      fillField(id, result.address[key])
    }
    setState("filled")
  }

  const describedBy = [props["aria-describedby"], state ? statusId : null].filter(Boolean).join(" ")

  return (
    <>
      <Input
        {...props}
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={10}
        aria-describedby={describedBy || undefined}
        onChange={(event) => {
          props.onChange?.(event)
          void search(event.target.value)
        }}
      />
      {/* Sempre na página, para o leitor de tela anunciar a troca; vazio, fica só para ele */}
      <p
        id={statusId}
        role="status"
        className={state ? "flex items-center gap-1.5 text-label text-fg-muted" : "sr-only"}
      >
        {state === "searching" ? (
          <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : null}
        {state ? MESSAGE[state] : null}
      </p>
    </>
  )
}
