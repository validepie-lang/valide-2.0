"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"

/**
 * Aviso ao sair com alterações não salvas (issue 046, item 17), do padrão
 * Saving do Primer (issue 026): quem preencheu meio formulário e clicou num
 * link por engano não perde o que digitou.
 *
 * Envolve o formulário e escuta o que muda dentro dele, sem estado nos
 * campos. Dois caminhos de saída:
 * - link do próprio Valide: a janela do Valide pergunta, e "Sair sem salvar"
 *   segue para o link;
 * - fechar a aba ou recarregar: o aviso do navegador (`beforeunload`), o único
 *   que o navegador permite ali.
 *
 * Link marcado com `data-discard` ("Voltar sem registrar") passa sem
 * perguntar: o texto já diz o que acontece.
 *
 * Só salvar com sucesso zera o aviso (issue 054): até a 053 qualquer `submit`
 * zerava, e um envio recusado pela validação deixava sair sem perguntar.
 * Formulário que grava e fica na mesma tela chama `markSaved`; o que grava e
 * muda de tela (`router.push`) não precisa, porque não passa por link nem
 * fecha a aba.
 */
const SAVED_EVENT = "valide:saved"

/** Avisa o `UnsavedGuard` em volta de `element` que o que estava pendente foi gravado */
export function markSaved(element: Element | null) {
  element?.dispatchEvent(new Event(SAVED_EVENT, { bubbles: true }))
}

export function UnsavedGuard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const dirty = useRef(false)
  const [pending, setPending] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const box = ref.current
    if (!box) return
    const mark = () => {
      dirty.current = true
    }
    const clear = () => {
      dirty.current = false
    }
    // Só `input`: o `change` de campo de texto dispara de novo quando o foco sai dele, e
    // religava o aviso logo depois de salvar (issue 059). Seleção, caixa de marcar e
    // data também disparam `input` nos navegadores atuais
    box.addEventListener("input", mark)
    box.addEventListener(SAVED_EVENT, clear)

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty.current) return
      event.preventDefault()
      event.returnValue = ""
    }
    // Captura: chega antes do Link do Next, que navegaria sem perguntar
    const onClick = (event: MouseEvent) => {
      if (!dirty.current || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null
      // `data-discard`: o próprio link já diz que descarta ("Voltar sem registrar")
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.hasAttribute("data-discard")
      )
        return
      const url = new URL(link.href, location.href)
      if (url.origin !== location.origin || url.pathname + url.search === location.pathname + location.search)
        return
      event.preventDefault()
      event.stopPropagation()
      setPending(url.pathname + url.search + url.hash)
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      box.removeEventListener("input", mark)
      box.removeEventListener(SAVED_EVENT, clear)
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Sair sem salvar?"
        description="O que você preencheu aqui ainda não foi salvo e vai se perder."
      >
        <DialogActions>
          <Button variant="secondary" onClick={() => setPending(null)} data-autofocus>
            Continuar preenchendo
          </Button>
          <Button
            onClick={() => {
              const href = pending
              dirty.current = false
              setPending(null)
              if (href) router.push(href)
            }}
          >
            Sair sem salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
