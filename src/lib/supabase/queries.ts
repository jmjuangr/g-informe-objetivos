"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type {
  CommissionRecord,
  InstructionOption,
  InstructionRecord,
  ItemObjetivoInput,
  ItemObjetivoRecord,
  ItemsExportRecord,
  MatterRecord,
  ObjectiveItem,
  SubmatterRecord,
  WorkLineOption,
  WorkLineRecord,
} from "@/lib/supabase/types"

const normalizeObjectiveItem = (item: ItemsExportRecord): ObjectiveItem | null => {
  if (!item.instruction || !item.title) {
    return null
  }

  return {
    id: item.item_uuid,
    item_id: item.item_code ?? null,
    commission: item.commission ?? null,
    instruction: item.instruction,
    matter: item.matter ?? null,
    submatter: item.submatter ?? null,
    work_line: item.work_line ?? null,
    work_line_id: item.work_line_id ?? null,
    item_objective: item.title ?? null,
    item_objective_2: null,
    status: item.status ?? null,
    year: item.year ?? 2026,
  }
}

export const fetchInstructions = async (): Promise<InstructionOption[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("instructions")
    .select("id,name,commission:commissions(name)")
    .order("name", { ascending: true })

  if (error) {
    throw error
  }

  const rows =
    (data as Array<{
      id: string
      name: string
      commission?: { name?: string } | null
    }>) ?? []

  return rows.map((item) => ({
    id: item.id,
    label: item.name,
    commission: item.commission?.name ?? null,
  }))
}

export const fetchWorkLinesForInstruction = async (
  instructionId: string,
): Promise<WorkLineOption[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("items_objetivo")
    .select("work_line_id, work_lines(id, display_name, code, sort_order)")
    .eq("instruction_id", instructionId)
    .or("status.is.null,status.neq.ELIMINAR")

  if (error) {
    throw error
  }

  const map = new Map<string, WorkLineOption>()
  ;(data ?? []).forEach((row) => {
    const workLine = (row as { work_lines?: WorkLineRecord }).work_lines
    if (!workLine) return
    if (!map.has(workLine.id)) {
      map.set(workLine.id, {
        id: workLine.id,
        label: workLine.display_name,
        code: workLine.code,
        sort_order: workLine.sort_order ?? null,
      })
    }
  })

  return Array.from(map.values()).sort((a, b) => {
    const orderA = a.sort_order ?? 999
    const orderB = b.sort_order ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a.label.localeCompare(b.label)
  })
}

export const fetchItemsForInstructionAndWorkLine = async (
  instructionId: string,
  workLineId: string,
): Promise<ObjectiveItem[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("v_items_export")
    .select("*")
    .eq("instruction_id", instructionId)
    .eq("work_line_id", workLineId)
    .or("status.is.null,status.neq.ELIMINAR")
    .order("title", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? [])
    .map((item) => normalizeObjectiveItem(item as ItemsExportRecord))
    .filter((item): item is ObjectiveItem => Boolean(item))
}

export const fetchItemsExport = async (): Promise<ItemsExportRecord[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("v_items_export")
    .select("*")
    .order("instruction", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as ItemsExportRecord[]
}

export const fetchAllObjectiveItems = async (): Promise<ObjectiveItem[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("v_items_export")
    .select("*")
    .or("status.is.null,status.neq.ELIMINAR")
    .order("instruction", { ascending: true })
    .order("work_line", { ascending: true })
    .order("title", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? [])
    .map((item) => normalizeObjectiveItem(item as ItemsExportRecord))
    .filter((item): item is ObjectiveItem => Boolean(item))
}

export const fetchCommissions = async (): Promise<CommissionRecord[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("commissions")
    .select("id,name")
    .order("name", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as CommissionRecord[]
}

export const fetchInstructionsByCommission = async (
  commissionId: string,
): Promise<InstructionRecord[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("instructions")
    .select("id,commission_id,name,legacy_instruction_id")
    .eq("commission_id", commissionId)
    .order("name", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as InstructionRecord[]
}

export const fetchInstructionById = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("instructions")
    .select("id,commission_id,name,legacy_instruction_id")
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  return data as InstructionRecord
}

export const fetchMattersByInstruction = async (
  instructionId: string,
): Promise<MatterRecord[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("matters")
    .select("id,instruction_id,name")
    .eq("instruction_id", instructionId)
    .order("name", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as MatterRecord[]
}

export const fetchSubmattersByMatter = async (
  matterId: string,
): Promise<SubmatterRecord[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("submatters")
    .select("id,matter_id,name")
    .eq("matter_id", matterId)
    .order("name", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as SubmatterRecord[]
}

export const fetchSubmatterById = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("submatters")
    .select("id,matter_id,name")
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  return data as SubmatterRecord
}

export const fetchWorkLines = async (): Promise<WorkLineRecord[]> => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("work_lines")
    .select("id,code,display_name,sort_order")
    .order("sort_order", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as WorkLineRecord[]
}

export const createItemObjetivo = async (payload: ItemObjetivoInput) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("items_objetivo")
    .insert(payload as never)
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as ItemObjetivoRecord
}

export const updateItemObjetivo = async (
  id: string,
  payload: ItemObjetivoInput,
) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("items_objetivo")
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as ItemObjetivoRecord
}

export const deleteItemObjetivo = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from("items_objetivo")
    .delete()
    .eq("id", id)

  if (error) {
    throw error
  }
}

export const fetchItemObjetivoById = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("items_objetivo")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  return data as ItemObjetivoRecord
}
