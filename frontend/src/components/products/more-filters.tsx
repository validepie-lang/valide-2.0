"use client"

import { useCallback, useId, useRef, useState } from "react"
import Link from "next/link"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, Select } from "@/components/ui/field"
import { useDismiss } from "@/lib/hooks/use-dismiss"
import { cn } from "@/lib/utils/cn"
import type { Folder, ProductFacets } from "@/lib/types"
import type { StockSearchParams } from "@/components/products/filter-bar"
import { NO_FOLDER_LABEL, NO_FOLDER_PARAM } from "@/lib/utils/no-folder"

/** As mesmas ordens do cabeçalho da tabela */
const ORDERS = [
  { value: "expiry_asc", label: "O que vence primeiro" },
  { value: "expiry_desc", label: "O que vence por último" },
  { value: "name_asc", label: "Nome, de A a Z" },
  { value: "quantity_asc", label: "Menor quantidade" },
]

/** Origens do piloto. A integração saiu do escopo em 17/09 */
const SOURCES = [
  { value: "file", label: "Planilha" },
  { value: "manual", label: "Cadastro manual" },
]

/**
 * Pasta, fornecedor, marca e origem, recolhidos (SPEC 5.2).
 *
 * O filtro principal da tela é a situação, nos chips. Estes são usados às
 * vezes, então ficam a um clique. É um formulário GET: o filtro continua na
 * URL, e "Aplicar filtros" diz o que acontece, em vez de recarregar a cada
 * troca de opção.
 */
export function MoreFilters({
  params,
  folders,
  facets,
  canManageFolders = false,
}: {
  params: StockSearchParams
  folders: Folder[]
  facets: ProductFacets
  /** quem administra vê o caminho para Pastas (issue 039), como a categoria dentro do estoque no Inventar */
  canManageFolders?: boolean
}) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])
  useDismiss({ open, onClose: close, containerRef: boxRef, triggerRef: buttonRef })

  const active = [params.pasta, params.fornecedor, params.marca, params.origem].filter(Boolean).length

  return (
    <div ref={boxRef} className="relative">
      <Button
        ref={buttonRef}
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(open && "bg-primary-soft")}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Mais filtros
        {active > 0 ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-fg px-1 text-micro font-semibold text-surface tnum">
            <span className="sr-only">, </span>
            {active}
            <span className="sr-only"> {active === 1 ? "ativo" : "ativos"}</span>
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Mais filtros"
          className="fixed inset-x-4 top-24 z-40 rounded-md border border-line bg-surface p-4 shadow-pop sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80"
        >
          <form
            action="/estoque"
            className="flex flex-col gap-4"
            // "Todas" não vai para a URL: sem isto ela ficaria com pasta=&marca=
            onSubmit={(event) => {
              for (const el of Array.from(event.currentTarget.elements)) {
                if (
                  el instanceof HTMLSelectElement &&
                  (!el.value || (el.name === "ordem" && el.value === "expiry_asc"))
                )
                  el.disabled = true
              }
            }}
          >
            {/* O que já está filtrado fora deste painel continua valendo */}
            {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
            {params.busca ? <input type="hidden" name="busca" value={params.busca} /> : null}

            <Field label="Pasta" htmlFor="filtro-pasta">
              <Select id="filtro-pasta" name="pasta" defaultValue={params.pasta ?? ""}>
                <option value="">Todas</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
                {/* Issue 068, item 69: o que ninguém classificou ainda */}
                <option value={NO_FOLDER_PARAM}>{NO_FOLDER_LABEL}</option>
              </Select>
              {canManageFolders ? (
                <Link
                  href="/estoque/pastas"
                  className="mt-1 self-start text-label font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  Gerenciar pastas
                </Link>
              ) : null}
            </Field>
            <Field label="Fornecedor" htmlFor="filtro-fornecedor">
              <Select id="filtro-fornecedor" name="fornecedor" defaultValue={params.fornecedor ?? ""}>
                <option value="">Todos</option>
                {facets.suppliers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Marca" htmlFor="filtro-marca">
              <Select id="filtro-marca" name="marca" defaultValue={params.marca ?? ""}>
                <option value="">Todas</option>
                {facets.brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Origem" htmlFor="filtro-origem">
              <Select id="filtro-origem" name="origem" defaultValue={params.origem ?? ""}>
                <option value="">Todas</option>
                {SOURCES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>

            {/* A ordem vai junto do filtro. Na tela grande ela mora no cabeçalho da
                tabela (issue 029), então o campo só aparece abaixo dela (issue 050, item 9);
                escondido, ele continua mandando a ordem atual */}
            <Field label="Ordem" htmlFor="filtro-ordem" className="lg:hidden">
              <Select id="filtro-ordem" name="ordem" defaultValue={params.ordem ?? "expiry_asc"}>
                {ORDERS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Button type="submit" className="w-full">
              Aplicar filtros
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
