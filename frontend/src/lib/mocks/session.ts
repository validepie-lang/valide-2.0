/**
 * Sessão de demonstração.
 *
 * Não é autenticação. Não existe token, não existe verificação e nada disso
 * protege coisa nenhuma. É só o dado que o cabeçalho e a tela de perfil exibem
 * enquanto o endpoint do Pedro não existe. Ver CLAUDE.md seção 3.
 */

import type { Company, User } from "@/lib/types"

export const CURRENT_USER: User = {
  id: "u1",
  name: "Marcus Campos",
  login: "marcus.campos",
  role: "admin",
  active: true,
  avatarUrl: null,
}

/**
 * Rafael é o farmacêutico porque os mocks de movimento atribuem a ele a saída
 * por avaria, e descarte de Balconista não existe no banco.
 */
export const TEAM: User[] = [
  CURRENT_USER,
  {
    id: "u3",
    name: "Rafael Nogueira",
    login: "rafael.nogueira",
    role: "pharmacist",
    active: true,
    avatarUrl: null,
  },
  {
    id: "u2",
    name: "Juliana Ferreira",
    login: "juliana.ferreira",
    role: "clerk",
    active: true,
    avatarUrl: null,
  },
  {
    id: "u4",
    name: "Camila Duarte",
    login: "camila.duarte",
    role: "clerk",
    active: true,
    avatarUrl: null,
  },
  {
    id: "u5",
    name: "Bruno Teixeira",
    login: "bruno.teixeira",
    role: "clerk",
    active: false,
    avatarUrl: null,
  },
]

export const CURRENT_COMPANY: Company = {
  id: "c1",
  cnpj: "18.472.905/0001-20",
  legalName: "Preço Popular Comércio de Medicamentos Ltda",
  tradeName: "Farmácia Preço Popular",
  stateRegistration: "07.412.883-1",
  cityRegistration: null,
  taxRegime: "Simples Nacional",
  address: {
    zipCode: "40140-060",
    street: "Rua Barão de Itapoan",
    number: "217",
    complement: "Loja 2",
    district: "Barra",
    city: "Salvador",
    state: "BA",
  },
  phone: "(71) 3334-8890",
  email: "contato@precopopular.com.br",
  website: null,
  logoUrl: null,
  timezone: "America/Bahia",
  currency: "BRL",
  locale: "pt-BR",
  soonThresholdDays: 30,
}
