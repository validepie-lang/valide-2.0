import { SettingsSection } from "@/components/layout/settings-section"
import { NotificationSwitches } from "@/components/settings/notification-switches"
import { getNotificationPreferences } from "@/lib/services/notifications"

export const metadata = { title: "Notificações" }

/**
 * Notificações (issue 044), da tela Settings do Pharmly (Behance): cada linha
 * com o título, uma frase e o interruptor à direita, num card só.
 *
 * É escolha de cada pessoa, não da farmácia. Desde a issue 059 cada
 * interruptor grava ao tocar (`NotificationSwitches`); a preferência ainda é
 * proposta no contrato (v16).
 */
export default async function NotificacoesPage() {
  const preferences = await getNotificationPreferences()

  return (
    <div className="flex max-w-[720px] flex-col gap-5 md:gap-6">
      <SettingsSection
        title="O que aparece no sino"
        description="Os avisos chegam no sino, no alto de qualquer tela. Desligue o que não ajuda no seu dia. Cada escolha vale assim que você toca."
      >
        <NotificationSwitches initial={preferences} />
      </SettingsSection>
    </div>
  )
}
