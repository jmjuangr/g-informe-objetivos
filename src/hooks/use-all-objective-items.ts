"use client"

import { useEffect, useState } from "react"
import { fetchAllObjectiveItems } from "@/lib/supabase/queries"
import type { ObjectiveItem } from "@/lib/supabase/types"

type UseAllObjectiveItemsOptions = {
  enabled?: boolean
  fallback?: ObjectiveItem[]
}

export const useAllObjectiveItems = (options: UseAllObjectiveItemsOptions = {}) => {
  const { enabled = true, fallback = [] } = options
  const [data, setData] = useState<ObjectiveItem[]>(fallback)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setData(fallback)
      setError(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    fetchAllObjectiveItems()
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
  }, [enabled, fallback])

  return { data, error, loading }
}
