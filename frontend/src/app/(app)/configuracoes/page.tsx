import { ThemeChoice } from "@/components/layout/theme-choice"
import { ReadOnlyRows, SettingsSection } from "@/components/layout/settings-section"
import { Avatar } from "@/components/ui/avatar"
import { PasswordForm } from "@/components/settings/password-form"
import { ProfileNameForm } from "@/components/settings/profile-name-form"
import { getSession } from "@/lib/services/session"
import { readJournal } from "@/lib/services/demo-store"
import { DemoReset } from "@/components/settings/demo-reset"
import { isLive } from "@/lib/api/config"
import { ROLE_LABEL } from "@/lib/types"

export const metadata = { title: "Meu perfil" }

/**
 * Uma coluna, seções sem card (SPEC 5.6). O envio de foto saiu em 08/10: o
 * botão não fazia nada e o contrato não tem endpoint de envio. O avatar usa as
 * iniciais até o envio existir.
 *
 * Desde a issue 059 o nome e a senha gravam, cada um no seu formulário e com
 * o seu aviso de sair sem salvar.
 */
export default async function PerfilPage() {
  const { user, company } = await getSession()
  // Só no modo de demonstração (issue 071): com a API ligada, quem guarda é o servidor
  const demo = isLive("products") ? null : (await readJournal()).length

  return (
    <div className="flex max-w-[720px] flex-col gap-5 md:gap-6">
      <SettingsSection
        title="Seus dados"
        description="É o nome que aparece no histórico quando você registra uma saída."
      >
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <p className="min-w-0 truncate text-body font-medium text-fg">{user.name}</p>
        </div>

        <ReadOnlyRows
          className="mt-6"
          rows={[
            { label: "Usuário", value: user.login },
            { label: "Empresa", value: company.tradeName },
            { label: "Cargo", value: ROLE_LABEL[user.role] },
          ]}
        />
        <p className="mt-2 text-label text-fg-muted">
          Usuário e cargo são definidos por quem administra a conta da empresa.
        </p>

        <ProfileNameForm initialName={user.name} />
      </SettingsSection>

      <SettingsSection title="Senha" description="Troque quando quiser. Ao menos 8 caracteres.">
        <PasswordForm />
      </SettingsSection>

      <SettingsSection
        title="Aparência"
        description="O tema escuro ajuda em loja com pouca luz. Vale para este navegador."
      >
        <div className="max-w-sm">
          <ThemeChoice />
        </div>
      </SettingsSection>

      {demo !== null ? (
        <SettingsSection
          title="Demonstração"
          description="O Valide ainda não está ligado ao servidor. O que você grava fica guardado só neste navegador, para a demonstração: as ações mais recentes, até umas vinte."
        >
          <p className="mb-4 text-body text-fg">
            {demo === 0
              ? "Nada guardado: as telas mostram o exemplo original."
              : `${demo} ${demo === 1 ? "ação guardada" : "ações guardadas"} neste navegador.`}
          </p>
          <DemoReset count={demo} />
        </SettingsSection>
      ) : null}
    </div>
  )
}
