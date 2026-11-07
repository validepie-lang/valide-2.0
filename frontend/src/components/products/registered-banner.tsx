import Link from "next/link"
import { SavedBanner } from "@/components/ui/saved-banner"
import { UndoExit } from "@/components/products/undo-exit"
import { formatQuantity } from "@/lib/utils/format"
import type { ProductUnit } from "@/lib/types"

export type Registered =
  | { kind: "entrada" | "saida"; lot: string; quantity: number; movementId: string | null }
  /** produto cadastrado vindo da entrada geral (issue 072, item 104) */
  | { kind: "cadastro" }

/**
 * O que a entrada, a saída e o cadastro mandam no endereço ao gravar (issues
 * 054 e 072): `?registrado=saida&lote=L2291&qtd=2&mov=<id>` ou
 * `?registrado=cadastro&de=<produto>`. Endereço inválido não mostra nada.
 */
export function parseRegistered(params: {
  registrado?: string
  lote?: string
  qtd?: string
  mov?: string
}): Registered | null {
  const { registrado, lote, qtd, mov } = params
  if (registrado === "cadastro") return { kind: "cadastro" }
  const quantity = Number(qtd)
  if ((registrado !== "entrada" && registrado !== "saida") || !lote || !(quantity > 0)) return null
  return { kind: registrado, lot: lote, quantity, movementId: mov || null }
}

/** Para onde "Desfazer" leva: o mesmo lugar, sem a faixa e com o aviso de desfeito */
function undoneHref(closeHref: string): string {
  return `${closeHref}${closeHref.includes("?") ? "&" : "?"}desfeito=saida`
}

/** "Saída de 2 un do lote L2291 registrada. Desfazer", no topo da tela de chegada */
export function RegisteredBanner({
  registered,
  unit,
  closeHref,
  product,
}: {
  registered: Registered
  unit: ProductUnit
  closeHref: string
  /** na entrada geral, a tela de chegada é a busca: diz de qual produto e leva a ele */
  product?: { name: string; href: string }
}) {
  if (registered.kind === "cadastro") {
    return (
      <SavedBanner closeHref={closeHref} className="mb-5">
        {product ? `${product.name} cadastrado.` : "Produto cadastrado."}{" "}
        {product ? (
          <Link href={product.href} className="font-semibold underline-offset-4 hover:underline">
            Ver o produto
          </Link>
        ) : null}
      </SavedBanner>
    )
  }
  const what = registered.kind === "entrada" ? "Entrada" : "Saída"
  return (
    <SavedBanner closeHref={closeHref} className="mb-5">
      {what} de <span className="tnum">{formatQuantity(registered.quantity, unit)}</span> do lote{" "}
      {registered.lot} registrada{product ? ` em ${product.name}` : ""}.
      {product ? (
        <>
          {" "}
          <Link href={product.href} className="font-semibold underline-offset-4 hover:underline">
            Ver o produto
          </Link>
        </>
      ) : null}
      {registered.kind === "saida" && registered.movementId ? (
        <UndoExit movementId={registered.movementId} doneHref={undoneHref(closeHref)} />
      ) : null}
    </SavedBanner>
  )
}

/** "Saída desfeita.", depois do Desfazer (issue 072, item 102) */
export function UndoneBanner({ closeHref }: { closeHref: string }) {
  return (
    <SavedBanner closeHref={closeHref} className="mb-5">
      Saída desfeita. O estoque voltou ao que era antes dela.
    </SavedBanner>
  )
}
