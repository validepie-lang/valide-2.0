"use client"

import { useEffect, useSyncExternalStore } from "react"
import Form from "next/form"
import { Volume2, VolumeX } from "lucide-react"
import {
  scanSoundEnabled,
  setScanSound,
  signalScan,
  subscribeScanSound,
  unlockScanSound,
} from "@/components/products/scan-feedback"

/**
 * Toca o sinal da leitura quando a tela de resultado chega (issue 074, item
 * 84). `signalKey` muda a cada leitura, para dois códigos seguidos bipar duas
 * vezes mesmo caindo na mesma tela.
 */
export function ScanSignal({ kind, signalKey }: { kind: "found" | "missing"; signalKey: string }) {
  useEffect(() => {
    // A mesma leitura não bipa duas vezes (a tela pode montar de novo logo em seguida)
    const now = Date.now()
    if (last.key === signalKey && now - last.at < 1500) return
    if (signalScan(kind)) Object.assign(last, { key: signalKey, at: now })
  }, [kind, signalKey])
  return null
}

const last = { key: "", at: 0 }

/** "Bip ao ler", ligado ou desligado neste aparelho */
export function ScanSoundToggle() {
  const on = useSyncExternalStore(subscribeScanSound, scanSoundEnabled, () => true)
  const Icon = on ? Volume2 : VolumeX
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setScanSound(!on)}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-label font-medium text-fg-muted transition-colors hover:bg-primary-soft hover:text-fg"
    >
      <Icon className="size-4" aria-hidden />
      Bip ao ler: {on ? "ligado" : "desligado"}
    </button>
  )
}

/**
 * A busca da entrada e da saída geral (issues 042 e 063) com o `Form` do Next:
 * a busca troca de tela sem recarregar a página, então o som liberado na
 * primeira tecla ou toque continua liberado quando o resultado chega.
 */
export function ScanSearchForm({
  action,
  className,
  children,
}: {
  action: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Form
      action={action}
      role="search"
      className={className}
      onKeyDownCapture={unlockScanSound}
      onPointerDownCapture={unlockScanSound}
    >
      {children}
    </Form>
  )
}
