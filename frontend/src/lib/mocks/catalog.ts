/**
 * Catálogo de demonstração.
 *
 * Nomes, marcas, distribuidores e faixas de preço são de farmácia de verdade.
 * Um mock ruim faz a demonstração parecer falsa, e essa é a tela que a equipe
 * vai apresentar. Ver docs/08-project/plano.md, fase 1.
 *
 * As validades são declaradas em dias a partir de hoje, nunca em data fixa,
 * para o protótipo não envelhecer entre a construção e a apresentação.
 */

import {
  DEFAULT_SOON_THRESHOLD_DAYS,
  getExpiryStatus,
  type ExpiryStatus,
} from "@/lib/utils/expiry"
import { calendarToday } from "@/lib/utils/calendar"
import { daily } from "@/lib/utils/daily"
import type { Folder, ImportSource, Lot, Product, ProductUnit } from "@/lib/types"

/**
 * Hoje no calendário de Brasília, como meia-noite UTC. Era o dia em UTC, que às
 * 22h de Brasília já é amanhã.
 *
 * Lido a cada chamada desde a issue 065. Até ali era uma constante calculada
 * quando o servidor ligava: servidor ligado desde a véspera mostrava os lotes
 * com um dia de diferença (o local estava em 10/10 enquanto a produção, recém
 * publicada, estava em 11/10).
 */
export function mockToday(): Date {
  return calendarToday()
}

export { daily }

