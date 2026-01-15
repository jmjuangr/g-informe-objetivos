"use client"

import { useEffect, useState } from "react"
import { fetchInstructions } from "@/lib/supabase/queries"
import type { InstructionOption } from "@/lib/supabase/types"

type UseInstructionsOptions = {
  enabled?: boolean
  fallback?: InstructionOption[]
}

export const useInstructions = (options: UseInstructionsOptions = {}) => {
  const { enabled = true, fallback = [] } = options
  const [data, setData] = useState<InstructionOption[]>(fallback)
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
    fetchInstructions()
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
