"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type {
  ConfigurationItem,
  ConfigurationItemInput,
  ConfigurationItemRecord,
} from "@/lib/supabase/types"

const normalizeConfigurationItem = (
  item: ConfigurationItemRecord,
): ConfigurationItem | null => {
  if (
    !item.commission ||
    !item.instruction ||
    !item.matter ||
    !item.submatter
  ) {
    return null
  }

  return {
    id: item.id,
    created_at: item.created_at,
    instruction_id: item.instruction_id ?? null,
    work_line_id: item.work_line_id ?? null,
    item_id: item.item_id ?? null,
    commission: item.commission,
    instruction: item.instruction,
    matter: item.matter,
    submatter: item.submatter,
    work_line: item.work_line_unified ?? item.work_line ?? null,
    item_objective: item.item_objective ?? null,
    item_objective_2: item.item_objective_2 ?? null,
    status: item.status ?? null,
    year: item.year ?? 2026,
  }
}

export const fetchConfigurationItems = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("configuration_items")
    .select("*")

  if (error) {
    throw error
  }

  const normalized = ((data ?? []) as ConfigurationItemRecord[])
    .map((item) => normalizeConfigurationItem(item))
    .filter((item): item is ConfigurationItem => Boolean(item))
    .sort((a, b) => a.commission.localeCompare(b.commission))

  return normalized
}

export const fetchConfigurationItemsRaw = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("configuration_items")
    .select("*")
    .order("commission", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as ConfigurationItemRecord[]
}

export const createConfigurationItem = async (
  payload: ConfigurationItemInput,
) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("configuration_items")
    .insert(payload as never)
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as ConfigurationItemRecord
}

export const updateConfigurationItem = async (
  id: string,
  payload: ConfigurationItemInput,
) => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("configuration_items")
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as ConfigurationItemRecord
}

export const deleteConfigurationItem = async (id: string) => {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from("configuration_items")
    .delete()
    .eq("id", id)

  if (error) {
    throw error
  }
}
