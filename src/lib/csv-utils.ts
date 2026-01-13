import type { ConfigurationItem } from "@/lib/supabase/types"

export type CsvMetadata = {
  entity: string
  manager: string
  deadline: string
}

const METADATA_HEADERS = ["Entidad", "Gestor", "Plazo"]
const ITEM_HEADERS = [
  "Comisión",
  "Instrucción",
  "Materia",
  "Submateria",
  "Línea de trabajo",
  "Año",
]

export const buildCsvHeaders = () => [...METADATA_HEADERS, ...ITEM_HEADERS]

export const buildCsvRows = (
  metadata: CsvMetadata,
  items: ConfigurationItem[],
) => {
  return items.map((item) => [
    metadata.entity,
    metadata.manager,
    metadata.deadline,
    item.commission,
    item.instruction,
    item.matter,
    item.submatter,
    item.work_line ?? "",
    String(item.year),
  ])
}

const escapeCsvValue = (value: string) => {
  const needsQuotes = /[",\n\r]/.test(value)
  if (!needsQuotes) return value
  return `"${value.replace(/"/g, '""')}"`
}

export const stringifyCsv = (rows: string[][]) => {
  return rows
    .map((row) => row.map((value) => escapeCsvValue(value ?? "")).join(","))
    .join("\r\n")
}

export const triggerCsvDownload = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
