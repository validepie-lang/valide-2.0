import { cn } from "@/lib/utils/cn"

/**
 * Seção de configuração. Formulário em coluna única, até 720px, é preenchido
 * mais rápido e com menos erro do que em duas colunas (Baymard; NN/g).
 *
 * Direção A (09/10/2026): cada seção é um card com cabeçalho (título em
 * font-display e apoio acima de um fio), como as listas da Home. Em 08/10
 * eram só título e espaço, e a tela parecia inacabada.
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
  const id = `secao-${slug}`
  return (
    <section
      aria-labelledby={id}
      className={cn("overflow-hidden rounded-md border border-line bg-surface shadow-card", className)}
    >
      <div className="border-b border-line px-5 py-4 md:px-6">
        <h2 id={id} className="font-display text-section font-bold text-fg">
          {title}
        </h2>
        {description ? <p className="mt-1 text-label text-fg-muted">{description}</p> : null}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  )
}

/**
 * Dado que a pessoa vê mas não muda aqui. Vai como texto, não como campo
 * travado: campo com borda promete edição.
 */
export function ReadOnlyRows({
  rows,
  className,
}: {
  rows: { label: string; value: React.ReactNode }[]
  className?: string
}) {
  return (
    <dl className={cn("divide-y divide-line border-y border-line", className)}>
      {rows.map((row) => (
        <div key={row.label} className="grid gap-0.5 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
          <dt className="text-label text-fg-muted sm:text-body">{row.label}</dt>
          <dd className="text-body text-fg">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
