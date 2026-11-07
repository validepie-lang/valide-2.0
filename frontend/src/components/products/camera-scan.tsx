"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions } from "@/components/ui/dialog"

/** O que o navegador expõe em `window.BarcodeDetector` (Chrome no Android, macOS e Windows) */
type Detector = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> }
type DetectorClass = new (options: { formats: string[] }) => Detector

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"]

function hasCamera(): boolean {
  return typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia)
}

/**
 * O leitor do navegador, quando existe; senão (Safari no iPhone, Firefox), o
 * ZXing, carregado só agora que a câmera abriu (issue 074, item 94). Lê os
 * códigos de barras de produto (EAN, UPC e Code 128), que é o que a farmácia
 * bipa; o leitor só de códigos lineares é bem menor que o completo.
 */
async function makeDetector(): Promise<Detector> {
  const Native = (window as unknown as { BarcodeDetector?: DetectorClass }).BarcodeDetector
  if (Native) return new Native({ formats: FORMATS })
  const { BrowserCodeReader, BrowserMultiFormatOneDReader } = await import("@zxing/browser")
  const reader = new BrowserMultiFormatOneDReader()
  return {
    detect: async (video) => {
      try {
        const result = reader.decodeFromCanvas(BrowserCodeReader.createCanvasFromMediaElement(video))
        return [{ rawValue: result.getText() }]
      } catch {
        // nenhum código neste quadro
        return []
      }
    },
  }
}

/**
 * Ler o código de barras pela câmera (issue 049, item 20), como a tela "Scan
 * Product Barcode" do Inventar e o "Scan QR" do Mobile App For Inventory
 * (Behance): a imagem da câmera com a moldura no meio e "Lendo o código…".
 *
 * Usa o leitor do próprio navegador (`BarcodeDetector`) e, desde a issue 074,
 * o ZXing onde ele não existe (Safari, Firefox): o botão aparece em todo
 * navegador com câmera. Leu, fecha a câmera e busca o código, como se tivesse
 * bipado.
 */
/** `action`: a busca que recebe o código lido (entrada geral ou saída geral, issue 063) */
export function CameraScan({ action = "/estoque/entrada" }: { action?: string }) {
  // No servidor, sem câmera; no navegador, o que ele suporta. Sem efeito para acertar depois
  const supported = useSyncExternalStore(
    () => () => {},
    hasCamera,
    () => false,
  )
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    let stream: MediaStream | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false
    let detector: Detector | null = null

    const tick = async () => {
      if (stopped || !video.current || !detector) return
      try {
        const [found] = await detector.detect(video.current)
        if (found?.rawValue) {
          stopped = true
          setOpen(false)
          router.push(`${action}?busca=${encodeURIComponent(found.rawValue)}`)
          return
        }
      } catch {
        // quadro ainda sem imagem: tenta no próximo
      }
      timer = setTimeout(tick, 250)
    }

    Promise.all([
      makeDetector(),
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }),
    ])
      .then(([d, s]) => {
        detector = d
        stream = s
        if (stopped || !video.current) return
        video.current.srcObject = s
        setReady(true)
        void video.current.play().then(tick)
      })
      .catch(() =>
        setError(
          "Não foi possível abrir a câmera. Libere o acesso à câmera nas permissões do navegador, ou digite o número.",
        ),
      )

    return () => {
      stopped = true
      clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
      setReady(false)
    }
  }, [open, router, action])

  if (!supported) return null

  return (
    <>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
      >
        <Camera className="size-4" aria-hidden />
        Ler pela câmera
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Ler o código de barras"
        description="Aponte a câmera para o código da caixa. Ao ler, o produto abre sozinho."
      >
        <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-md bg-rail">
          {error ? (
            <p
              role="alert"
              className="absolute inset-0 grid place-items-center p-6 text-center text-body text-rail-fg"
            >
              {error}
            </p>
          ) : (
            <>
              <video ref={video} muted playsInline className="size-full object-cover" />
              {/* A moldura do Inventar, com o resto escurecido; branca: verde é cor de validade */}
              <span
                aria-hidden
                className="absolute inset-x-[12%] top-1/2 h-[38%] -translate-y-1/2 rounded-md border-2 border-white shadow-[0_0_0_999px_rgb(0_0_0/0.5)]"
              />
              <p
                aria-live="polite"
                className="absolute inset-x-0 top-4 text-center text-label font-semibold text-white"
              >
                {ready ? "Lendo o código…" : "Abrindo a câmera…"}
              </p>
            </>
          )}
        </div>
        <DialogActions>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Digitar o número
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
