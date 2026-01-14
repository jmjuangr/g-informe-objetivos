export type ConfigurationItem = {
  id: string
  created_at: string
  commission: string
  instruction: string
  matter: string
  submatter: string
  work_line: string | null
  item_objective: string | null
  item_objective_2: string | null
  status: string | null
}

export type ConfigurationItemRecord = {
  id: string
  created_at: string
  instruction_id: string | null
  item_objective: string | null
  commission: string | null
  instruction: string | null
  matter: string | null
  submatter: string | null
  work_line_id: string | null
  work_line: string | null
  work_line_unified: string | null
  item_id: string | null
  item_objective_2: string | null
  status: string | null
}
