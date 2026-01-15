import type { ObjectiveItem } from "@/lib/supabase/types"

export type CsvMetadata = {
  entity: string
  manager: string
}

export type CsvItemSelection = {
  item: ObjectiveItem
  deadline: string
  observations: string
}

const METADATA_HEADERS = ["Entidad", "Gestor"]
const ITEM_HEADERS = [
  "Comisión",
  "Instrucción",
  "Materia",
  "Submateria",
  "Línea de Trabajo",
  "Objetivo",
  "Objetivo 2",
  "Observaciones",
  "Plazo",
]

export const buildCsvHeaders = () => [...METADATA_HEADERS, ...ITEM_HEADERS]

export const buildCsvRows = (
  metadata: CsvMetadata,
  selections: CsvItemSelection[],
) => {
  return selections.map(({ item, deadline, observations }) => [
    metadata.entity,
    metadata.manager,
    item.commission ?? "",
    item.instruction,
    item.matter ?? "",
    item.submatter ?? "",
    item.work_line ?? "",
    item.item_objective ?? "",
    item.item_objective_2 ?? "",
    observations,
    deadline,
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
