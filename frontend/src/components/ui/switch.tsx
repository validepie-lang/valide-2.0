import { cn } from "@/lib/utils/cn"

/**
 * Interruptor (issue 044), da tela Settings do Pharmly (Behance): ligado e
 * desligado numa pílula à direita da linha.
 *
 * É a caixa de seleção do navegador com `role="switch"`: Espaço liga e
 * desliga, o leitor de tela diz "ligado" ou "desligado", e o valor vai no
 * formulário sem estado nenhum. Ligado usa a cor de ação, nunca o verde: verde
 * é No prazo (CLAUDE.md, regra 1).
 *
 * Com `checked` e `onChange`, o estado é de quem usa (issue 059: cada toque
 * grava, e uma recusa do servidor volta o interruptor).
 */
export function Switch({
  id,
  name,
  defaultChecked,
  checked,
  onChange,
  disabled,
  describedBy,
  className,
}: {
  id: string
  name: string
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  describedBy?: string
  className?: string
}) {
  return (
    <span className={cn("relative inline-flex h-7 w-12 shrink-0", className)}>
      <input
        id={id}
        name={name}
        type="checkbox"
        role="switch"
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        disabled={disabled}
        aria-describedby={describedBy}
        className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-wait"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-pill border border-line-strong bg-sunken transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 left-1 size-5 rounded-pill bg-surface shadow-xs transition-transform peer-checked:translate-x-5"
      />
    </span>
  )
}
