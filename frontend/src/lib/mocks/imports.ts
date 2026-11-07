/**
 * Importação de demonstração.
 *
 * O arquivo simula uma exportação real do sistema de uma farmácia: cabeçalho
 * em português, colunas com nome próprio do fornecedor, e nenhuma coluna de
 * lote ou validade. É o cenário previsto em import-strategy.md seção 2.
 */

import { daily, isoAtLocalTime } from "@/lib/mocks/catalog"
import type { ImportJob, ImportPreviewRow } from "@/lib/types"

/** Campos do Valide que o mapeamento pode preencher. */
export const VALIDE_FIELDS = [
  { key: "name", label: "Nome do produto", required: true },
  { key: "sku", label: "Código interno (SKU)", required: false },
  { key: "barcode", label: "Código de barras", required: false },
  { key: "brand", label: "Marca", required: false },
  { key: "supplier", label: "Fornecedor", required: false },
  { key: "folderName", label: "Pasta de classificação", required: false },
  { key: "unit", label: "Unidade de medida", required: false },
  { key: "totalQuantity", label: "Quantidade em estoque", required: false },
  { key: "minStock", label: "Estoque mínimo", required: false },
  { key: "acquisitionCost", label: "Custo de aquisição", required: false },
  { key: "salePrice", label: "Preço de venda", required: false },
  { key: "lotCode", label: "Número do lote", required: false },
  { key: "expiresAt", label: "Data de validade", required: false },
] as const

/** Cabeçalhos encontrados no arquivo, com três linhas de exemplo cada. */
export const DETECTED_COLUMNS: { name: string; samples: string[] }[] = [
  { name: "DESCRICAO_PRODUTO", samples: ["DIPIRONA SODICA 500MG C/20", "DORFLEX C/36", "OMEPRAZOL 20MG C/28"] },
  { name: "COD_INTERNO", samples: ["004182", "004183", "004184"] },
  { name: "COD_BARRAS", samples: ["7891058001148", "7896112103127", "7896006210160"] },
  { name: "FABRICANTE", samples: ["NEO QUIMICA", "SANOFI", "MEDLEY"] },
  { name: "GRUPO", samples: ["MEDICAMENTO", "MEDICAMENTO", "GENERICO"] },
  { name: "UNID", samples: ["UN", "UN", "UN"] },
  { name: "QTD_ESTOQUE", samples: ["76", "28", "11"] },
  { name: "EST_MINIMO", samples: ["20", "15", "35"] },
  { name: "VLR_CUSTO", samples: ["7,42", "18,63", "7,62"] },
  { name: "VLR_VENDA", samples: ["14,90", "32,90", "15,90"] },
  { name: "FORNECEDOR", samples: ["PANARELLO", "SERVIMED", "PANARELLO"] },
  { name: "NCM", samples: ["30049099", "30049069", "30049099"] },
]

/** Palpite automático do sistema. O usuário corrige o que estiver errado. */
export const SUGGESTED_MAPPING: Record<string, string> = {
  DESCRICAO_PRODUTO: "name",
  COD_INTERNO: "sku",
  COD_BARRAS: "barcode",
  FABRICANTE: "brand",
  GRUPO: "folderName",
  UNID: "unit",
  QTD_ESTOQUE: "totalQuantity",
  EST_MINIMO: "minStock",
  VLR_CUSTO: "acquisitionCost",
  VLR_VENDA: "salePrice",
  FORNECEDOR: "supplier",
  NCM: "",
}

/** Refeitos a cada dia (issue 065): a data da importação é "hoje às 9:32" */
export const mockImportJob = daily((): ImportJob => ({
  id: "imp_7fa2",
  source: "file",
  status: "previewing",
  fileName: "catalogo-setembro.xlsx",
  detectedColumns: DETECTED_COLUMNS.map((c) => c.name),
  mapping: SUGGESTED_MAPPING,
  totalRows: 814,
  validRows: 800,
  errorRows: 14,
  createdRows: 738,
  updatedRows: 62,
  createdAt: isoAtLocalTime(0, "09:32"),
  finishedAt: null,
}))

