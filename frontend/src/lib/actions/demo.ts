"use server"

import { isLive } from "@/lib/api/config"
import { clearJournal } from "@/lib/services/demo-store"

/** "Apagar o que a demonstração guardou" (issue 071): o cookie sai e tudo volta ao exemplo */
export async function clearDemo(): Promise<void> {
  if (!isLive("products")) await clearJournal()
}
