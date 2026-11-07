/**
 * Bip e vibração ao ler um código (issue 074, item 84), como o leitor do
 * caixa: um bip agudo quando achou o produto, dois graves quando não achou.
 * Quem confere uma caixa não precisa olhar a tela a cada leitura.
 *
 * O som é gerado na hora (Web Audio), sem arquivo. O navegador só deixa tocar
 * depois de um gesto da pessoa nesta aba, então `unlockScanSound` roda no
 * primeiro toque ou tecla na busca e no botão da câmera. Recarregar a página
 * não bipa: o som é resposta a uma leitura, não a uma tela aberta.
 *
 * A preferência ("Bip ao ler") é do aparelho, como o volume do leitor do
 * caixa: fica no `localStorage`, ligada por padrão.
 */

const PREFERENCE_KEY = "valide_bip"
const listeners = new Set<() => void>()
let context: AudioContext | null = null

export function scanSoundEnabled(): boolean {
  try {
    return localStorage.getItem(PREFERENCE_KEY) !== "off"
  } catch {
    return true
  }
}

export function setScanSound(on: boolean) {
  try {
    localStorage.setItem(PREFERENCE_KEY, on ? "on" : "off")
  } catch {
    // navegador sem armazenamento: vale só nesta tela
  }
  listeners.forEach((listener) => listener())
}

export function subscribeScanSound(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Chamar dentro de um gesto (tecla, toque, clique): é o que libera o som nesta aba */
export function unlockScanSound() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return
  context ??= new AudioContext()
  if (context.state === "suspended") void context.resume()
}

function tone(ctx: AudioContext, frequency: number, start: number, length: number) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = "square"
  oscillator.frequency.value = frequency
  // Volume baixo e sem estalo no começo e no fim
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + length + 0.02)
}

/** `found`: um bip agudo e curto. `missing`: dois graves. Devolve se tocou */
export function signalScan(kind: "found" | "missing"): boolean {
  if (!scanSoundEnabled() || !context || context.state !== "running") return false
  const now = context.currentTime
  if (kind === "found") {
    tone(context, 1760, now, 0.09)
    navigator.vibrate?.(40)
  } else {
    tone(context, 330, now, 0.12)
    tone(context, 247, now + 0.18, 0.16)
    navigator.vibrate?.([60, 60, 60])
  }
  return true
}
