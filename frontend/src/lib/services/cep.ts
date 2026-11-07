import { cepDigits, parseViaCep, type CepAddress } from "@/lib/utils/cep"

export type CepLookup = { ok: true; address: CepAddress } | { ok: false; reason: "not_found" | "unreachable" }

/**
 * Endereço pelo CEP na ViaCEP (issue 063), serviço público e gratuito. É a
 * única chamada da camada de serviço que sai do navegador para fora da API do
 * Pedro: só manda o CEP, nada da conta. Ver docs/01-references/architecture.md.
 * Cinco segundos no máximo: sem resposta, a pessoa digita o endereço.
 */
export async function lookupCep(cep: string): Promise<CepLookup> {
  const digits = cepDigits(cep)
  if (digits.length !== 8) return { ok: false, reason: "not_found" }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: AbortSignal.timeout(5000),
    })
    if (response.status === 400) return { ok: false, reason: "not_found" }
    if (!response.ok) return { ok: false, reason: "unreachable" }
    const address = parseViaCep(await response.json())
    return address ? { ok: true, address } : { ok: false, reason: "not_found" }
  } catch {
    return { ok: false, reason: "unreachable" }
  }
}
