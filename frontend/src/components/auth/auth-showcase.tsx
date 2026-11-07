import { Logo } from "@/components/layout/logo"
import { StatusChip } from "@/components/ui/status-chip"
import { STATUS_ORDER, type ExpiryStatus } from "@/lib/utils/expiry"

/**
 * Painel da marca, ao lado do formulário de entrada e de cadastro (issue 034).
 *
 * As quatro referências de login do Behance dividem a tela em dois; a mais
 * vista (Login/Sign Up UI/UX Page Template Design, 12.170 visualizações) usa a
 * metade da marca para mostrar o que o produto faz, com uma frase de valor.
 * Aqui, as quatro situações de validade, que são o produto, em vez de foto,
 * degradê ou ilustração (proibidos no design-system.md 14.9).
 */
const WHAT_TO_DO: Record<ExpiryStatus, string> = {
  expired: "Retirar da prateleira hoje",
  soon: "Vender primeiro, antes que vença",
  ok: "Nada a fazer por enquanto",
  unknown: "Falta informar o lote e a data",
}

export function AuthShowcase() {
  return (
    <div className="flex h-full flex-col justify-between gap-10 p-10 xl:p-14">
      {/* self-start: na coluna flex, o SVG esticaria até a largura toda e ficaria centralizado */}
      <Logo tone="onDeep" className="self-start" />

      <div className="max-w-md">
        <h2 className="font-display text-display font-bold text-balance text-feature-fg">
          {/* Título em dois tons, como o da BetterData e o da Pharmacy CRM (issue 061) */}
          Saiba o que vence <span className="text-signature">antes de virar perda.</span>
        </h2>
        <p className="mt-3 text-body text-feature-muted">
          O Valide lê o estoque que a farmácia já tem e separa cada produto em quatro situações, cada uma
          com o que fazer.
        </p>

        <ul className="mt-8 divide-y divide-feature-line border-y border-feature-line">
          {STATUS_ORDER.map((status) => (
            <li key={status} className="flex items-center justify-between gap-4 py-3.5">
              <StatusChip status={status} />
              <span className="text-right text-label text-feature-fg">{WHAT_TO_DO[status]}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-label text-feature-muted">Controle de validade para farmácias</p>
    </div>
  )
}
