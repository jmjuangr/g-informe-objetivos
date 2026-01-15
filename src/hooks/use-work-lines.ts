"use client"

import { useEffect, useState } from "react"
import { fetchWorkLinesForInstruction } from "@/lib/supabase/queries"
import type { WorkLineOption } from "@/lib/supabase/types"

type UseWorkLinesOptions = {
  enabled?: boolean
  fallback?: WorkLineOption[]
}

export const useWorkLines = (
  instructionId: string,
  options: UseWorkLinesOptions = {},
) => {
  const { enabled = true, fallback = [] } = options
  const [data, setData] = useState<WorkLineOption[]>(fallback)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(enabled && Boolean(instructionId))

  useEffect(() => {
    if (!enabled || !instructionId) {
      setData(fallback)
      setError(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    fetchWorkLinesForInstruction(instructionId)
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
  }, [enabled, fallback, instructionId])

  return { data, error, loading }
}
