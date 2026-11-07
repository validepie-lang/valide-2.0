"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { FormFailure, SavedNote } from "@/components/ui/form-status"
import { saveNotificationPreferences } from "@/lib/actions/settings"
import { UNREACHABLE } from "@/lib/actions/result"
import type { NotificationPreferences } from "@/lib/types"

/** Um por tipo de aviso que o Valide já manda (`Notification.kind`) */
const ROWS: { key: keyof NotificationPreferences; title: string; description: string }[] = [
  {
    key: "expiringThisWeek",
    title: "Lotes que vencem na semana",
    description: "Um aviso com quantos lotes vencem nos próximos 7 dias.",
  },
  {
    key: "minStock",
    title: "Estoque abaixo do mínimo",
    description: "Quando um produto chega ao estoque mínimo do cadastro.",
  },
  {
    key: "teamActivity",
    title: "O que a equipe registrou",
    description: "Descarte por vencimento e mudança nas configurações da farmácia.",
  },
  {
    key: "importDone",
    title: "Importação concluída",
    description: "Quando uma planilha termina de entrar, com quantos produtos vieram.",
  },
]

/**
 * Os interruptores de Notificações (issue 044), do Settings do Pharmly
 * (Behance). Desde a issue 059 cada toque grava (`PUT
 * /users/me/notification-preferences`, v16): interruptor salva sozinho, sem
 * "Salvar", e o mesmo formulário não mistura os dois jeitos (Primer, Saving).
 * Recusado, o interruptor volta para onde estava e a mensagem diz por quê.
 */
export function NotificationSwitches({ initial }: { initial: NotificationPreferences }) {
  const [preferences, setPreferences] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function toggle(key: keyof NotificationPreferences, on: boolean) {
    // Um toque de cada vez: o seguinte espera a resposta do anterior
    if (saving) return
    const before = preferences
    const next = { ...preferences, [key]: on }
    setPreferences(next)
    setSaving(true)
    setFailure(null)
    setSaved(null)
    const result = await saveNotificationPreferences(next).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) {
      setPreferences(before)
      return setFailure(result.message)
    }
    const title = ROWS.find((row) => row.key === key)?.title ?? ""
    setSaved(`${title}: ${on ? "ligado" : "desligado"}.`)
  }

  return (
    <div aria-busy={saving}>
      <ul className="-my-3 divide-y divide-line">
        {ROWS.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <label htmlFor={`aviso-${row.key}`} className="text-body font-semibold text-fg">
                {row.title}
              </label>
              <p id={`aviso-${row.key}-dica`} className="mt-0.5 text-label text-fg-muted">
                {row.description}
              </p>
            </div>
            <Switch
              id={`aviso-${row.key}`}
              name={row.key}
              checked={preferences[row.key]}
              onChange={(on) => void toggle(row.key, on)}
              describedBy={`aviso-${row.key}-dica`}
            />
          </li>
        ))}
      </ul>
      {failure ? (
        <FormFailure message={failure} after="A preferência voltou para como estava." className="mt-6" />
      ) : null}
      <SavedNote message={saved} className="mt-6" />
    </div>
  )
}
