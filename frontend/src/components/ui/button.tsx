import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"

type Variant = "primary" | "secondary" | "ghost" | "onDeep" | "inverse" | "link"
type Size = "sm" | "md" | "lg" | "icon"

/**
 * Não existe variante destrutiva colorida.
 * Vermelho comunica validade vencida e só isso. Ação destrutiva se distingue
 * pelo texto que nomeia a ação e pela confirmação.
 * Ver docs/07-decisions/ux-decisions.md, 16/09/2026.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-pressed shadow-button",
  secondary:
    "bg-surface text-fg border border-line hover:bg-primary-soft hover:border-line-strong",
  ghost: "text-fg-muted hover:bg-primary-soft hover:text-fg",
  onDeep:
    "bg-deep-fg/10 text-deep-fg border border-deep-line hover:bg-deep-fg/20 backdrop-blur-sm",
  // ação primária dentro do cartão cheio (bg-feature): o primário comum some nele.
  // Cor de assinatura desde a issue 061 (lavanda-cobalto desde a 064)
  inverse: "bg-signature text-signature-fg hover:bg-signature-hover",
  link: "text-primary underline underline-offset-4 hover:text-primary-hover px-0",
}

const SIZES: Record<Size, string> = {
  // 44px no celular, 36px no desktop: alvo de toque generoso sem inchar a tela
  sm: "h-11 md:h-9 px-3 text-label gap-1.5",
  md: "h-11 md:h-10 px-4 text-body gap-2",
  lg: "h-12 px-6 text-body gap-2",
  icon: "size-11 md:size-10 p-0",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "primary", size = "md", type, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          BASE,
          "disabled:pointer-events-none disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      />
    )
  },
)

const BASE =
  "inline-flex shrink-0 items-center justify-center rounded-pill font-medium " +
  "transition-[background-color,border-color,color,transform] duration-150 " +
  "active:scale-[0.98] whitespace-nowrap"

/** Link com aparência de botão. Navegação continua sendo um link de verdade. */
export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </Link>
  )
}
