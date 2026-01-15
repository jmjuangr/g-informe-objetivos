"use client"

import { useEffect, useState } from "react"
import { fetchItemsForInstructionAndWorkLine } from "@/lib/supabase/queries"
import type { ObjectiveItem } from "@/lib/supabase/types"

type UseObjectiveItemsOptions = {
  enabled?: boolean
  fallback?: ObjectiveItem[]
}

export const useObjectiveItems = (
  instructionId: string,
  workLineId: string,
  options: UseObjectiveItemsOptions = {},
) => {
  const { enabled = true, fallback = [] } = options
  const [data, setData] = useState<ObjectiveItem[]>(fallback)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(
    enabled && Boolean(instructionId) && Boolean(workLineId),
  )

  useEffect(() => {
    if (!enabled || !instructionId || !workLineId) {
      setData(fallback)
      setError(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    fetchItemsForInstructionAndWorkLine(instructionId, workLineId)
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
  }, [enabled, fallback, instructionId, workLineId])

  return { data, error, loading }
}
