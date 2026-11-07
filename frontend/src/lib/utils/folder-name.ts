/**
 * Nome de pasta (issues 039 e 057): o aviso antes de enviar. O servidor
 * confirma com `409 FOLDER_NAME_TAKEN` (contrato v20, proposto).
 */

export const MAX_FOLDER_NAME = 60

/** O nome limpo, ou o motivo de não servir. `others` são as outras pastas da conta */
export function validateFolderName(
  typed: string,
  others: readonly { name: string }[],
): { name: string; error: string | null } {
  const name = typed.trim().replace(/\s+/g, " ")
  if (!name) return { name, error: "Dê um nome à pasta." }
  if (name.length > MAX_FOLDER_NAME) return { name, error: `Use até ${MAX_FOLDER_NAME} letras.` }
  const taken = others.find((f) => f.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))
  if (taken) return { name, error: `Já existe a pasta ${taken.name}. Escolha outro nome.` }
  return { name, error: null }
}
