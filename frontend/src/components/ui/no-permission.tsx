import { Lock } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

/**
 * Estado de sem permissão.
 *
 * A interface esconde o que o cargo não pode fazer, e o servidor bloqueia de
 * qualquer forma. Esta tela existe para quem chega por link direto, e nunca
 * deixa a pessoa em beco sem saída.
 * Ver docs/01-references/security-rules.md seção 4.
 *
 * Sem card e sem centralizar na largura toda: fica na margem esquerda do
 * conteúdo, como o resto da tela (até 09/10 boiava no meio, fora da coluna).
 */
export function NoPermission({ what, who = "de administrador" }: { what: string; who?: string }) {
  return (
    <div className="max-w-2xl">
      <EmptyState
        align="start"
        className="pt-2"
        icon={Lock}
        title="Seu cargo não tem acesso a esta área"
        description={`${what} é uma tarefa ${who}. Peça a quem administra a conta para fazer isso, ou para mudar o seu cargo.`}
        action={
          <>
            <LinkButton href="/">Voltar ao painel</LinkButton>
            <LinkButton href="/estoque" variant="secondary">
              Ir para o estoque
            </LinkButton>
          </>
        }
      />
    </div>
  )
}
