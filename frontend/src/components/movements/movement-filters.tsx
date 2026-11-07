import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, Input, Select } from "@/components/ui/field"
import { Chip } from "@/components/products/filter-bar"
import {
  PERIODS,
  REASON_SLUG,
  movementsHref,
  type MovementSearchParams,
} from "@/components/movements/movement-params"
import { formatNumber } from "@/lib/utils/format"
import { EXIT_REASON_LABEL, type MovementCounts, type User } from "@/lib/types"

const TYPES = [
  { slug: undefined, label: "Todas", count: (c: MovementCounts) => c.in + c.out + c.adjust },
  { slug: "entrada", label: "Entradas", count: (c: MovementCounts) => c.in },
  { slug: "saida", label: "Saídas", count: (c: MovementCounts) => c.out },
  { slug: "ajuste", label: "Ajustes", count: (c: MovementCounts) => c.adjust },
] as const

function Group({ title, cols, children }: { title: string; cols: 2 | 3; children: React.ReactNode }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-2">
      <h3 className="text-label font-semibold text-fg-muted">{title}</h3>
      {/* Linhas cheias, como os botões de situação do Inventar: nenhum cai sozinho na linha de baixo */}
      <ul className={cols === 2 ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-2"}>{children}</ul>
    </nav>
  )
}

/**
 * Filtros de Movimentações (issue 041), do painel à esquerda do Inventar
 * (Behance): o que se escolhe sempre em botões, o resto em listas.
 *
 * Tipo e período são links (um clique); motivo e pessoa vão num formulário GET
 * com "Aplicar filtros", como o "Mais filtros" do Estoque. Da tela grande em
 * diante o painel fica à esquerda; abaixo dela, em cima da lista.
 *
 * Issue 073: a contagem em cada tipo, como os botões do Inventar ("All 120"),
 * o tipo Ajustes, e as datas livres do Sales Analytics no mesmo formulário.
 */
export function MovementFiltersPanel({
  params,
  period,
  range,
  counts,
  users,
}: {
  params: MovementSearchParams
  period: string
  /** as datas em vigor, para os campos começarem com elas */
  range: { from: string; to: string; today: string }
  counts: MovementCounts | null
  users: User[]
}) {
  const noReason = params.tipo === "entrada" || params.tipo === "ajuste"
  // Escolher um motivo já é filtrar saídas: o chip acompanha
  const effectiveType = params.tipo ?? (params.motivo ? "saida" : undefined)
  const hasFilter = Boolean(
    params.tipo ||
    params.motivo ||
    params.pessoa ||
    params.periodo ||
    params.produto ||
    params.de ||
    params.ate,
  )

  return (
    <Card className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        <Group title="Tipo" cols={2}>
          {TYPES.map((t) => (
            <li key={t.label}>
              <Chip
                href={movementsHref(params, {
                  tipo: t.slug,
                  motivo: t.slug === "entrada" || t.slug === "ajuste" ? undefined : params.motivo,
                })}
                active={effectiveType === t.slug}
                className="w-full justify-center px-2"
              >
                {t.label}
                {counts ? <span className="tnum font-medium">{formatNumber(t.count(counts))}</span> : null}
              </Chip>
            </li>
          ))}
        </Group>
        <Group title="Período" cols={3}>
          {PERIODS.map((p) => (
            <li key={p.slug}>
              <Chip
                href={movementsHref(params, { periodo: p.slug, de: undefined, ate: undefined })}
                active={period === p.slug}
                className="w-full justify-center px-2"
              >
                {p.label}
              </Chip>
            </li>
          ))}
        </Group>
      </div>

      <form action="/estoque/movimentacoes" className="flex flex-col gap-4 border-t border-line pt-5">
        {params.tipo ? <input type="hidden" name="tipo" value={params.tipo} /> : null}
        {params.periodo ? <input type="hidden" name="periodo" value={params.periodo} /> : null}
        {params.produto ? <input type="hidden" name="produto" value={params.produto} /> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {/* Entrada e ajuste não têm motivo: o campo some em vez de ficar travado */}
          {!noReason ? (
            <Field label="Motivo da saída" htmlFor="filtro-motivo">
              <Select id="filtro-motivo" name="motivo" defaultValue={params.motivo ?? ""}>
                <option value="">Todos</option>
                {Object.entries(REASON_SLUG).map(([slug, reason]) => (
                  <option key={slug} value={slug}>
                    {EXIT_REASON_LABEL[reason]}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Quem fez" htmlFor="filtro-pessoa">
            <Select id="filtro-pessoa" name="pessoa" defaultValue={params.pessoa ?? ""}>
              <option value="">Todas as pessoas</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {/* Datas livres (item 76): valem mais que o período pronto; até um ano para trás */}
        <fieldset className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <legend className="mb-1.5 text-label font-medium text-fg">Ou escolha as datas</legend>
          <Field label="De" htmlFor="filtro-de">
            <Input
              id="filtro-de"
              name="de"
              type="date"
              max={range.today}
              defaultValue={period === "datas" ? range.from : ""}
            />
          </Field>
          <Field label="Até" htmlFor="filtro-ate">
            <Input
              id="filtro-ate"
              name="ate"
              type="date"
              max={range.today}
              defaultValue={period === "datas" ? range.to : ""}
            />
          </Field>
        </fieldset>
        <Button
          type="submit"
          variant="secondary"
          className="w-full sm:w-auto sm:self-start lg:w-full lg:self-stretch"
        >
          Aplicar filtros
        </Button>
      </form>

      {hasFilter ? (
        <Link
          href="/estoque/movimentacoes"
          className="-mt-2 inline-flex min-h-11 items-center gap-1 self-start text-label font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <X className="size-3.5" aria-hidden />
          Limpar filtros
        </Link>
      ) : null}
    </Card>
  )
}
