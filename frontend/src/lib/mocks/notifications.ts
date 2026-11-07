import { daily, mockProducts, isoAtLocalTime as at, isoInDays } from "@/lib/mocks/catalog"
import type { Notification } from "@/lib/types"

/**
 * Os avisos tiram os números do catálogo simulado, para nunca contradizer o
 * estoque: até 10/10 um aviso dizia "chegou ao mínimo" de um produto com 43
 * unidades e mínimo de 20 (achado na issue 037).
 */
function byName(prefix: string) {
  const product = mockProducts().find((p) => p.name.startsWith(prefix))
  if (!product) throw new Error(`Produto do mock não encontrado: ${prefix}`)
  return product
}

function lowStock(prefix: string) {
  const p = byName(prefix)
  return {
    title: `${p.name.split(",")[0]} está abaixo do estoque mínimo`,
    body: `Restam ${p.totalQuantity} ${p.unit} e o mínimo definido é ${p.minStock} ${p.unit}.`,
    link: `/estoque/${p.id}`,
  }
}

export const mockNotifications = daily((): Notification[] => {
  const weekEnd = isoInDays(7)
  const soonThisWeek = mockProducts()
    .flatMap((p) => p.lots)
    .filter((l) => l.status === "soon" && l.expiresAt <= weekEnd).length
  const torsilax = byName("Torsilax")

  return [
    {
      id: "n1",
      kind: "min_stock",
      ...lowStock("Maleato de Enalapril"),
      read: false,
      createdAt: at(0, "14:26"),
    },
    {
      id: "n2",
      kind: "system",
      title: `${soonThisWeek} lotes vencem nos próximos 7 dias`,
      body: "Vale conferir a prateleira antes do fim de semana.",
      read: false,
      createdAt: at(0, "08:00"),
      link: "/estoque?status=soon",
    },
    {
      id: "n3",
      kind: "user_change",
      title: "Juliana registrou uma saída por vencimento",
      body: `4 unidades de Torsilax, lote ${torsilax.lots[0]?.code ?? ""}.`,
      read: false,
      createdAt: at(0, "09:15"),
      link: `/estoque/${torsilax.id}`,
    },
    {
      id: "n4",
      kind: "import_done",
      title: "Importação de planilha concluída",
      body: "62 produtos criados e 18 atualizados a partir de catalogo-setembro.xlsx.",
      read: true,
      createdAt: at(1, "19:41"),
      link: "/estoque/importar",
    },
    {
      id: "n5",
      kind: "min_stock",
      ...lowStock("Omeprazol"),
      read: true,
      createdAt: at(2, "11:08"),
    },
    {
      id: "n6",
      kind: "user_change",
      title: "Camila alterou a janela de a vencer",
      body: "A janela passou de 45 para 30 dias.",
      read: true,
      createdAt: at(4, "16:52"),
      link: "/configuracoes/empresa",
    },
  ]
})
