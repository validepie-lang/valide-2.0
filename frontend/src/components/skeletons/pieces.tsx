import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/cn"

/**
 * Peças de carregamento.
 *
 * Skeleton com a forma do conteúdo, nunca spinner solto. O público usa máquina
 * antiga e conexão instável: spinner girando parece travamento, e um bloco com
 * o formato do que vem parece que já está chegando.
 * Ver docs/01-references/architecture.md seção 5.
 *
 * O contêiner de cada tela carrega `aria-busy` e um aviso em texto, para quem
 * usa leitor de tela saber que a espera é temporária.
 */
export function LoadingRegion({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export function PageHeaderSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-56 md:h-9 md:w-72" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: actions }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-40 rounded-pill md:h-10" />
        ))}
      </div>
    </div>
  )
}

/** Card genérico com título, apoio e corpo de altura variável. */
export function CardSkeleton({ body = 160, className }: { body?: number; className?: string }) {
  return (
    <Card className={className}>
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-2.5 h-3 w-60 max-w-full" />
      <Skeleton className="mt-5 w-full" style={{ height: body }} />
    </Card>
  )
}

/**
 * Card com cabeçalho e linhas, a forma das listas e tabelas da direção A.
 *
 * `bar` é a barra de estado à esquerda de cada linha: a classe de cor quando o
 * estado é conhecido pela posição (a lista de vencidos da Home é sempre
 * vermelha), `"neutral"` quando depende do dado, e nada quando a lista não é
 * de validade.
 */
export function ListCardSkeleton({
  rows = 5,
  bar,
  action = false,
  footer = false,
  className,
}: {
  rows?: number
  bar?: string
  action?: boolean
  footer?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-md border border-line bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex min-h-[3.5rem] items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
        <Skeleton className="h-5 w-48 max-w-[60%]" />
        {action ? <Skeleton className="h-3.5 w-20" /> : null}
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-stretch gap-3.5 px-5 py-3.5 md:px-6">
            {bar ? (
              <span
                aria-hidden
                className={cn("w-1 shrink-0 rounded-pill", bar === "neutral" ? "bg-sunken" : bar)}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-1.5 h-3.5 w-2/5" />
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="mt-1.5 h-3.5 w-24" />
            </div>
          </div>
        ))}
      </div>
      {footer ? (
        <div className="border-t border-line px-5 py-4">
          <Skeleton className="h-3.5 w-44" />
        </div>
      ) : null}
    </div>
  )
}

/** Lista de linhas, para painel lateral e tabela que vira card no celular. */
export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-3.5">
          <Skeleton className="size-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="mt-2 h-3 w-2/5" />
          </div>
          <Skeleton className="h-6 w-20 shrink-0 rounded-pill" />
        </li>
      ))}
    </ul>
  )
}

/** Par de rótulo e campo, na altura real do input. */
export function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-2 h-11 w-full" />
    </div>
  )
}

/**
 * Linhas da tabela do estoque, na forma de 08/10: produto, validade em duas
 * linhas, situação, quantidade e a ação. No celular, a lista de duas linhas.
 * Nada aqui tem largura fixa maior que a coluna: em 360 o esqueleto não pode
 * empurrar a página para o lado.
 */
export function TableRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      <div className="hidden lg:block">
        <div className="flex items-center gap-6 border-b border-line py-2.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <span className="w-9" />
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 border-b border-line py-3 last:border-b-0">
            <Skeleton className="h-3.5 w-72 max-w-[40%]" />
            <div className="ml-auto">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-1.5 h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-20 shrink-0 rounded-pill" />
            <Skeleton className="h-3.5 w-16 shrink-0" />
            <Skeleton className="size-9 shrink-0" />
          </div>
        ))}
      </div>

      <ul className="divide-y divide-line lg:hidden">
        {Array.from({ length: Math.min(rows, 6) }).map((_, r) => (
          <li key={r} className="py-3.5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-5 w-20 shrink-0 rounded-pill" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3.5 w-12 shrink-0" />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