export function isoInDays(days: number): string {
  const d = new Date(mockToday())
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

/** Brasília: UTC-3, sem horário de verão desde 2019 */
const BRASILIA_OFFSET_HOURS = 3

/**
 * Instante UTC de uma hora de relógio em Brasília, `daysAgo` dias atrás.
 * A API manda UTC de verdade; o mock precisa mandar igual, senão a tela parece
 * certa aqui e erra 3 horas com o backend. O maior horário do mock é 19:48,
 * então nenhum evento troca de dia.
 */
export function isoAtLocalTime(daysAgo: number, time: string): string {
  const [hour, minute] = time.split(":").map(Number)
  const d = new Date(isoInDays(-daysAgo))
  d.setUTCHours(hour + BRASILIA_OFFSET_HOURS, minute, 0, 0)
  return d.toISOString()
}

export const FOLDERS: Folder[] = [
  { id: "f1", name: "Medicamentos", productCount: 0, active: true },
  { id: "f2", name: "Genéricos", productCount: 0, active: true },
  { id: "f3", name: "Dermocosméticos", productCount: 0, active: true },
  { id: "f4", name: "Higiene e beleza", productCount: 0, active: true },
  { id: "f5", name: "Infantil", productCount: 0, active: true },
  { id: "f6", name: "Suplementos", productCount: 0, active: true },
]

const SUPPLIERS = [
  "Distribuidora Panarello",
  "Servimed",
  "Profarma",
  "Santa Cruz Distribuidora",
  "Global Distribuição",
]

/** [código do lote, vence em N dias, quantidade, fabricado há N dias] */
type LotSeed = [string, number, number, number]

interface Seed {
  n: string
  /** pasta; null é produto que chegou sem pasta (issue 068, item 69) */
  f: string | null
  b: string
  u?: ProductUnit
  min: number
  /** custo de aquisição, em centavos */
  c: number
  /** preço de venda, em centavos */
  p: number
  src?: ImportSource
  lots?: LotSeed[]
}

/**
 * Produto importado sem lote ainda tem quantidade, porque o sistema da farmácia
 * controla estoque mas não controla validade. É exatamente o diagnóstico do
 * projeto: o controle de vencimento está no papel. Ver import-strategy.md seção 2.
 */
function quantityWithoutLots(seed: Seed, index: number): number {
  return Math.round(seed.min * 1.7) + ((index * 5) % 13)
}

// prettier-ignore
const SEEDS: Seed[] = [
  // Medicamentos de marca
  { n: "Dipirona Sódica 500mg, 20 comprimidos", f: "f1", b: "Neo Química", min: 20, c: 742, p: 1490, lots: [["L2291", -12, 14, 540], ["L2318", 41, 62, 300]] },
  { n: "Dorflex, 36 comprimidos", f: "f1", b: "Sanofi", min: 15, c: 1863, p: 3290, lots: [["DF7741", 19, 28, 420]] },
  { n: "Buscopan Composto, 20 comprimidos", f: "f1", b: "Sanofi", min: 12, c: 2140, p: 3780, lots: [["BC5502", 8, 9, 610]] },
  { n: "Novalgina Gotas 500mg/ml, 20ml", f: "f1", b: "Sanofi", min: 10, c: 1425, p: 2560, lots: [["NV8830", 124, 34, 180]] },
  { n: "Neosaldina, 30 drágeas", f: "f1", b: "Hypera", min: 18, c: 1690, p: 2990, lots: [["NS4417", 27, 41, 360]] },
  { n: "Torsilax, 30 comprimidos", f: "f1", b: "Neo Química", min: 12, c: 1318, p: 2340, lots: [["TS9126", -34, 6, 720]] },
  { n: "Advil 400mg, 8 comprimidos", f: "f1", b: "Haleon", min: 10, c: 1105, p: 1980, lots: [["AD3390", 212, 22, 120]] },
  { n: "Benegrip Multi, 20 comprimidos", f: "f1", b: "Hypera", min: 14, c: 1572, p: 2760, lots: [["BG6618", 23, 17, 400]] },
  { n: "Rinosoro Jet 0,9%, 50ml", f: "f1", b: "Aché", min: 16, c: 1244, p: 2190, lots: [["RS2204", 156, 45, 210]] },
  { n: "Allegra 120mg, 10 comprimidos", f: "f1", b: "Sanofi", min: 8, c: 3480, p: 5890, lots: [["AL7733", 11, 7, 500]] },
  { n: "Predsim 20mg, 10 comprimidos", f: "f1", b: "EMS", min: 8, c: 1836, p: 3120, lots: [["PD1159", 64, 19, 280]] },
  { n: "Amoxil BD 875mg, 14 comprimidos", f: "f1", b: "GSK", min: 6, c: 4270, p: 6950, lots: [["AX5581", 5, 4, 640]] },
  { n: "Tylenol 750mg, 20 comprimidos", f: "f1", b: "Kenvue", min: 20, c: 2015, p: 3450, lots: [["TY4402", 96, 53, 240]] },
  { n: "Xarelto 20mg, 28 comprimidos", f: "f1", b: "Bayer", min: 4, c: 18740, p: 27900, lots: [["XR0092", 148, 6, 200]] },
  { n: "Aspirina Prevent 100mg, 30 comprimidos", f: "f1", b: "Bayer", min: 12, c: 1690, p: 2870, lots: [["AS8871", 29, 24, 380]] },
  { n: "Dramin B6 DL, 10 comprimidos", f: "f1", b: "Takeda", min: 8, c: 2234, p: 3690, src: "manual" },
  { n: "Cataflam Pro Emulgel 30g", f: "f1", b: "GSK", min: 10, c: 2860, p: 4590, lots: [["CF3345", 3, 5, 690]] },
  { n: "Salonpas Adesivo, 12 unidades", f: "f1", b: "Hisamitsu", min: 15, c: 1128, p: 1990 },
  { n: "Vick Vaporub 50g", f: "f1", b: "P&G", min: 12, c: 1745, p: 2980, lots: [["VK6620", 271, 38, 90]] },
  { n: "Lacto Purga, 6 comprimidos", f: "f1", b: "Hypera", min: 10, c: 845, p: 1560 },

  // Genéricos
  { n: "Losartana Potássica 50mg, 30 comprimidos", f: "f2", b: "EMS", min: 30, c: 918, p: 1840, lots: [["LS4471", 16, 52, 430], ["LS4602", 187, 88, 150]] },
  { n: "Omeprazol 20mg, 28 cápsulas", f: "f2", b: "Medley", min: 35, c: 762, p: 1590, lots: [["OM2218", -7, 11, 560]] },
  { n: "Sinvastatina 20mg, 30 comprimidos", f: "f2", b: "EMS", min: 25, c: 1034, p: 2090, lots: [["SV7719", 74, 47, 260]] },
  { n: "Metformina 850mg, 30 comprimidos", f: "f2", b: "Medley", min: 28, c: 872, p: 1730, lots: [["MF5563", 21, 33, 390]] },
  { n: "Atenolol 25mg, 30 comprimidos", f: "f2", b: "Neo Química", min: 20, c: 694, p: 1420, lots: [["AT1108", 134, 61, 200]] },
  { n: "Amoxicilina 500mg, 21 cápsulas", f: "f2", b: "Medley", min: 15, c: 1946, p: 3290, lots: [["AM9930", 9, 12, 580]] },
  { n: "Ibuprofeno 600mg, 20 comprimidos", f: "f2", b: "Germed", min: 18, c: 1187, p: 2240, lots: [["IB6647", 58, 29, 310]] },
  { n: "Azitromicina 500mg, 5 comprimidos", f: "f2", b: "EMS", min: 12, c: 2415, p: 3980, lots: [["AZ3372", 26, 16, 370]] },
  { n: "Cloridrato de Sertralina 50mg, 30 comprimidos", f: "f2", b: "Eurofarma", min: 14, c: 2683, p: 4350, lots: [["SR8814", 102, 21, 230]] },
  { n: "Maleato de Enalapril 10mg, 30 comprimidos", f: "f2", b: "Neo Química", min: 22, c: 738, p: 1490, lots: [["EN2256", -21, 8, 660]] },
  { n: "Prednisona 20mg, 10 comprimidos", f: "f2", b: "Medley", min: 10, c: 1092, p: 1980, lots: [["PR4438", 13, 14, 470]] },
  { n: "Dexametasona Creme 0,1%, 10g", f: "f2", b: "Germed", min: 12, c: 894, p: 1670, lots: [["DX7701", 218, 36, 130]] },
  { n: "Levotiroxina Sódica 50mcg, 30 comprimidos", f: "f2", b: "Merck", min: 16, c: 1268, p: 2340, lots: [["LV5590", 38, 27, 330]] },
  { n: "Cloridrato de Metoclopramida 10mg, 20 comprimidos", f: "f2", b: "EMS", min: 12, c: 786, p: 1520 },
  { n: "Pantoprazol 40mg, 28 comprimidos", f: "f2", b: "Eurofarma", min: 18, c: 1934, p: 3280, lots: [["PT6612", 165, 42, 180]] },
  { n: "Hidroclorotiazida 25mg, 30 comprimidos", f: "f2", b: "Neo Química", min: 20, c: 648, p: 1340 },
  { n: "Ciprofloxacino 500mg, 14 comprimidos", f: "f2", b: "Medley", min: 10, c: 2178, p: 3590, lots: [["CP8825", 7, 6, 600]] },
  { n: "Nimesulida 100mg, 12 comprimidos", f: "f2", b: "Germed", min: 20, c: 682, p: 1390, lots: [["NM3317", 47, 38, 340]] },
  { n: "Cloridrato de Fluoxetina 20mg, 30 cápsulas", f: "f2", b: "EMS", min: 14, c: 1456, p: 2590 },
  { n: "Dipirona Monoidratada Gotas, 10ml", f: "f2", b: "Prati-Donaduzzi", min: 25, c: 512, p: 1090, lots: [["DP9943", 79, 66, 250]] },

  // Dermocosméticos
  { n: "Protetor Solar Anthelios FPS 60, 120g", f: "f3", b: "La Roche-Posay", min: 8, c: 6840, p: 10990, lots: [["AH2290", 34, 13, 320]] },
  { n: "CeraVe Loção Hidratante 236ml", f: "f3", b: "CeraVe", min: 10, c: 7215, p: 11450, lots: [["CV5518", 245, 19, 110]] },
  { n: "Vichy Normaderm Gel de Limpeza 300ml", f: "f3", b: "Vichy", min: 6, c: 8130, p: 12900, lots: [["VN7746", 24, 8, 350]] },
  { n: "Neutrogena Hydro Boost Água em Gel 50g", f: "f3", b: "Neutrogena", min: 8, c: 5490, p: 8790, lots: [["NH1182", 189, 15, 160]] },
  { n: "Episol Sérum FPS 70, 60g", f: "f3", b: "Mantecorp", min: 6, c: 7380, p: 11690, lots: [["EP4429", 12, 5, 490]] },
  { n: "Cetaphil Loção Hidratante 473ml", f: "f3", b: "Galderma", min: 6, c: 9240, p: 14500 },
  { n: "Bepantol Derma Solução 50ml", f: "f3", b: "Bayer", min: 10, c: 5680, p: 8990, lots: [["BD3358", 143, 24, 190]] },
  { n: "Avène Thermal Água Termal 300ml", f: "f3", b: "Pierre Fabre", min: 5, c: 6120, p: 9780 },
  { n: "Minancora Creme Preventivo 60g", f: "f3", b: "Minancora", min: 12, c: 1834, p: 3190, lots: [["MN6674", 298, 41, 70]] },
  { n: "Hidratante Nivea Body Milk 400ml", f: "f3", b: "Nivea", min: 14, c: 2145, p: 3690, lots: [["NB8801", -3, 9, 550]] },

  // Higiene e beleza
  { n: "Creme Dental Colgate Total 12, 90g", f: "f4", b: "Colgate", min: 30, c: 748, p: 1390, lots: [["CD2217", 312, 94, 60]] },
  { n: "Enxaguante Listerine Cool Mint 500ml", f: "f4", b: "Listerine", min: 18, c: 2216, p: 3590, lots: [["LT5563", 168, 37, 170]] },
  { n: "Sabonete Dove Original 90g", f: "f4", b: "Dove", min: 40, c: 312, p: 690, lots: [["DV9928", 401, 152, 40]] },
  { n: "Desodorante Rexona Clinical 48g", f: "f4", b: "Rexona", min: 20, c: 2894, p: 4490, lots: [["RX4471", 58, 26, 300]] },
  { n: "Shampoo Pantene Restauração 400ml", f: "f4", b: "Pantene", min: 16, c: 1978, p: 3290, lots: [["PN6615", 227, 31, 120]] },
  { n: "Fio Dental Oral-B Essential 50m", f: "f4", b: "Oral-B", min: 24, c: 682, p: 1290 },
  { n: "Álcool em Gel 70%, 500ml", f: "f4", b: "Rioquímica", min: 20, c: 934, p: 1690, lots: [["AG7739", 17, 43, 410]] },
  { n: "Absorvente Always Noturno, 8 unidades", f: "f4", b: "Always", min: 30, c: 856, p: 1590 },
  { n: "Aparelho de Barbear Gillette Prestobarba 3, 4 unidades", f: "f4", b: "Gillette", min: 18, c: 1624, p: 2690 },
  { n: "Cotonete Johnson's, 75 hastes", f: "f4", b: "Johnson's", min: 25, c: 498, p: 990, lots: [["CJ1103", 356, 88, 50]] },
  { n: "Hidratante Labial Carmed 10g", f: "f4", b: "Cimed", min: 22, c: 976, p: 1790, lots: [["CM8846", 30, 57, 290]] },
  { n: "Escova Dental Colgate Twister", f: "f4", b: "Colgate", min: 20, c: 742, p: 1390 },

  // Infantil
  { n: "Fralda Pampers Confort Sec M, 42 unidades", f: "f5", b: "Pampers", min: 12, c: 4180, p: 6490, lots: [["PC5527", 334, 23, 60]] },
  { n: "Lenço Umedecido Huggies, 48 unidades", f: "f5", b: "Huggies", min: 20, c: 1245, p: 2190, lots: [["HG3392", 142, 44, 180]] },
  { n: "Pomada Hipoglós 45g", f: "f5", b: "Hipoglós", min: 15, c: 2087, p: 3390, lots: [["HP6658", 26, 18, 340]] },
  { n: "Shampoo Johnson's Baby 200ml", f: "f5", b: "Johnson's", min: 18, c: 1432, p: 2490, lots: [["JB2274", 265, 35, 100]] },
  { n: "Mamadeira Avent Natural 260ml", f: "f5", b: "Philips Avent", min: 6, c: 5340, p: 8290 },
  { n: "Chupeta Nuk Silicone 0 a 6 meses", f: "f5", b: "Nuk", min: 10, c: 2178, p: 3490 },
  { n: "Leite Nan Comfor 1, 400g", f: "f5", b: "Nestlé", min: 10, c: 5920, p: 8990, lots: [["NC4416", 14, 11, 460]] },
  { n: "Termômetro Digital Infantil G-Tech", f: "f5", b: "G-Tech", min: 8, c: 2645, p: 4290 },

  // Suplementos
  { n: "Redoxon Vitamina C 1g, 30 comprimidos efervescentes", f: "f6", b: "Bayer", min: 14, c: 3268, p: 5190, lots: [["RD7712", 88, 22, 240]] },
  { n: "Ômega 3 1000mg, 60 cápsulas", f: "f6", b: "Sundown", min: 12, c: 4135, p: 6490, lots: [["OG5583", 31, 16, 320]] },
  { n: "Whey Protein Baunilha 900g", f: "f6", b: "Integralmédica", min: 6, c: 12480, p: 18900, lots: [["WP9917", 172, 9, 150]] },
  { n: "Centrum Homem, 30 comprimidos", f: "f6", b: "Haleon", min: 10, c: 4762, p: 7290, lots: [["CT2238", 6, 7, 620]] },
  { n: "Magnésio Dimalato 60 cápsulas", f: "f6", b: "Vitgold", min: 12, c: 3418, p: 5390 },
  { n: "Creatina Monohidratada 300g", f: "f6", b: "Max Titanium", min: 8, c: 7940, p: 11900, lots: [["CR6640", 209, 12, 130]] },
  { n: "Colágeno Verisol 30 sachês", f: "f6", b: "Sanavita", min: 6, c: 8615, p: 12900 },
  { n: "Vitamina D3 2000UI, 60 cápsulas", f: "f6", b: "Vitafor", min: 12, c: 3892, p: 5990, lots: [["VD4451", 44, 20, 300]] },
  { n: "Multivitamínico A-Z, 60 comprimidos", f: "f6", b: "Vitgold", min: 10, c: 2734, p: 4390 },
  { n: "Suplemento de Ferro Quelato, 60 cápsulas", f: "f6", b: "Vitafor", min: 10, c: 3156, p: 4990, lots: [["FQ8873", 19, 13, 380]] },
  // Sem pasta (issue 068): o que veio da planilha e ninguém classificou ainda
  { n: "Soro Fisiológico 0,9% 500ml", f: null, b: "Equiplex", min: 10, c: 412, p: 790, lots: [["SF2207", 24, 18, 200]] },
  { n: "Álcool 70% Líquido 1L", f: null, b: "Tupi", min: 12, c: 860, p: 1490, lots: [["AL5530", 160, 30, 60]] },
  { n: "Termômetro Clínico Digital", f: null, b: "G-Tech", min: 4, c: 1890, p: 3490 },
  { n: "Esparadrapo Impermeável 10cm x 4,5m", f: null, b: "Cremer", min: 8, c: 690, p: 1290, lots: [["ES1182", -4, 6, 700], ["ES1240", 210, 4, 30]] },
]

/** Dígito verificador de EAN-13, para o código de barras não ser número aleatório. */
function ean13(base12: string): string {
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(base12[i]) * (i % 2 === 0 ? 1 : 3)
  return base12 + String((10 - (sum % 10)) % 10)
}

const SKU_PREFIX: Record<string, string> = {
  f1: "MED",
  f2: "GEN",
  f3: "DER",
  f4: "HIG",
  f5: "INF",
  f6: "SUP",
}

function buildProduct(seed: Seed, index: number): Product {
  const id = `p${index + 1}`
  const folder = FOLDERS.find((f) => f.id === seed.f) ?? null
  const sku = `${seed.f ? SKU_PREFIX[seed.f] : "GER"}-${String(1040 + index * 7).padStart(4, "0")}`
  const barcode = ean13(`789${String(100000000 + index * 137419).slice(0, 9)}`)
  const source: ImportSource = seed.src ?? (seed.lots ? "file" : "file")
  const unit: ProductUnit = seed.u ?? "un"

  const lots: Lot[] = (seed.lots ?? []).map((l, i) => {
    const [code, inDays, quantity, madeDaysAgo] = l
    const expiresAt = isoInDays(inDays)
    return {
      id: `${id}-l${i + 1}`,
      productId: id,
      code,
      manufacturedAt: isoInDays(-madeDaysAgo),
      expiresAt,
      quantity,
      status: getExpiryStatus(expiresAt, DEFAULT_SOON_THRESHOLD_DAYS, mockToday()),
    }
  })

  // O produto assume o status do lote que vence primeiro. Ver business-rules 1.5.
  const sorted = [...lots].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
  )
  const nearest = sorted[0] ?? null
  const nearestExpiryStatus: ExpiryStatus = nearest ? nearest.status : "unknown"

  return {
    id,
    name: seed.n,
    sku,
    barcode,
    folderId: folder?.id ?? null,
    folderName: folder?.name ?? null,
    brand: seed.b,
    supplier: SUPPLIERS[index % SUPPLIERS.length],
    unit,
    minStock: seed.min,
    maxStock: seed.min * 6,
    acquisitionCost: seed.c,
    photoUrl: null,
    operationalCost: Math.round(seed.c * 0.08),
    salePrice: seed.p,
    totalQuantity: lots.length
      ? lots.reduce((sum, l) => sum + l.quantity, 0)
      : quantityWithoutLots(seed, index),
    nearestExpiry: nearest?.expiresAt ?? null,
    nearestExpiryStatus,
    lots,
    source,
    externalId: source === "manual" ? null : `EXT-${9000 + index}`,
    active: true,
  }
}

export const mockProducts = daily((): Product[] => SEEDS.map(buildProduct))
