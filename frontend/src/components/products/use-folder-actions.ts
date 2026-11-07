"use client"

import { useState } from "react"
import type { FolderRow } from "@/components/products/folder-table"
import { addFolder, removeFolder, saveFolderName, toggleFolder } from "@/lib/actions/folders"
import { UNREACHABLE } from "@/lib/actions/result"
import { validateFolderName } from "@/lib/utils/folder-name"
import { formatNumber } from "@/lib/utils/format"
import type { Folder } from "@/lib/types"

export type OpenDialog =
  | { kind: "create" }
  | { kind: "rename"; folder: FolderRow }
  | { kind: "delete"; folder: FolderRow }
  | { kind: "bulk" }
  | null

const products = (n: number) => `${formatNumber(n)} ${n === 1 ? "produto" : "produtos"}`

/**
 * O que a tela Pastas grava (issues 057 e 076), separado da tela para ela
 * caber em 200 linhas. Cada ação chama a server action; deu certo, fecha a
 * janela, escreve a confirmação e pede a página de novo (`onDone`). A recusa
 * fica na janela, ou acima da lista quando veio de um botão da linha.
 */
export function useFolderActions({
  folders,
  onDone,
  onDeleted,
}: {
  folders: Folder[]
  onDone: () => void
  onDeleted: () => void
}) {
  const [open, setOpen] = useState<OpenDialog>(null)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [rowFailure, setRowFailure] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function show(next: OpenDialog, typed = "") {
    setOpen(next)
    setName(typed)
    setError(null)
    setFailure(null)
    if (next) setRowFailure(null)
  }

  function done(message: string) {
    setNotice(message)
    show(null)
    onDone()
  }

  async function save() {
    if (!open || (open.kind !== "create" && open.kind !== "rename") || saving) return
    const others = folders.filter((f) => open.kind === "create" || f.id !== open.folder.id)
    const checked = validateFolderName(name, others)
    setFailure(null)
    setError(checked.error)
    if (checked.error) return document.getElementById("nome-pasta")?.focus()

    setSaving(true)
    const result = await (
      open.kind === "create" ? addFolder(checked.name) : saveFolderName(open.folder.id, checked.name)
    ).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) {
      if (result.code === "FOLDER_NAME_TAKEN") setError(result.message)
      else setFailure(result.message)
      return
    }
    done(
      open.kind === "create"
        ? `Pasta ${result.data.name} criada.`
        : `Pasta renomeada para ${result.data.name}.`,
    )
  }

  /** Desativar e ativar (item 65): volta com um toque, então não pede confirmação (Primer) */
  async function toggle(folder: FolderRow) {
    if (busyId) return
    setBusyId(folder.id)
    setRowFailure(null)
    const result = await toggleFolder(folder.id, !folder.active).catch(() => UNREACHABLE)
    setBusyId(null)
    if (!result.ok) return setRowFailure(result.message)
    done(
      folder.active
        ? `Pasta ${folder.name} desativada. Ela não aparece mais para escolher; ${
            folder.productCount === 0
              ? "não tem produtos."
              : `${products(folder.productCount)} ${folder.productCount === 1 ? "continua" : "continuam"} nela.`
          }`
        : `Pasta ${folder.name} ativada. Ela volta a aparecer para escolher.`,
    )
  }

  /** Excluir uma (item 110): com produto, eles vão para `moveTo` (null = sem pasta) */
  async function remove(folder: FolderRow, moveTo: string | null) {
    if (saving) return
    setSaving(true)
    setFailure(null)
    const withProducts = folder.productCount > 0
    const result = await removeFolder(folder.id, withProducts ? moveTo : undefined).catch(() => UNREACHABLE)
    setSaving(false)
    if (!result.ok) return setFailure(result.message)
    const target = folders.find((f) => f.id === moveTo)?.name
    const one = folder.productCount === 1
    const where = target
      ? `${one ? "foi" : "foram"} para ${target}`
      : `${one ? "ficou" : "ficaram"} sem pasta`
    onDeleted()
    done(
      withProducts
        ? `Pasta ${folder.name} excluída. ${products(folder.productCount)} ${where}.`
        : `Pasta ${folder.name} excluída.`,
    )
  }

  /** Excluir as vazias marcadas (item 66), uma a uma; para na primeira recusa e diz quantas saíram */
  async function removeMany(empty: FolderRow[]) {
    if (saving) return
    setSaving(true)
    setFailure(null)
    let removed = 0
    for (const folder of empty) {
      const result = await removeFolder(folder.id).catch(() => UNREACHABLE)
      if (!result.ok) {
        setSaving(false)
        setFailure(
          removed > 0
            ? `${formatNumber(removed)} excluídas. ${folder.name}: ${result.message}`
            : result.message,
        )
        if (removed > 0) onDone()
        return
      }
      removed++
    }
    setSaving(false)
    onDeleted()
    done(removed === 1 ? `Pasta ${empty[0].name} excluída.` : `${formatNumber(removed)} pastas excluídas.`)
  }

  return {
    open,
    show,
    name,
    typeName: (typed: string) => {
      setName(typed)
      setError(null)
    },
    error,
    failure,
    rowFailure,
    saving,
    busyId,
    notice,
    save,
    toggle,
    remove,
    removeMany,
  }
}
