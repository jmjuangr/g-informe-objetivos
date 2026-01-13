"use client"

import { createClient } from "@supabase/supabase-js"

let browserClient: ReturnType<typeof createClient> | null = null

const getEnv = (
  key: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is required to initialize Supabase`)
  }
  return value
}

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createClient(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )
  }
  return browserClient
}
