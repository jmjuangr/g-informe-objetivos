export type InstructionOption = {
  id: string
  label: string
  commission: string | null
}

export type WorkLineOption = {
  id: string
  label: string
  code: string | null
  sort_order: number | null
}

export type ObjectiveItem = {
  id: string
  item_id: string | null
  commission: string | null
  instruction: string
  matter: string | null
  submatter: string | null
  work_line: string | null
  work_line_id: string | null
  item_objective: string | null
  item_objective_2: string | null
  status: string | null
  year: number
}

export type CommissionRecord = {
  id: string
  name: string
}

export type InstructionRecord = {
  id: string
  commission_id: string | null
  name: string
  legacy_instruction_id: string | null
}

export type MatterRecord = {
  id: string
  instruction_id: string
  name: string
}

export type SubmatterRecord = {
  id: string
  matter_id: string
  name: string
}

export type WorkLineRecord = {
  id: string
  code: string
  display_name: string
  sort_order: number | null
}

export type ItemObjetivoRecord = {
  id: string
  instruction_id: string
  submatter_id: string
  work_line_id: string
  title: string
  status: string | null
  year: number | null
  legacy_item_code: string | null
}

export type ItemObjetivoInput = {
  instruction_id: string
  submatter_id: string
  work_line_id: string
  title: string
  status: string | null
  year: number
  legacy_item_code: string | null
}

export type ItemsExportRecord = {
  item_uuid: string
  item_code: string | null
  title: string | null
  status: string | null
  year: number | null
  instruction_id: string
  instruction: string | null
  commission: string | null
  matter: string | null
  submatter: string | null
  work_line_id: string | null
  work_line_code: string | null
  work_line: string | null
}
