import { TabsNav } from "@/components/ui/tabs-nav"

/**
 * As abas do Estoque (issue 041): os produtos e o histórico de todos eles,
 * como "Product" e "Stock Adjustment" lado a lado no Inventar (Behance).
 */
export function StockTabs({ className }: { className?: string }) {
  return (
    <TabsNav
      label="Seções do estoque"
      className={className}
      items={[
        { href: "/estoque", label: "Produtos" },
        { href: "/estoque/movimentacoes", label: "Movimentações" },
        // Quando cada lote vence, mês a mês (issue 052)
        { href: "/estoque/calendario", label: "Calendário" },
      ]}
    />
  )
}
