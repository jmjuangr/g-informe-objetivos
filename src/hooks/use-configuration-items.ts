"use client"

import { useEffect, useState } from "react"
import { fetchConfigurationItems } from "@/lib/supabase/queries"
import type { ConfigurationItem } from "@/lib/supabase/types"

type UseConfigurationItemsOptions = {
  enabled?: boolean
}

export const useConfigurationItems = (
  options: UseConfigurationItemsOptions = {},
) => {
  const { enabled = true } = options
  const [data, setData] = useState<ConfigurationItem[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let active = true

    setLoading(true)
    fetchConfigurationItems()
      .then((items) => {
        if (!active) return
        setData(items)
        setError(null)
      })
      .catch((err: Error) => {
        if (!active) return
        setError(err)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled])

  return { data, error, loading }
}
