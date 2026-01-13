"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ConfigurationItem } from "@/lib/supabase/types"

export const fetchConfigurationItems = async () => {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("configuration_items")
    .select("*")
    .order("commission", { ascending: true })

  if (error) {
    throw error
  }

  return data as ConfigurationItem[]
}
