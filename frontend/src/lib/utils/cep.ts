/**
 * CEP para preencher o endereço (issue 063). A busca é na ViaCEP, chamada do
 * navegador (`src/lib/services/cep.ts`); aqui fica o que dá para testar sem
 * rede: limpar o que a pessoa digitou e ler a resposta.
 */

export type CepAddress = { street: string; district: string; city: string; state: string }

/** Só os números: "44380-000" e "44.380-000" viram "44380000" */
export function cepDigits(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * A resposta da ViaCEP: `{ erro: true }` quando o CEP não existe, e logradouro
 * e bairro vazios em cidade de CEP único. Devolve null quando não há cidade.
 */
export function parseViaCep(data: unknown): CepAddress | null {
  if (!data || typeof data !== "object") return null
  const d = data as Record<string, unknown>
  if (d.erro) return null
  const text = (key: string) => (typeof d[key] === "string" ? (d[key] as string).trim() : "")
  const city = text("localidade")
  if (!city) return null
  return { street: text("logradouro"), district: text("bairro"), city, state: text("uf") }
}
