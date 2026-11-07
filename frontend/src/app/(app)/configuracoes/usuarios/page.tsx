import { Check, Minus } from "lucide-react"
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { NoPermission } from "@/components/ui/no-permission"
import { getSession, getUsers } from "@/lib/services/session"
import { demoRole } from "@/lib/utils/permissions"
import { UserManager } from "@/components/users/user-manager"
import { ROLE_LABEL, type UserRole } from "@/lib/types"

export const metadata = { title: "Usuários" }

/** Em ordem de nível, como em `perfil_acesso`. */
const ROLES: { role: UserRole; short: string }[] = [
  { role: "clerk", short: "Balc." },
  { role: "pharmacist", short: "Farm." },
  { role: "admin", short: "Adm." },
]

/** Espelha docs/00-context/business-rules.md seção 5. */
const PERMISSIONS: { action: string; allowed: UserRole[] }[] = [
  { action: "Ver painel e estoque", allowed: ["clerk", "pharmacist", "admin"] },
  { action: "Cadastrar produto", allowed: ["clerk", "pharmacist", "admin"] },
  { action: "Registrar saída", allowed: ["clerk", "pharmacist", "admin"] },
  { action: "Informar lote e validade", allowed: ["clerk", "pharmacist", "admin"] },
  { action: "Descartar por vencimento ou avaria", allowed: ["pharmacist", "admin"] },
  { action: "Importar catálogo", allowed: ["admin"] },
  { action: "Gerenciar pastas", allowed: ["admin"] },
  { action: "Gerenciar usuários", allowed: ["admin"] },
  { action: "Configurações da empresa", allowed: ["admin"] },
]

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<{ cargo?: string }> }) {
  const [users, { user: me }, { cargo }] = await Promise.all([getUsers(), getSession(), searchParams])

  if (demoRole(cargo, me.role) !== "admin") {
    return <NoPermission what="Gerenciar quem tem acesso" />
  }

  // Uma coluna, como as outras abas (SPEC 5.6). Lista e tabela continuam em
  // card: precisam de superfície para as linhas
  return (
    <div className="flex max-w-[720px] flex-col gap-5 md:gap-6">
      {/* Adicionar, editar e bloquear (issue 040) */}
      <UserManager initial={users} meId={me.id} />

      <Card className="p-0 md:p-0">
        <div className="p-4 md:px-6 md:pt-6 md:pb-4">
          <CardTitle>O que cada cargo pode</CardTitle>
          <CardSubtitle>
            Quem não pode fazer algo simplesmente não vê a opção na tela. Quem sai da farmácia tem o acesso
            bloqueado, sem apagar o que registrou.
          </CardSubtitle>
        </div>
        <table className="w-full border-collapse border-t border-line">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="px-4 py-2.5 text-left text-label font-medium text-fg-muted md:px-6">
                Ação
              </th>
              {ROLES.map(({ role, short }) => (
                <th
                  key={role}
                  scope="col"
                  className="w-14 px-1 py-2.5 text-center text-label font-medium text-fg-muted last:pr-4 sm:w-24 md:last:pr-6"
                >
                  <span aria-hidden className="sm:hidden">
                    {short}
                  </span>
                  <span className="sr-only sm:not-sr-only">{ROLE_LABEL[role]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((row) => (
              <tr key={row.action} className="border-b border-line last:border-b-0">
                <td className="px-4 py-2.5 text-label text-fg md:px-6">{row.action}</td>
                {ROLES.map(({ role }) => (
                  <td key={role} className="px-1 py-2.5 text-center last:pr-4 md:last:pr-6">
                    <Allowed value={row.allowed.includes(role)} action={row.action} role={ROLE_LABEL[role]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

/**
 * Permitido e não permitido não podem depender só de cor nem só de ícone: o
 * texto para leitor de tela diz qual é. Sem círculo em volta: o ✓ forte e o −
 * apagado já separam as duas colunas de leitura.
 */
function Allowed({ value, action, role }: { value: boolean; action: string; role: string }) {
  return (
    <span className="inline-grid size-6 place-items-center">
      {value ? (
        <Check className="size-4 text-fg" aria-hidden />
      ) : (
        <Minus className="size-4 text-fg-muted" aria-hidden />
      )}
      <span className="sr-only">
        {role} {value ? "pode" : "não pode"}: {action}
      </span>
    </span>
  )
}
