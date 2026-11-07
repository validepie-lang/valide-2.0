import { NoPermission } from "@/components/ui/no-permission"
import { CompanyForm } from "@/components/settings/company-form"
import { getSession } from "@/lib/services/session"
import { demoRole } from "@/lib/utils/permissions"

export const metadata = { title: "Empresa" }

/**
 * Um formulário em uma coluna, com um "Salvar alterações" no fim (SPEC 5.6).
 * Até 08/10 eram cinco cards em duas colunas e um único "Salvar" no meio da
 * página, que não deixava claro se salvava também a coluna do lado. O envio de
 * logotipo saiu: não existe no contrato. Desde a issue 059 grava (`CompanyForm`).
 */
export default async function EmpresaPage({ searchParams }: { searchParams: Promise<{ cargo?: string }> }) {
  const [{ user, company }, { cargo }] = await Promise.all([getSession(), searchParams])

  // A interface esconde. O servidor bloqueia de qualquer forma.
  if (demoRole(cargo, user.role) !== "admin") return <NoPermission what="Editar os dados da empresa" />

  return <CompanyForm company={company} />
}