/** Amostra da revisão, com os problemas que aparecem em arquivo de verdade. */
// prettier-ignore
export const PREVIEW_ROWS: ImportPreviewRow[] = [
  { rowNumber: 1,  action: "create", issues: [], data: { name: "Dipirona Sódica 500mg, 20 comprimidos", sku: "004182", barcode: "7891058001148", brand: "Neo Química", totalQuantity: 76, unit: "un", acquisitionCost: 742 } },
  { rowNumber: 2,  action: "update", issues: [], data: { name: "Dorflex, 36 comprimidos", sku: "004183", barcode: "7896112103127", brand: "Sanofi", totalQuantity: 28, unit: "un", acquisitionCost: 1863 } },
  { rowNumber: 3,  action: "create", issues: [{ field: "acquisitionCost", severity: "warning", message: "O preço de venda ficou abaixo do custo de compra. Confira antes de importar." }], data: { name: "Omeprazol 20mg, 28 cápsulas", sku: "004184", barcode: "7896006210160", brand: "Medley", totalQuantity: 11, unit: "un", acquisitionCost: 1590 } },
  { rowNumber: 4,  action: "create", issues: [], data: { name: "Losartana Potássica 50mg, 30 comprimidos", sku: "004185", barcode: "7896004704265", brand: "EMS", totalQuantity: 140, unit: "un", acquisitionCost: 918 } },
  { rowNumber: 5,  action: "skip",   issues: [{ field: "name", severity: "error", message: "A coluna de nome do produto está vazia nesta linha." }], data: { sku: "004186", barcode: "7896714203118", totalQuantity: 9, unit: "un" } },
  { rowNumber: 6,  action: "create", issues: [], data: { name: "Protetor Solar Anthelios FPS 60, 120g", sku: "004187", barcode: "7899026473156", brand: "La Roche-Posay", totalQuantity: 13, unit: "un", acquisitionCost: 6840 } },
  { rowNumber: 7,  action: "skip",   issues: [{ field: "barcode", severity: "error", message: "Este código de barras aparece duas vezes no arquivo, nas linhas 7 e 241." }], data: { name: "Neosaldina, 30 drágeas", sku: "004188", barcode: "7896112103127", totalQuantity: 41, unit: "un" } },
  { rowNumber: 8,  action: "update", issues: [], data: { name: "Buscopan Composto, 20 comprimidos", sku: "004189", barcode: "7891058014209", brand: "Sanofi", totalQuantity: 9, unit: "un", acquisitionCost: 2140 } },
  { rowNumber: 9,  action: "create", issues: [{ field: "totalQuantity", severity: "warning", message: "A quantidade veio como texto e foi lida como 0. Confira depois de importar." }], data: { name: "Creme Dental Colgate Total 12, 90g", sku: "004190", barcode: "7891024134672", brand: "Colgate", totalQuantity: 0, unit: "un", acquisitionCost: 748 } },
  { rowNumber: 10, action: "create", issues: [], data: { name: "Fralda Pampers Confort Sec M, 42 unidades", sku: "004191", barcode: "7506339395792", brand: "Pampers", totalQuantity: 23, unit: "un", acquisitionCost: 4180 } },
  { rowNumber: 11, action: "create", issues: [], data: { name: "Vitamina C 1g, 30 comprimidos efervescentes", sku: "004192", barcode: "7891106910415", brand: "Bayer", totalQuantity: 22, unit: "un", acquisitionCost: 3268 } },
  { rowNumber: 12, action: "update", issues: [], data: { name: "Álcool em Gel 70%, 500ml", sku: "004193", barcode: "7896108800115", brand: "Rioquímica", totalQuantity: 43, unit: "un", acquisitionCost: 934 } },
]

/** Histórico das últimas importações, para a tela de resultado e as integrações. */
export const mockImportHistory = daily((): ImportJob[] => [
  { ...mockImportJob(), id: "imp_6c19", status: "done", fileName: "catalogo-agosto.xlsx", totalRows: 780, validRows: 771, errorRows: 9, createdRows: 771, updatedRows: 0, createdAt: isoAtLocalTime(32, "10:14"), finishedAt: isoAtLocalTime(32, "10:16") },
  { ...mockImportJob(), id: "imp_71b4", status: "done", fileName: "reposicao-setembro.csv", totalRows: 118, validRows: 118, errorRows: 0, createdRows: 24, updatedRows: 94, createdAt: isoAtLocalTime(9, "15:40"), finishedAt: isoAtLocalTime(9, "15:41") },
  { ...mockImportJob(), id: "imp_7a03", status: "failed", fileName: "produtos-corrigido.csv", totalRows: 412, validRows: 0, errorRows: 412, createdRows: 0, updatedRows: 0, createdAt: isoAtLocalTime(5, "08:57"), finishedAt: isoAtLocalTime(5, "08:57") },
])
