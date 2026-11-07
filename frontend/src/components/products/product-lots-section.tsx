"use client"

import Link from "next/link"
import { ArrowDownToLine, PackagePlus, Plus } from "lucide-react"
import { Button, LinkButton } from "@/components/ui/button"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { LotFields, emptyLot, type LotDraft } from "@/components/products/lot-fields"
import { LotsTable } from "@/components/products/lots-table"
import type { LotDraftErrors } from "@/lib/utils/lot-draft"
import type { Product } from "@/lib/types"

/**
 * Cadastro: os lotes iniciais, com a validade que o painel passa a acompanhar.
 * O estado mora no formulário (issue 055), que valida e envia junto com o
 * produto. Bloco deixado em branco não vai: o produto nasce Sem validade.
 */
export function NewLotsSection({
  soonThresholdDays,
  lots,
  onChange,
  errors,
  readOnly,
}: {
  soonThresholdDays: number
  lots: LotDraft[]
  onChange: (lots: LotDraft[]) => void
  /** recusas do envio, por `key` do lote */
  errors: Record<number, LotDraftErrors>
  readOnly: boolean
}) {
  return (
    <Card id="lotes" className="scroll-mt-24">
      <CardTitle>Lote e validade</CardTitle>
      <CardSubtitle>
        É daqui que sai todo o controle. Sem lote, o produto entra como sem validade e o painel não consegue
        avisar nada sobre ele.
      </CardSubtitle>

      <div className="mt-5 flex flex-col gap-3">
        {lots.map((lot, index) => (
          <LotFields
            key={lot.key}
            lot={lot}
            index={index}
            removable={lots.length > 1}
            takenCodes={lots.filter((other) => other.key !== lot.key).map((other) => other.code.trim())}
            errors={errors[lot.key]}
            readOnly={readOnly}
            soonThresholdDays={soonThresholdDays}
            onChange={(patch) => onChange(lots.map((l) => (l.key === lot.key ? { ...l, ...patch } : l)))}
            onRemove={() => onChange(lots.filter((l) => l.key !== lot.key))}
          />
        ))}
      </div>

      <Button variant="secondary" className="mt-3" onClick={() => onChange([...lots, emptyLot()])}>
        <Plus className="size-4" aria-hidden />
        Adicionar outro lote
      </Button>
    </Card>
  )
}

/**
 * Edição: os lotes só para leitura. Lote e quantidade mudam por movimentação,
 * que fica no histórico com quem fez e quando (o "Adjust Stock" separado do
 * cadastro no Inventar, Behance; e o histórico imutável do banco).
 * Ver docs/04-issues/026-editar-produto.md.
 */
export function ExistingLotsSection({ product }: { product: Product }) {
  const hasLots = product.lots.length > 0
  return (
    <Card id="lotes" className="scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 sm:flex-1">
          <CardTitle>Lotes</CardTitle>
          <CardSubtitle>
            Lote e quantidade não mudam por aqui. Cada mudança entra como movimentação, para o histórico
            mostrar quem mexeu e quando.
          </CardSubtitle>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <LinkButton
            href={`/estoque/${product.id}/entrada`}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <PackagePlus className="size-4" aria-hidden />
            Registrar entrada
          </LinkButton>
          {hasLots ? (
            <LinkButton
              href={`/estoque/${product.id}/baixa`}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <ArrowDownToLine className="size-4" aria-hidden />
              Registrar saída
            </LinkButton>
          ) : null}
        </div>
      </div>

      {hasLots ? (
        <div className="mt-4">
          <LotsTable lots={product.lots} unit={product.unit} />
        </div>
      ) : (
        <p className="mt-4 text-body text-fg-muted">
          Nenhum lote informado. O produto está como Sem validade.{" "}
          <Link
            href={`/estoque/validades-pendentes?produto=${product.id}`}
            className="font-medium text-fg underline-offset-4 hover:underline"
          >
            Informar validade na fila
          </Link>
        </p>
      )}
    </Card>
  )
}
