"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ConfigurationItem, ConfigurationItemRecord } from "@/lib/supabase/types"

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
    commission: item.commission,
    instruction: item.instruction,
    matter: item.matter,
    submatter: item.submatter,
    work_line: item.work_line_unified ?? item.work_line ?? null,
    item_objective: item.item_objective ?? null,
    item_objective_2: item.item_objective_2 ?? null,
    status: item.status ?? null,
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
